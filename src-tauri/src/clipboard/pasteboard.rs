use crate::clipboard::types::CapturedClip;
#[cfg(target_os = "macos")]
use crate::clipboard::types::ClipKind;
#[cfg(target_os = "macos")]
use sha2::{Digest, Sha256};

#[cfg(target_os = "macos")]
mod mac {
    use super::*;
    use objc2::rc::autoreleasepool;
    use objc2_app_kit::{
        NSBitmapImageFileType, NSBitmapImageRep, NSPasteboard, NSPasteboardTypeFileURL,
        NSPasteboardTypePNG, NSPasteboardTypeString, NSPasteboardTypeTIFF, NSWorkspace,
    };
    use objc2_foundation::{NSData, NSDictionary, NSString};

    pub fn change_count() -> i64 {
        autoreleasepool(|_| {
            let pb = NSPasteboard::generalPasteboard();
            pb.changeCount() as i64
        })
    }

    pub fn read_pasteboard() -> Option<CapturedClip> {
        autoreleasepool(|_| unsafe {
            let pb = NSPasteboard::generalPasteboard();

            // 1. PNG image
            if let Some(data) = pb.dataForType(NSPasteboardTypePNG) {
                let bytes = ns_data_to_vec(&data);
                if !bytes.is_empty() {
                    return Some(make_image_clip(bytes));
                }
            }

            // 2. TIFF image → convert to PNG
            if let Some(data) = pb.dataForType(NSPasteboardTypeTIFF) {
                if let Some(png) = tiff_to_png(&data) {
                    return Some(make_image_clip(png));
                }
            }

            // 3. File URL
            if let Some(url) = pb.stringForType(NSPasteboardTypeFileURL) {
                let url_str = url.to_string();
                let path = url_to_path(&url_str);
                if !path.is_empty() {
                    return Some(make_file_clip(path));
                }
            }

            // 4. Plain text
            if let Some(text) = pb.stringForType(NSPasteboardTypeString) {
                let text = text.to_string();
                if !text.trim().is_empty() {
                    return Some(make_text_clip(text));
                }
            }

            None
        })
    }

    pub fn write_text(text: &str) -> i64 {
        autoreleasepool(|_| unsafe {
            let pb = NSPasteboard::generalPasteboard();
            pb.clearContents();
            let ns = NSString::from_str(text);
            pb.setString_forType(&ns, NSPasteboardTypeString);
            pb.changeCount() as i64
        })
    }

    pub fn write_image_bytes(bytes: &[u8]) -> i64 {
        autoreleasepool(|_| unsafe {
            let pb = NSPasteboard::generalPasteboard();
            pb.clearContents();
            let data = NSData::with_bytes(bytes);
            pb.setData_forType(Some(&data), NSPasteboardTypePNG);
            pb.changeCount() as i64
        })
    }

    pub fn write_file_url(path: &str) -> i64 {
        autoreleasepool(|_| unsafe {
            let pb = NSPasteboard::generalPasteboard();
            pb.clearContents();
            let url_str = if path.starts_with("file://") {
                path.to_string()
            } else {
                format!("file://{path}")
            };
            let ns = NSString::from_str(&url_str);
            pb.setString_forType(&ns, NSPasteboardTypeFileURL);
            pb.changeCount() as i64
        })
    }

    pub fn frontmost_app() -> (Option<String>, Option<String>) {
        autoreleasepool(|_| {
            let workspace = NSWorkspace::sharedWorkspace();
            let Some(front) = workspace.frontmostApplication() else {
                return (None, None);
            };
            let bundle_id = front.bundleIdentifier().map(|s| s.to_string());
            let name = front.localizedName().map(|s| s.to_string());
            (bundle_id, name)
        })
    }

    fn ns_data_to_vec(data: &NSData) -> Vec<u8> {
        let len = data.length();
        if len == 0 {
            return Vec::new();
        }
        unsafe {
            let ptr = data.as_bytes_unchecked().as_ptr();
            std::slice::from_raw_parts(ptr, len).to_vec()
        }
    }

