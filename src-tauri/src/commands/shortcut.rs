use crate::state::ShortcutStore;
use tauri::{AppHandle, State};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

#[tauri::command]
pub fn register_search_shortcut(
    app: AppHandle,
    state: State<ShortcutStore>,
    accelerator: String,
) -> Result<(), String> {
    let parsed: Shortcut = accelerator.parse().map_err(|e| format!("{e:?}"))?;

    let mut current = state.0.lock().unwrap();
    if let Some(prev) = current.take() {
        let _ = app.global_shortcut().unregister(prev);
    }
    app.global_shortcut()
        .register(parsed.clone())
        .map_err(|e| e.to_string())?;
    *current = Some(parsed);
    Ok(())
}
