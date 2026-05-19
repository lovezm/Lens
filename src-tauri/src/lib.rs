mod clipboard;
mod commands;
mod db;
mod state;

use commands::{
    clipboard::{
        clipboard_clear, clipboard_delete, clipboard_image_path, clipboard_list, clipboard_paste,
        clipboard_prune, clipboard_set_record_files, clipboard_toggle_pin,
    },
    icon::get_file_icon,
    permissions::{
        check_accessibility_permission, check_full_disk_access, open_accessibility_settings,
        open_full_disk_access_settings, reveal_executable_in_finder,
    },
    search::{open_path, search_items},
    shortcut::{register_search_shortcut, register_shortcut},
    updater::check_for_updates,
    window::{
        hide_clipboard_window, hide_search_window, resize_search_window, show_clipboard_window,
        show_search_window, toggle_clipboard_window, toggle_search_window,
    },
};
use db::Db;
use state::{ClipboardSettings, ShortcutStore};
use std::sync::Arc;
use std::sync::Mutex;
use tauri::{Manager, WindowEvent};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_global_shortcut::ShortcutState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // Another launch attempt → bring settings to front instead of starting a duplicate
            if let Some(win) = app.get_webview_window("settings") {
                let _ = win.show();
                let _ = win.unminimize();
                let _ = win.set_focus();
            }
        }))
        .manage(ShortcutStore::default())
        .manage(ClipboardSettings::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state != ShortcutState::Pressed {
                        return;
                    }
                    let store = app.state::<ShortcutStore>();
                    let search_match = store
                        .search
                        .lock()
                        .unwrap()
                        .as_ref()
                        .map(|s| s == shortcut)
                        .unwrap_or(false);
                    let clipboard_match = store
                        .clipboard
                        .lock()
                        .unwrap()
                        .as_ref()
                        .map(|s| s == shortcut)
                        .unwrap_or(false);

                    if search_match {
                        if let Some(win) = app.get_webview_window("search") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                show_search_window(app);
                            }
                        }
                    } else if clipboard_match {
                        if let Some(win) = app.get_webview_window("clipboard") {
                            if win.is_visible().unwrap_or(false) {
                                let _ = win.hide();
                            } else {
                                show_clipboard_window(app);
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

            // DB + paths
            let paths = db::paths(app.handle())?;
            let conn = db::init(&paths.db_file)?;
            app.manage(Db(Mutex::new(conn)));

            let paths_arc = Arc::new(paths);

            // Start clipboard monitor
            clipboard::monitor::start(app.handle().clone(), paths_arc.clone());

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

            // Hide search/clipboard windows on focus loss (click outside)
            for label in ["search", "clipboard"] {
                if let Some(win) = app.get_webview_window(label) {
                    let win_clone = win.clone();
                    win.on_window_event(move |event| {
                        if let WindowEvent::Focused(false) = event {
                            let _ = win_clone.hide();
                        }
                    });
                }
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
            register_shortcut,
            toggle_search_window,
            hide_search_window,
            resize_search_window,
            toggle_clipboard_window,
            hide_clipboard_window,
            get_file_icon,
            clipboard_list,
            clipboard_paste,
            clipboard_delete,
            clipboard_clear,
            clipboard_toggle_pin,
            clipboard_prune,
            clipboard_set_record_files,
            clipboard_image_path,
            check_for_updates,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, _event| {});
}
