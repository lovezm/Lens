use crate::commands::window::{show_clipboard_window, show_search_window};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::{AppHandle, Listener, Manager, Runtime};
use tauri_plugin_store::StoreExt;

struct Labels {
    search: &'static str,
    clipboard: &'static str,
    settings: &'static str,
    quit: &'static str,
}

const ZH: Labels = Labels {
    search: "唤出搜索",
    clipboard: "剪切板历史",
    settings: "设置",
    quit: "退出 Lens",
};

const EN: Labels = Labels {
    search: "Open Search",
    clipboard: "Clipboard History",
    settings: "Settings",
    quit: "Quit Lens",
};

fn labels_for(lang: &str) -> &'static Labels {
    if lang == "en" {
        &EN
    } else {
        &ZH
    }
}

fn read_saved_lang<R: Runtime>(app: &AppHandle<R>) -> String {
    app.store("settings.json")
        .ok()
        .and_then(|s| s.get("language"))
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "zh".to_string())
}

fn build_menu<R: Runtime>(app: &AppHandle<R>, labels: &Labels) -> tauri::Result<Menu<R>> {
    let search_item = MenuItem::with_id(app, "tray:search", labels.search, true, None::<&str>)?;
    let clipboard_item =
        MenuItem::with_id(app, "tray:clipboard", labels.clipboard, true, None::<&str>)?;
    let settings_item =
        MenuItem::with_id(app, "tray:settings", labels.settings, true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "tray:quit", labels.quit, true, None::<&str>)?;

    Menu::with_items(
        app,
        &[
            &search_item,
            &clipboard_item,
            &settings_item,
            &separator,
            &quit_item,
        ],
    )
}

pub fn setup<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
    let lang = read_saved_lang(app);
    let menu = build_menu(app, labels_for(&lang))?;

    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(menu))?;
        tray.set_show_menu_on_left_click(true)?;

        let app_handle = app.clone();
        tray.on_menu_event(move |_, event| match event.id().as_ref() {
            "tray:search" => show_search_window(&app_handle),
            "tray:clipboard" => show_clipboard_window(&app_handle),
            "tray:settings" => show_settings_window(&app_handle),
            "tray:quit" => app_handle.exit(0),
            _ => {}
        });
    }

    // Cross-window language change → rebuild menu
    let app_handle = app.clone();
    app.listen("lang:changed", move |event| {
        let payload = event.payload();
        let lang: String =
            serde_json::from_str(payload).unwrap_or_else(|_| "zh".to_string());
        if let Ok(menu) = build_menu(&app_handle, labels_for(&lang)) {
            if let Some(tray) = app_handle.tray_by_id("main") {
                let _ = tray.set_menu(Some(menu));
            }
        }
    });

    Ok(())
}

pub fn show_settings_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(win) = app.get_webview_window("settings") {
        let _ = win.show();
        let _ = win.unminimize();
        let _ = win.set_focus();
    }
}
