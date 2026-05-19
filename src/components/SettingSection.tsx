import { ReactNode } from "react";

interface SettingSectionProps {
  title?: string;
  children: ReactNode;
}

export default function SettingSection({ title, children }: SettingSectionProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {title && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
            paddingLeft: 4,
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
