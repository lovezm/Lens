use rusqlite::Connection;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Manager};

pub struct Db(pub Mutex<Connection>);

pub struct Paths {
    pub root: PathBuf,
    pub db_file: PathBuf,
    pub images_dir: PathBuf,
}

pub fn paths(app: &AppHandle) -> Result<Paths, String> {
    let root = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir: {e}"))?;
    std::fs::create_dir_all(&root).map_err(|e| e.to_string())?;
    let images_dir = root.join("clipboard_images");
    std::fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    Ok(Paths {
        db_file: root.join("lens.db"),
        images_dir,
        root,
    })
}

pub fn init(db_file: &Path) -> rusqlite::Result<Connection> {
    let conn = Connection::open(db_file)?;
    conn.pragma_update(None, "journal_mode", "WAL")?;
    conn.pragma_update(None, "synchronous", "NORMAL")?;
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS clips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL,
            hash TEXT NOT NULL UNIQUE,
            text_content TEXT,
            image_path TEXT,
            source_bundle_id TEXT,
            source_name TEXT,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL,
            pinned INTEGER NOT NULL DEFAULT 0,
            byte_size INTEGER NOT NULL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_clips_updated ON clips(updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_clips_kind ON clips(kind);
        ",
    )?;
    Ok(conn)
}
