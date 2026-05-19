import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { ask } from "@tauri-apps/plugin-dialog";
import SettingSection from "../../components/SettingSection";
import SettingRow from "../../components/SettingRow";
import Toggle from "../../components/Toggle";
import ShortcutRecorder from "../../components/ShortcutRecorder";
import { Retention, RETENTION_OPTIONS } from "../../hooks/useClipboardSettings";

interface ClipboardPanelProps {
  accelerator: string;
  onAcceleratorChange: (acc: string) => void;
  retention: Retention;
  onRetentionChange: (r: Retention) => void;
  recordFiles: boolean;
  onRecordFilesChange: (v: boolean) => void;
}

export default function ClipboardPanel({
  accelerator,
  onAcceleratorChange,
  retention,
  onRetentionChange,
  recordFiles,
  onRecordFilesChange,
}: ClipboardPanelProps) {
  const { t } = useTranslation();

  const handleClear = async () => {
    const ok = await ask(t("settings.clipboard.clearConfirm"), {
      title: t("settings.clipboard.clear"),
      kind: "warning",
      okLabel: t("settings.clipboard.clear"),
      cancelLabel: "Cancel",
    });
    if (ok) {
      await invoke("clipboard_clear");
    }
  };

  return (
    <>
      <SettingSection>
        <SettingRow
          label={t("settings.shortcut.clipboard")}
          description={t("settings.shortcut.clipboardDesc")}
          last={false}
        >
          <ShortcutRecorder value={accelerator} onChange={onAcceleratorChange} />
        </SettingRow>
        <SettingRow
          label={t("settings.clipboard.retention")}
          description={t("settings.clipboard.retentionDesc")}
          last={false}
        >
          <select
            value={retention}
            onChange={(e) => onRetentionChange(e.target.value as Retention)}
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {RETENTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {t(`settings.clipboard.retentionOptions.${opt}`)}
              </option>
            ))}
          </select>
        </SettingRow>
        <SettingRow
          label={t("settings.clipboard.recordFiles")}
          description={t("settings.clipboard.recordFilesDesc")}
          last
        >
          <Toggle checked={recordFiles} onChange={onRecordFilesChange} />
        </SettingRow>
      </SettingSection>

      <div style={{ height: 14 }} />

      <SettingSection>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
          }}
        >
          <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
            {t("settings.clipboard.clear")}
          </div>
          <button
            onClick={handleClear}
            style={{
              fontSize: 12,
              padding: "5px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--red, #FF3B30)",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {t("settings.clipboard.clear")}
          </button>
        </div>
      </SettingSection>
    </>
  );
}
