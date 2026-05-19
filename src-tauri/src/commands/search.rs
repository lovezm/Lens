use serde::Serialize;
use std::process::Command;

const MAX_RAW_RESULTS: usize = 300;
const MAX_FINAL_RESULTS: usize = 12;
const MIN_QUERY_LEN: usize = 2;

#[derive(Serialize, Clone)]
pub struct SearchResult {
    pub name: String,
    pub path: String,
    pub kind: String,
}

#[tauri::command]
pub async fn search_items(query: String) -> Vec<SearchResult> {
    let trimmed = query.trim().to_string();
    if trimmed.chars().count() < MIN_QUERY_LEN {
        return vec![];
    }

    tokio::task::spawn_blocking(move || run_search(&trimmed))
        .await
        .unwrap_or_default()
}

#[tauri::command]
pub fn open_path(path: String) -> Result<(), String> {
    Command::new("open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(target_os = "macos")]
fn run_search(query: &str) -> Vec<SearchResult> {
    let output = Command::new("mdfind").arg("-name").arg(query).output();
    let Ok(output) = output else {
        return vec![];
    };

    let stdout = String::from_utf8_lossy(&output.stdout);
    let lower = query.to_lowercase();

    let mut scored: Vec<(SearchResult, i64)> = stdout
        .lines()
        .take(MAX_RAW_RESULTS)
        .filter_map(|path| {
            let p = std::path::Path::new(path);
            let name = p.file_name()?.to_str()?.to_string();
            let name_lower = name.to_lowercase();

            let kind = if path.ends_with(".app") {
                "app"
            } else {
                "file"
            }
            .to_string();

            let mut score: i64 = 0;
            if kind == "app" {
                score += 10_000;
            }
            if name_lower == lower || name_lower == format!("{lower}.app") {
                score += 5_000;
            } else if name_lower.starts_with(&lower) {
                score += 2_000;
            } else if name_lower.contains(&lower) {
                score += 500;
            }
            score -= name.len() as i64;

            Some((
                SearchResult {
                    name,
                    path: path.to_string(),
                    kind,
                },
                score,
            ))
        })
        .collect();

    scored.sort_by(|a, b| b.1.cmp(&a.1));
    scored.truncate(MAX_FINAL_RESULTS);
    scored.into_iter().map(|(r, _)| r).collect()
}

#[cfg(not(target_os = "macos"))]
fn run_search(_query: &str) -> Vec<SearchResult> {
    vec![]
}
