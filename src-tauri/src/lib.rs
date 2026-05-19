mod commands;
mod state;

use commands::{
    icon::get_file_icon,
    permissions::{
        check_accessibility_permission, check_full_disk_access, open_accessibility_settings,
        open_full_disk_access_settings, reveal_executable_in_finder,
    },
    search::{open_path, search_items},
    shortcut::register_search_shortcut,
    window::{hide_search_window, resize_search_window, show_search_window, toggle_search_window},
};
use state::ShortcutStore;
use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::ShortcutState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .manage(ShortcutStore::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        if let Some(win) = app.get_webview_window("search") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                show_search_window(app);
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Hide dock icon — menu bar app like Alfred/Raycast
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            // Tray menu (Settings / Search / Quit)
            commands::tray::setup(app.handle())?;

            // Intercept settings window close → hide instead of quit
            if let Some(settings) = app.get_webview_window("settings") {
                let settings_clone = settings.clone();
                settings.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = settings_clone.hide();
                    }
                });
            }

            // Hide search window on blur (click outside)
            if let Some(search) = app.get_webview_window("search") {
                let search_clone = search.clone();
                search.on_window_event(move |event| {
                    if let WindowEvent::Focused(false) = event {
                        let _ = search_clone.hide();
                    }
                });
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            check_accessibility_permission,
            check_full_disk_access,
            open_accessibility_settings,
            open_full_disk_access_settings,
            reveal_executable_in_finder,
            search_items,
            open_path,
            register_search_shortcut,
            toggle_search_window,
            hide_search_window,
            resize_search_window,
            get_file_icon,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {});
}
