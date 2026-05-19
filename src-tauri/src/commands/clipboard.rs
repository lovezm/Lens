use crate::clipboard::monitor::LAST_SELF_WRITE_COUNT;
use crate::clipboard::pasteboard;
use crate::clipboard::storage;
use crate::clipboard::types::{Clip, ClipKind};
use crate::db::{paths, Db};
use crate::state::ClipboardSettings;
use std::sync::atomic::Ordering;
use tauri::{AppHandle, State};

#[derive(serde::Deserialize)]
pub struct ListArgs {
    pub query: Option<String>,
    pub kind: Option<String>,
    pub limit: Option<i64>,
}

#[tauri::command]
pub fn clipboard_list(
    db: State<Db>,
    args: ListArgs,
) -> Result<Vec<Clip>, String> {
    let conn = db.0.lock().unwrap();
    let kind = args.kind.as_deref().and_then(ClipKind::from_str);
    storage::list(
        &conn,
        args.query.as_deref().unwrap_or(""),
        kind,
        args.limit.unwrap_or(200),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clipboard_paste(app: AppHandle, db: State<Db>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    let clip = storage::get(&conn, id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "clip not found".to_string())?;

    let paths = paths(&app)?;
    let new_count = match clip.kind {
        ClipKind::Text => {
            let text = clip.text_content.unwrap_or_default();
            pasteboard::write_text(&text)
        }
        ClipKind::File => {
            let path = clip.text_content.unwrap_or_default();
            pasteboard::write_file_url(&path)
        }
        ClipKind::Image => {
            let rel = clip.image_path.ok_or("image path missing")?;
            let file = paths.root.join(rel);
            let bytes = std::fs::read(file).map_err(|e| e.to_string())?;
            pasteboard::write_image_bytes(&bytes)
        }
    };
    LAST_SELF_WRITE_COUNT.store(new_count, Ordering::SeqCst);

    // Bump updated_at so this item floats to the top
    use rusqlite::params;
    let _ = conn.execute(
        "UPDATE clips SET updated_at = ?1 WHERE id = ?2",
        params![now_ms(), id],
    );
    Ok(())
}

#[tauri::command]
pub fn clipboard_delete(app: AppHandle, db: State<Db>, id: i64) -> Result<(), String> {
    let paths = paths(&app)?;
    let conn = db.0.lock().unwrap();
    storage::delete(&conn, &paths, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clipboard_clear(app: AppHandle, db: State<Db>) -> Result<(), String> {
    let paths = paths(&app)?;
    let conn = db.0.lock().unwrap();
    storage::clear(&conn, &paths).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clipboard_toggle_pin(db: State<Db>, id: i64) -> Result<(), String> {
    let conn = db.0.lock().unwrap();
    storage::toggle_pin(&conn, id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clipboard_prune(
    app: AppHandle,
    db: State<Db>,
    retention_days: Option<i64>,
) -> Result<(), String> {
    let paths = paths(&app)?;
    let conn = db.0.lock().unwrap();
    storage::prune(&conn, &paths, retention_days).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clipboard_set_record_files(settings: State<ClipboardSettings>, enabled: bool) {
    settings.record_files.store(enabled, Ordering::SeqCst);
}

/// Returns the absolute path on disk for a clip's image (for the webview to load via convertFileSrc).
#[tauri::command]
pub fn clipboard_image_path(app: AppHandle, relative: String) -> Result<String, String> {
    let paths = paths(&app)?;
    Ok(paths.root.join(relative).to_string_lossy().into_owned())
}

fn now_ms() -> i64 {
    use std::time::{SystemTime, UNIX_EPOCH};
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}
