import GeneralPanel from "./GeneralPanel";
import ShortcutPanel from "./ShortcutPanel";
import ClipboardPanel from "./ClipboardPanel";
import PermissionsPanel from "./PermissionsPanel";
import AboutPanel from "./AboutPanel";
import { Retention } from "../../hooks/useClipboardSettings";

export type SettingsPage = "general" | "shortcut" | "clipboard" | "permissions" | "about";
export const SETTINGS_PAGES: SettingsPage[] = [
  "general",
  "shortcut",
  "clipboard",
  "permissions",
  "about",
];

type Lang = "zh" | "en";

interface SettingsPageHostProps {
  activePage: SettingsPage;
  lang: Lang;
  onLangChange: (l: Lang) => void;
  searchAccelerator: string;
  onSearchAcceleratorChange: (acc: string) => void;
  clipboardAccelerator: string;
  onClipboardAcceleratorChange: (acc: string) => void;
  retention: Retention;
  onRetentionChange: (r: Retention) => void;
  recordFiles: boolean;
  onRecordFilesChange: (v: boolean) => void;
}

export default function SettingsPageHost(props: SettingsPageHostProps) {
  const { activePage, lang, onLangChange } = props;
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
      {activePage === "general" && <GeneralPanel lang={lang} onLangChange={onLangChange} />}
      {activePage === "shortcut" && (
        <ShortcutPanel
          accelerator={props.searchAccelerator}
          onChange={props.onSearchAcceleratorChange}
        />
      )}
      {activePage === "clipboard" && (
        <ClipboardPanel
          accelerator={props.clipboardAccelerator}
          onAcceleratorChange={props.onClipboardAcceleratorChange}
          retention={props.retention}
          onRetentionChange={props.onRetentionChange}
          recordFiles={props.recordFiles}
          onRecordFilesChange={props.onRecordFilesChange}
        />
      )}
      {activePage === "permissions" && <PermissionsPanel />}
      {activePage === "about" && <AboutPanel />}
    </div>
  );
}
