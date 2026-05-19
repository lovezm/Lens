import { ReactNode } from "react";

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  last?: boolean;
}

export default function SettingRow({ label, description, children, last }: SettingRowProps) {
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
        <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 400 }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}
