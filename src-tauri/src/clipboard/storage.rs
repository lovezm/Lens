use crate::clipboard::types::{CapturedClip, Clip, ClipKind};
use crate::db::Paths;
use rusqlite::{params, Connection};
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

fn now_ms() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

fn image_file_path(paths: &Paths, hash: &str) -> PathBuf {
    paths.images_dir.join(format!("{hash}.png"))
}

fn relative_image_path(hash: &str) -> String {
    format!("clipboard_images/{hash}.png")
}

/// Insert (or bump timestamp if duplicate). Returns the row id and whether it was newly inserted.
pub fn upsert(
    conn: &Connection,
    paths: &Paths,
    captured: &CapturedClip,
) -> rusqlite::Result<(i64, bool)> {
    let now = now_ms();

    // Try update first (existing hash → bump updated_at)
    let updated = conn.execute(
        "UPDATE clips SET updated_at = ?1 WHERE hash = ?2",
        params![now, captured.hash],
    )?;
    if updated > 0 {
        let id: i64 = conn.query_row(
            "SELECT id FROM clips WHERE hash = ?1",
            params![captured.hash],
            |r| r.get(0),
        )?;
        return Ok((id, false));
    }

    // Save image bytes to file
    let image_path_rel = if let Some(bytes) = &captured.image_bytes {
        let file = image_file_path(paths, &captured.hash);
        if !file.exists() {
            std::fs::write(&file, bytes).map_err(|e| {
                rusqlite::Error::ToSqlConversionFailure(Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e,
                )))
            })?;
        }
        Some(relative_image_path(&captured.hash))
    } else {
        None
    };

    conn.execute(
        "INSERT INTO clips (kind, hash, text_content, image_path, source_bundle_id, source_name, created_at, updated_at, byte_size)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7, ?8)",
        params![
            captured.kind.as_str(),
            captured.hash,
            captured.text_content,
            image_path_rel,
            captured.source_bundle_id,
            captured.source_name,
            now,
            captured.byte_size,
        ],
    )?;
    Ok((conn.last_insert_rowid(), true))
}

fn row_to_clip(row: &rusqlite::Row) -> rusqlite::Result<Clip> {
    let kind_str: String = row.get("kind")?;
    Ok(Clip {
        id: row.get("id")?,
        kind: ClipKind::from_str(&kind_str).unwrap_or(ClipKind::Text),
        hash: row.get("hash")?,
        text_content: row.get("text_content")?,
        image_path: row.get("image_path")?,
        source_bundle_id: row.get("source_bundle_id")?,
        source_name: row.get("source_name")?,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        pinned: row.get::<_, i64>("pinned")? != 0,
        byte_size: row.get("byte_size")?,
    })
}

pub fn list(
    conn: &Connection,
    query: &str,
    kind_filter: Option<ClipKind>,
    limit: i64,
) -> rusqlite::Result<Vec<Clip>> {
    let q = query.trim();
    let has_query = !q.is_empty();
    let has_kind = kind_filter.is_some();

    let mut sql = String::from(
        "SELECT id, kind, hash, text_content, image_path, source_bundle_id, source_name,
                created_at, updated_at, pinned, byte_size
         FROM clips WHERE 1=1",
    );
    if has_query {
        sql.push_str(" AND text_content LIKE ?1");
    }
    if has_kind {
        if has_query {
            sql.push_str(" AND kind = ?2");
        } else {
            sql.push_str(" AND kind = ?1");
        }
    }
    sql.push_str(" ORDER BY pinned DESC, updated_at DESC LIMIT ?");
    if has_query && has_kind {
        sql.push_str("3");
    } else if has_query || has_kind {
        sql.push_str("2");
    } else {
        sql.push_str("1");
    }

    let like = format!("%{q}%");
    let kind_str = kind_filter.map(|k| k.as_str());

    let mut stmt = conn.prepare(&sql)?;
    let rows: Vec<Clip> = match (has_query, has_kind) {
        (true, true) => stmt
            .query_map(params![like, kind_str.unwrap(), limit], row_to_clip)?
            .collect::<Result<_, _>>()?,
        (true, false) => stmt
            .query_map(params![like, limit], row_to_clip)?
            .collect::<Result<_, _>>()?,
        (false, true) => stmt
            .query_map(params![kind_str.unwrap(), limit], row_to_clip)?
            .collect::<Result<_, _>>()?,
        (false, false) => stmt
            .query_map(params![limit], row_to_clip)?
            .collect::<Result<_, _>>()?,
    };
    Ok(rows)
}

pub fn get(conn: &Connection, id: i64) -> rusqlite::Result<Option<Clip>> {
    let mut stmt = conn.prepare(
        "SELECT id, kind, hash, text_content, image_path, source_bundle_id, source_name,
                created_at, updated_at, pinned, byte_size
         FROM clips WHERE id = ?1",
    )?;
    let mut rows = stmt.query(params![id])?;
    if let Some(row) = rows.next()? {
        Ok(Some(row_to_clip(row)?))
    } else {
        Ok(None)
    }
}

pub fn delete(conn: &Connection, paths: &Paths, id: i64) -> rusqlite::Result<()> {
    if let Some(clip) = get(conn, id)? {
        if let Some(rel) = clip.image_path {
            let file = paths.root.join(&rel);
            let _ = std::fs::remove_file(file);
        }
    }
    conn.execute("DELETE FROM clips WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn clear(conn: &Connection, paths: &Paths) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM clips", [])?;
    let _ = std::fs::remove_dir_all(&paths.images_dir);
    let _ = std::fs::create_dir_all(&paths.images_dir);
    Ok(())
}

pub fn toggle_pin(conn: &Connection, id: i64) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE clips SET pinned = 1 - pinned WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}

/// Delete entries older than the given retention. None = forever.
pub fn prune(
    conn: &Connection,
    paths: &Paths,
    retention_days: Option<i64>,
) -> rusqlite::Result<()> {
    let Some(days) = retention_days else {
        return Ok(());
    };
    let cutoff = now_ms() - days * 24 * 60 * 60 * 1000;
    let mut stmt = conn.prepare("SELECT image_path FROM clips WHERE updated_at < ?1 AND pinned = 0")?;
    let image_paths: Vec<Option<String>> = stmt
        .query_map(params![cutoff], |r| r.get(0))?
        .collect::<Result<_, _>>()?;
    for p in image_paths.into_iter().flatten() {
        let _ = std::fs::remove_file(paths.root.join(p));
    }
    conn.execute(
        "DELETE FROM clips WHERE updated_at < ?1 AND pinned = 0",
        params![cutoff],
    )?;
    Ok(())
}
