import GeneralPanel from "./GeneralPanel";
import ShortcutPanel from "./ShortcutPanel";
import PermissionsPanel from "./PermissionsPanel";
import AboutPanel from "./AboutPanel";

export type SettingsPage = "general" | "shortcut" | "permissions" | "about";
export const SETTINGS_PAGES: SettingsPage[] = ["general", "shortcut", "permissions", "about"];

type Lang = "zh" | "en";

interface SettingsPageHostProps {
  activePage: SettingsPage;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  accelerator: string;
  onAcceleratorChange: (acc: string) => void;
}

export default function SettingsPageHost({
  activePage,
  lang,
  onLangChange,
  accelerator,
  onAcceleratorChange,
}: SettingsPageHostProps) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
      {activePage === "general" && <GeneralPanel lang={lang} onLangChange={onLangChange} />}
      {activePage === "shortcut" && (
        <ShortcutPanel accelerator={accelerator} onChange={onAcceleratorChange} />
      )}
      {activePage === "permissions" && <PermissionsPanel />}
      {activePage === "about" && <AboutPanel />}
    </div>
  );
}
