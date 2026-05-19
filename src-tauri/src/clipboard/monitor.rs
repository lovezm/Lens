use crate::clipboard::pasteboard;
use crate::clipboard::storage;
use crate::clipboard::types::ClipKind;
use crate::db::{Db, Paths};
use crate::state::ClipboardSettings;
use std::sync::atomic::{AtomicI64, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

const POLL_INTERVAL: Duration = Duration::from_millis(500);

/// Tracks the changeCount of clips we wrote ourselves so we don't re-record them.
pub static LAST_SELF_WRITE_COUNT: AtomicI64 = AtomicI64::new(-1);

pub fn start(app: AppHandle, paths: Arc<Paths>) {
    // Run a dedicated OS thread — independent of Tauri's async runtime,
    // which isn't initialised at the time setup() executes.
    std::thread::spawn(move || {
        let mut last_count: i64 = pasteboard::change_count();
        loop {
            std::thread::sleep(POLL_INTERVAL);

            let current = pasteboard::change_count();
            if current == last_count {
                continue;
            }
            if current == LAST_SELF_WRITE_COUNT.load(Ordering::SeqCst) {
                last_count = current;
                continue;
            }

            let Some(captured) = pasteboard::read_pasteboard() else {
                last_count = current;
                continue;
            };

            if captured.kind == ClipKind::File {
                let settings = app.state::<ClipboardSettings>();
                if !settings.record_files.load(Ordering::SeqCst) {
                    last_count = current;
                    continue;
                }
            }

            let db = app.state::<Db>();
            let conn = db.0.lock().unwrap();
            match storage::upsert(&conn, &paths, &captured) {
                Ok((_id, newly_inserted)) => {
                    if newly_inserted {
                        let _ = app.emit("clipboard:changed", ());
                    }
                }
                Err(e) => eprintln!("clipboard upsert failed: {e}"),
            }
            drop(conn);

            last_count = current;
        }
    });
}
