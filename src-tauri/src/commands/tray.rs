use crate::commands::window::show_search_window;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Manager, Runtime};

pub fn setup<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let search_item = MenuItem::with_id(app, "tray:search", "唤出搜索", true, Some("Alt+Space"))?;
    let settings_item = MenuItem::with_id(app, "tray:settings", "设置", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "tray:quit", "退出 Lens", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[&search_item, &settings_item, &separator, &quit_item],
    )?;

    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu))?;
        tray.set_show_menu_on_left_click(true)?;

        let app_handle = app.clone();
        tray.on_menu_event(move |_, event| match event.id().as_ref() {
            "tray:search" => {
                show_search_window(&app_handle);
            }
            "tray:settings" => {
                show_settings_window(&app_handle);
            }
            "tray:quit" => {
                app_handle.exit(0);
            }
            _ => {}
        });
    }
    Ok(())
}

pub fn show_settings_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}
