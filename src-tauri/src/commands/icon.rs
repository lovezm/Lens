use base64::Engine;

#[tauri::command]
pub async fn get_file_icon(path: String) -> Option<String> {
    tokio::task::spawn_blocking(move || icon_to_base64(&path))
        .await
        .ok()
        .flatten()
}

#[cfg(target_os = "macos")]
fn icon_to_base64(path: &str) -> Option<String> {
    use objc2::rc::autoreleasepool;
    use objc2_app_kit::{NSBitmapImageFileType, NSBitmapImageRep, NSWorkspace};
    use objc2_foundation::{NSDictionary, NSString};

    autoreleasepool(|_| unsafe {
        let workspace = NSWorkspace::sharedWorkspace();
        let ns_path = NSString::from_str(path);
        let image = workspace.iconForFile(&ns_path);
        let tiff = image.TIFFRepresentation()?;
        let bitmap = NSBitmapImageRep::imageRepWithData(&tiff)?;
        let empty: objc2::rc::Retained<NSDictionary<NSString, objc2::runtime::AnyObject>> =
            NSDictionary::new();
        let png = bitmap.representationUsingType_properties(NSBitmapImageFileType::PNG, &empty)?;

        let len = png.length();
        let bytes_ptr = png.as_bytes_unchecked().as_ptr();
        let slice = std::slice::from_raw_parts(bytes_ptr, len);
        Some(base64::engine::general_purpose::STANDARD.encode(slice))
    })
}

#[cfg(not(target_os = "macos"))]
fn icon_to_base64(_path: &str) -> Option<String> {
    None
}