    fn tiff_to_png(tiff: &NSData) -> Option<Vec<u8>> {
        unsafe {
            let bitmap = NSBitmapImageRep::imageRepWithData(tiff)?;
            let empty: objc2::rc::Retained<NSDictionary<NSString, objc2::runtime::AnyObject>> =
                NSDictionary::new();
            let png =
                bitmap.representationUsingType_properties(NSBitmapImageFileType::PNG, &empty)?;
            Some(ns_data_to_vec(&png))
        }
    }

    fn url_to_path(url: &str) -> String {
        if let Some(rest) = url.strip_prefix("file://") {
            // Decode percent-encoding
            percent_decode(rest)
        } else {
            url.to_string()
        }
    }

    fn percent_decode(s: &str) -> String {
        let bytes = s.as_bytes();
        let mut out = Vec::with_capacity(bytes.len());
        let mut i = 0;
        while i < bytes.len() {
            if bytes[i] == b'%' && i + 2 < bytes.len() {
                if let Ok(byte) = u8::from_str_radix(
                    std::str::from_utf8(&bytes[i + 1..i + 3]).unwrap_or(""),
                    16,
                ) {
                    out.push(byte);
                    i += 3;
                    continue;
                }
            }
            out.push(bytes[i]);
            i += 1;
        }
        String::from_utf8_lossy(&out).trim_end_matches('\n').into()
    }

    fn make_text_clip(text: String) -> CapturedClip {
        let hash = hash_str(&text);
        let (bundle_id, name) = frontmost_app();
        CapturedClip {
            kind: ClipKind::Text,
            hash,
            byte_size: text.len() as i64,
            text_content: Some(text),
            image_bytes: None,
            source_bundle_id: bundle_id,
            source_name: name,
        }
    }

    fn make_file_clip(path: String) -> CapturedClip {
        let hash = hash_str(&format!("file:{path}"));
        let (bundle_id, name) = frontmost_app();
        CapturedClip {
            kind: ClipKind::File,
            hash,
            byte_size: path.len() as i64,
            text_content: Some(path),
            image_bytes: None,
            source_bundle_id: bundle_id,
            source_name: name,
        }
    }

    fn make_image_clip(bytes: Vec<u8>) -> CapturedClip {
        let hash = hash_bytes(&bytes);
        let (bundle_id, name) = frontmost_app();
        CapturedClip {
            kind: ClipKind::Image,
            hash,
            byte_size: bytes.len() as i64,
            text_content: None,
            image_bytes: Some(bytes),
            source_bundle_id: bundle_id,
            source_name: name,
        }
    }
}

#[cfg(target_os = "macos")]
fn hash_str(s: &str) -> String {
    hash_bytes(s.as_bytes())
}

#[cfg(target_os = "macos")]
fn hash_bytes(bytes: &[u8]) -> String {
    let mut h = Sha256::new();
    h.update(bytes);
    let out = h.finalize();
    let mut s = String::with_capacity(out.len() * 2);
    for byte in out.iter() {
        s.push_str(&format!("{byte:02x}"));
    }
    s
}

#[cfg(target_os = "macos")]
pub use mac::*;

#[cfg(not(target_os = "macos"))]
pub fn change_count() -> i64 {
    0
}

#[cfg(not(target_os = "macos"))]
pub fn read_pasteboard() -> Option<CapturedClip> {
    None
}

#[cfg(not(target_os = "macos"))]
pub fn write_text(_text: &str) -> i64 {
    0
}

#[cfg(not(target_os = "macos"))]
pub fn write_image_bytes(_bytes: &[u8]) -> i64 {
    0
}

#[cfg(not(target_os = "macos"))]
pub fn write_file_url(_path: &str) -> i64 {
    0
}
