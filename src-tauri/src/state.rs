use std::sync::Mutex;
use tauri_plugin_global_shortcut::Shortcut;

#[derive(Default)]
pub struct ShortcutStore(pub Mutex<Option<Shortcut>>);
