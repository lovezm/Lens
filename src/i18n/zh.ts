export default {
  settings: {
    title: "设置",
    sections: {
      general: "通用",
      shortcut: "快捷键",
      permissions: "权限",
      about: "关于",
    },
    general: {
      language: "语言",
      launchAtLogin: "开机启动",
      launchAtLoginDesc: "登录时自动启动 Lens",
    },
    shortcut: {
      summon: "唤出搜索",
      summonDesc: "按下后呼出搜索面板",
      recording: "请按下组合键…",
      reset: "重置",
      invalid: "需要包含至少一个修饰键",
    },
    permissions: {
      accessibility: "辅助功能",
      accessibilityDesc: "用于全局快捷键和窗口管理",
      fullDiskAccess: "完全磁盘访问",
      fullDiskAccessDesc: "用于搜索所有文件",
      granted: "已授权",
      notGranted: "未授权",
      openSettings: "前往授权",
      reveal: "显示二进制",
    },
    about: {
      version: "版本",
      description: "极简启动器 · 文件搜索 · 剪切板管理",
    },
  },
  search: {
    placeholder: "搜索文件或应用…",
    empty: "无结果",
    hint: "↑↓ 选择 · ↵ 打开 · esc 关闭",
  },
};
