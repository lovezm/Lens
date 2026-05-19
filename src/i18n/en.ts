export default {
  settings: {
    title: "Settings",
    sections: {
      general: "General",
      shortcut: "Shortcut",
      permissions: "Permissions",
      about: "About",
    },
    general: {
      language: "Language",
      launchAtLogin: "Launch at Login",
      launchAtLoginDesc: "Automatically start Lens when you log in",
    },
    shortcut: {
      summon: "Summon Search",
      summonDesc: "Press to bring up the search bar",
      recording: "Press a key combination…",
      reset: "Reset",
      invalid: "At least one modifier key is required",
    },
    permissions: {
      accessibility: "Accessibility",
      accessibilityDesc: "Required for global shortcuts and window management",
      fullDiskAccess: "Full Disk Access",
      fullDiskAccessDesc: "Required to search all files on your Mac",
      granted: "Granted",
      notGranted: "Not Granted",
      openSettings: "Open Settings",
      reveal: "Reveal Binary",
    },
    about: {
      version: "Version",
      description: "Minimal launcher · File search · Clipboard history",
    },
  },
  search: {
    placeholder: "Search files or apps…",
    empty: "No results",
    hint: "↑↓ navigate · ↵ open · esc close",
  },
};
