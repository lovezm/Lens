import { useEffect, useState } from "react";
import i18n, { setLanguage, Lang } from "./i18n";
import Sidebar from "./components/Sidebar";
import SettingsPageHost, { SettingsPage } from "./pages/settings";
import { useShortcut } from "./hooks/useShortcut";
import { useClipboardSettings } from "./hooks/useClipboardSettings";

export default function App() {
  const [activePage, setActivePage] = useState<SettingsPage>("general");
  const [lang, setLang] = useState<Lang>((i18n.language as Lang) ?? "zh");
  const searchShortcut = useShortcut("search");
  const clipboardShortcut = useShortcut("clipboard");
  const clipboard = useClipboardSettings();

  // Reflect any cross-window language change in local state
  useEffect(() => {
    const handler = (l: string) => setLang(l as Lang);
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, []);

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setLanguage(l);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--bg)", position: "relative" }}>
      <div
        data-tauri-drag-region
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 36,
          zIndex: 999,
        }}
      />
      <Sidebar active={activePage} onSelect={setActivePage} />
      <SettingsPageHost
        activePage={activePage}
        lang={lang}
        onLangChange={handleLangChange}
        searchAccelerator={searchShortcut.accelerator}
        onSearchAcceleratorChange={searchShortcut.setAccelerator}
        clipboardAccelerator={clipboardShortcut.accelerator}
        onClipboardAcceleratorChange={clipboardShortcut.setAccelerator}
        retention={clipboard.retention}
        onRetentionChange={clipboard.setRetention}
        recordFiles={clipboard.recordFiles}
        onRecordFilesChange={clipboard.setRecordFiles}
      />
    </div>
  );
}
