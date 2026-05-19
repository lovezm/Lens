import { forwardRef } from "react";
import { useTranslation } from "react-i18next";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onKeyDown }, ref) => {
    const { t } = useTranslation();
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          height: 64,
          gap: 12,
          position: "relative",
          zIndex: 2,
        }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-secondary)", flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("search.placeholder")}
          autoFocus
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 20,
            fontFamily: "inherit",
            color: "var(--text-primary)",
            fontWeight: 400,
          }}
        />
      </div>
    );
  }
);

export default SearchInput;
