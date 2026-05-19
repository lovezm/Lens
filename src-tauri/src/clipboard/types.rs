use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ClipKind {
    Text,
    Image,
    File,
}

impl ClipKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            ClipKind::Text => "text",
            ClipKind::Image => "image",
            ClipKind::File => "file",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "text" => Some(ClipKind::Text),
            "image" => Some(ClipKind::Image),
            "file" => Some(ClipKind::File),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Clip {
    pub id: i64,
    pub kind: ClipKind,
    pub hash: String,
    pub text_content: Option<String>,
    pub image_path: Option<String>,
    pub source_bundle_id: Option<String>,
    pub source_name: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub pinned: bool,
    pub byte_size: i64,
}

/// Newly captured data from the pasteboard, before persisting.
pub struct CapturedClip {
    pub kind: ClipKind,
    pub hash: String,
    pub text_content: Option<String>,
    pub image_bytes: Option<Vec<u8>>,
    pub source_bundle_id: Option<String>,
    pub source_name: Option<String>,
    pub byte_size: i64,
}
