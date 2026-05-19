use serde::Serialize;

const REPO: &str = "lovezm/Lens";
const TIMEOUT_SECS: u64 = 10;

#[derive(Serialize)]
pub struct UpdateInfo {
    pub current: String,
    pub latest: String,
    pub has_update: bool,
    pub release_url: String,
    pub notes: String,
    pub published_at: String,
}

#[tauri::command]
pub async fn check_for_updates() -> Result<UpdateInfo, String> {
    let url = format!("https://api.github.com/repos/{REPO}/releases/latest");
    let client = reqwest::Client::builder()
        .user_agent(format!("Lens/{}", env!("CARGO_PKG_VERSION")))
        .timeout(std::time::Duration::from_secs(TIMEOUT_SECS))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client.get(&url).send().await.map_err(|e| e.to_string())?;
    if !resp.status().is_success() {
        return Err(format!("HTTP {}", resp.status()));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    let tag = json["tag_name"].as_str().unwrap_or("").to_string();
    let latest = tag
        .strip_prefix('v')
        .unwrap_or(&tag)
        .to_string();
    let current = env!("CARGO_PKG_VERSION").to_string();

    Ok(UpdateInfo {
        has_update: is_newer(&latest, &current),
        current,
        latest,
        release_url: json["html_url"].as_str().unwrap_or("").to_string(),
        notes: json["body"].as_str().unwrap_or("").to_string(),
        published_at: json["published_at"].as_str().unwrap_or("").to_string(),
    })
}

fn is_newer(latest: &str, current: &str) -> bool {
    let parse = |s: &str| -> Vec<u32> {
        s.split(['.', '-'])
            .filter_map(|p| p.parse().ok())
            .collect()
    };
    let l = parse(latest);
    let c = parse(current);
    let len = l.len().max(c.len());
    for i in 0..len {
        let li = l.get(i).copied().unwrap_or(0);
        let ci = c.get(i).copied().unwrap_or(0);
        if li > ci {
            return true;
        }
        if li < ci {
            return false;
        }
    }
    false
}
