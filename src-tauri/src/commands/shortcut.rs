use crate::state::ShortcutStore;
use tauri::{AppHandle, Runtime, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

#[derive(Debug, Clone, Copy, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShortcutKind {
    Search,
    Clipboard,
}

fn replace_slot<R: Runtime>(
    app: &AppHandle<R>,
    slot: &std::sync::Mutex<Option<Shortcut>>,
    new_shortcut: Option<Shortcut>,
) -> Result<(), String> {
    let mut guard = slot.lock().unwrap();
    if let Some(prev) = guard.take() {
        let _ = app.global_shortcut().unregister(prev);
    }
    if let Some(s) = new_shortcut {
        app.global_shortcut()
            .register(s.clone())
            .map_err(|e| e.to_string())?;
        *guard = Some(s);
    }
    Ok(())
}

#[tauri::command]
pub fn register_shortcut<R: Runtime>(
    app: AppHandle<R>,
    state: State<ShortcutStore>,
    kind: ShortcutKind,
    accelerator: Option<String>,
) -> Result<(), String> {
    let parsed = match &accelerator {
        Some(s) if !s.is_empty() => Some(s.parse::<Shortcut>().map_err(|e| format!("{e:?}"))?),
        _ => None,
    };
    let slot = match kind {
        ShortcutKind::Search => &state.search,
        ShortcutKind::Clipboard => &state.clipboard,
    };
    replace_slot(&app, slot, parsed)
}

/// Backward-compat alias for the original `register_search_shortcut` name.
#[tauri::command]
pub fn register_search_shortcut<R: Runtime>(
    app: AppHandle<R>,
    state: State<ShortcutStore>,
    accelerator: String,
) -> Result<(), String> {
    register_shortcut(app, state, ShortcutKind::Search, Some(accelerator))
}
