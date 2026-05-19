import { useState } from "react";
import i18n from "./i18n";
import Sidebar from "./components/Sidebar";
import SettingsPageHost, { SettingsPage } from "./pages/settings";
import { useShortcut } from "./hooks/useShortcut";

type Lang = "zh" | "en";

export default function App() {
  const [activePage, setActivePage] = useState<SettingsPage>("general");
  const [lang, setLang] = useState<Lang>("zh");
  const shortcut = useShortcut();

  const handleLangChange = (l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
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
        accelerator={shortcut.accelerator}
        onAcceleratorChange={shortcut.setAccelerator}
      />
    </div>
  );
}
