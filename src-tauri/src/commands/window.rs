use tauri::{
    AppHandle, Emitter, LogicalPosition, LogicalSize, Manager, Position, Runtime, Size,
    WebviewWindow,
};

pub const SEARCH_WIDTH: u32 = 680;
pub const SEARCH_INPUT_ONLY_HEIGHT: u32 = 64;
const SEARCH_TOP_RATIO: f64 = 0.22;

pub const CLIPBOARD_WIDTH: u32 = 880;
const CLIPBOARD_TOP_RATIO: f64 = 0.18;

fn position_search_window<R: Runtime>(win: &WebviewWindow<R>) {
    let Ok(Some(monitor)) = win.current_monitor() else {
        return;
    };
    let scale = monitor.scale_factor();
    let monitor_logical_w = monitor.size().width as f64 / scale;
    let monitor_logical_h = monitor.size().height as f64 / scale;
    let monitor_pos = monitor.position();
    let monitor_x = monitor_pos.x as f64 / scale;
    let monitor_y = monitor_pos.y as f64 / scale;

    let x = monitor_x + (monitor_logical_w - SEARCH_WIDTH as f64) / 2.0;
    let y = monitor_y + monitor_logical_h * SEARCH_TOP_RATIO;

    let _ = win.set_position(Position::Logical(LogicalPosition { x, y }));
}

pub fn show_search_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(win) = app.get_webview_window("search") {
        let _ = win.set_size(Size::Logical(LogicalSize {
            width: SEARCH_WIDTH as f64,
            height: SEARCH_INPUT_ONLY_HEIGHT as f64,
        }));
        position_search_window(&win);
        let _ = win.show();
        let _ = win.set_focus();
        let _ = app.emit("search:show", ());
    }
}

#[tauri::command]
pub fn toggle_search_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("search") {
        if win.is_visible().unwrap_or(false) {
            win.hide().map_err(|e| e.to_string())?;
        } else {
            show_search_window(&app);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn hide_search_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("search") {
        win.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn resize_search_window(app: AppHandle, height: u32) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("search") {
        win.set_size(Size::Logical(LogicalSize {
            width: SEARCH_WIDTH as f64,
            height: height as f64,
        }))
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn position_clipboard_window<R: Runtime>(win: &WebviewWindow<R>) {
    let Ok(Some(monitor)) = win.current_monitor() else {
        return;
    };
    let scale = monitor.scale_factor();
    let monitor_logical_w = monitor.size().width as f64 / scale;
    let monitor_logical_h = monitor.size().height as f64 / scale;
    let monitor_pos = monitor.position();
    let monitor_x = monitor_pos.x as f64 / scale;
    let monitor_y = monitor_pos.y as f64 / scale;

    let x = monitor_x + (monitor_logical_w - CLIPBOARD_WIDTH as f64) / 2.0;
    let y = monitor_y + monitor_logical_h * CLIPBOARD_TOP_RATIO;
    let _ = win.set_position(Position::Logical(LogicalPosition { x, y }));
}

pub fn show_clipboard_window<R: Runtime>(app: &AppHandle<R>) {
    if let Some(win) = app.get_webview_window("clipboard") {
        position_clipboard_window(&win);
        let _ = win.show();
        let _ = win.set_focus();
        let _ = app.emit("clipboard:show", ());
    }
}

#[tauri::command]
pub fn toggle_clipboard_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("clipboard") {
        if win.is_visible().unwrap_or(false) {
            win.hide().map_err(|e| e.to_string())?;
        } else {
            show_clipboard_window(&app);
        }
    }
    Ok(())
}

#[tauri::command]
pub fn hide_clipboard_window(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("clipboard") {
        win.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}
