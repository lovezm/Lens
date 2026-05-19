import { useTranslation } from "react-i18next";
import Icon from "./Icon";
import { SettingsPage, SETTINGS_PAGES } from "../pages/settings";

interface SidebarProps {
  active: SettingsPage;
  onSelect: (p: SettingsPage) => void;
}

export default function Sidebar({ active, onSelect }: SidebarProps) {
  const { t } = useTranslation();
  return (
    <div
      data-tauri-drag-region
      style={{
        width: "var(--sidebar-width)",
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        paddingTop: 48,
        flexShrink: 0,
      }}
    >
      <div style={{ paddingTop: 8 }}>
        {SETTINGS_PAGES.map((key) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              width: "calc(100% - 16px)",
              margin: "1px 8px",
              padding: "7px 10px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: active === key ? 500 : 400,
              color: active === key ? "var(--text-primary)" : "var(--text-secondary)",
              background: active === key ? "var(--sidebar-active)" : "transparent",
              boxShadow: active === key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.12s",
              textAlign: "left",
            }}
          >
            <Icon name={key} size={15} />
            <span>{t(`settings.sections.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
