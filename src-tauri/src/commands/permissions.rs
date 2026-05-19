use std::process::Command;

#[tauri::command]
pub async fn check_accessibility_permission() -> bool {
    tokio::task::spawn_blocking(|| {
        #[cfg(target_os = "macos")]
        {
            let output = Command::new("osascript")
                .arg("-e")
                .arg("tell application \"System Events\" to get name of first process")
                .output();
            output.map(|o| o.status.success()).unwrap_or(false)
        }
        #[cfg(not(target_os = "macos"))]
        {
            true
        }
    })
    .await
    .unwrap_or(false)
}

#[tauri::command]
pub async fn check_full_disk_access() -> bool {
    tokio::task::spawn_blocking(|| {
        #[cfg(target_os = "macos")]
        {
            // TCC.db is only readable with Full Disk Access. This is the
            // canonical probe used by most macOS launchers.
            let candidates = [
                "/Library/Application Support/com.apple.TCC/TCC.db".to_string(),
                format!(
                    "{}/Library/Application Support/com.apple.TCC/TCC.db",
                    std::env::var("HOME").unwrap_or_default()
                ),
            ];
            for path in &candidates {
                if std::path::Path::new(path).exists() {
                    if std::fs::File::open(path).is_ok() {
                        return true;
                    }
                }
            }
            false
        }
        #[cfg(not(target_os = "macos"))]
        {
            true
        }
    })
    .await
    .unwrap_or(false)
}

#[tauri::command]
pub fn open_accessibility_settings() {
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")
            .spawn();
    }
}

#[tauri::command]
pub fn open_full_disk_access_settings() {
    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles")
            .spawn();
    }
}

#[tauri::command]
pub fn reveal_executable_in_finder() -> Result<(), String> {
    let exe = std::env::current_exe().map_err(|e| e.to_string())?;
    Command::new("open")
        .args(["-R", exe.to_str().ok_or("invalid path")?])
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}
