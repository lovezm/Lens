use std::sync::atomic::AtomicBool;
use std::sync::Mutex;
use tauri_plugin_global_shortcut::Shortcut;

#[derive(Default)]
pub struct ShortcutStore {
    pub search: Mutex<Option<Shortcut>>,
    pub clipboard: Mutex<Option<Shortcut>>,
}

#[derive(Default)]
pub struct ClipboardSettings {
    /// Whether to record file copies (defaults to false)
    pub record_files: AtomicBool,
}
