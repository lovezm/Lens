type Lang = "zh" | "en";

interface LanguageToggleProps {
  lang: Lang;
  onChange: (l: Lang) => void;
}

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
];

export default function LanguageToggle({ lang, onChange }: LanguageToggleProps) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface-hover)",
        borderRadius: "var(--radius-sm)",
        padding: 2,
        gap: 2,
      }}
    >
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          style={{
            padding: "4px 12px",
            borderRadius: 4,
            border: "none",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: "pointer",
            fontWeight: lang === value ? 500 : 400,
            background: lang === value ? "var(--surface)" : "transparent",
            color: lang === value ? "var(--text-primary)" : "var(--text-secondary)",
            boxShadow: lang === value ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
