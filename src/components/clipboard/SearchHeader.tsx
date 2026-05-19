import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { ClipKind } from "../../hooks/useClipboardItems";

interface SearchHeaderProps {
  query: string;
  onQuery: (v: string) => void;
  kind: ClipKind | null;
  onKind: (k: ClipKind | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const KIND_OPTIONS: { value: ClipKind | null; key: string }[] = [
  { value: null, key: "all" },
  { value: "text", key: "text" },
  { value: "image", key: "image" },
  { value: "file", key: "file" },
];

const SearchHeader = forwardRef<HTMLInputElement, SearchHeaderProps>(
  ({ query, onQuery, kind, onKind, onKeyDown }, ref) => {
    const { t } = useTranslation();
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          gap: 10,
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-secondary)", flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={ref}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("clipboard.placeholder")}
          autoFocus
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 14,
            fontFamily: "inherit",
            color: "var(--text-primary)",
          }}
        />
        <select
          value={kind ?? ""}
          onChange={(e) => onKind(e.target.value === "" ? null : (e.target.value as ClipKind))}
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {KIND_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.value ?? ""}>
              {t(`clipboard.typeFilter.${opt.key}`)}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

export default SearchHeader;
