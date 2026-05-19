import { useTranslation } from "react-i18next";

interface PermissionRowProps {
  label: string;
  description: string;
  granted: boolean;
  onOpenSettings: () => void;
  extraAction?: { label: string; onClick: () => void };
  last?: boolean;
}

export default function PermissionRow({
  label,
  description,
  granted,
  onOpenSettings,
  extraAction,
  last,
}: PermissionRowProps) {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: last ? "none" : "1px solid var(--border)",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
          {description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: granted ? "var(--green)" : "var(--text-tertiary)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: granted ? "var(--green)" : "var(--text-tertiary)",
            }}
          />
          {granted ? t("settings.permissions.granted") : t("settings.permissions.notGranted")}
        </span>
        {!granted && extraAction && (
          <button
            onClick={extraAction.onClick}
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "inherit",
            }}
          >
            {extraAction.label}
          </button>
        )}
        {!granted && (
          <button
            onClick={onOpenSettings}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "3px 8px",
              borderRadius: "var(--radius-sm)",
              fontFamily: "inherit",
            }}
          >
            {t("settings.permissions.openSettings")}
          </button>
        )}
      </div>
    </div>
  );
}
