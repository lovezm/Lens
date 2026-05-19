# Lens

> Minimal macOS launcher · 极简 macOS 启动器
> 快速文件搜索 · 剪切板历史 · 更多功能持续添加中

A lightweight launcher for macOS built with **Tauri + React**. Inspired by Alfred and Raycast.

## Features

- 🔍 **Instant file & app search** — powered by Spotlight (`mdfind`), shows native macOS icons
- ⌨️ **Customizable global hotkey** — record any key combination in settings
- 🪟 **Menu bar app** — no dock icon, lives quietly in the menu bar
- 🌐 **Bilingual** — 中文 / English
- 🚀 **Launch at login** — opt-in via settings

### Roadmap

- [ ] 📋 Clipboard history (text · images · files)
- [ ] 🧮 Inline calculator
- [ ] 🌐 Quick translate
- [ ] 🔌 Plugin system

## Tech Stack

- **Backend:** Rust · Tauri 2 · SQLite · Tokio
- **Frontend:** React 19 · TypeScript · Vite
- **Native bridge:** objc2 (for NSWorkspace icon extraction)

## Development

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## License

MIT © 2026 xiaowang
