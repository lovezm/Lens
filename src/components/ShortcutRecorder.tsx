import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { eventToAccelerator, formatAccelerator } from "../utils/accelerator";

interface ShortcutRecorderProps {
  value: string;
  onChange: (acc: string) => void;
}

export default function ShortcutRecorder({ value, onChange }: ShortcutRecorderProps) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!recording) return;
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") {
        setRecording(false);
        setError(false);
        return;
      }
      const acc = eventToAccelerator(e);
      if (acc) {
        onChange(acc);
        setRecording(false);
        setError(false);
      } else if (e.key.length === 1 || /^F\d/.test(e.key)) {
        setError(true);
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [recording, onChange]);

  const tokens = recording ? [] : formatAccelerator(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
      <button
        ref={btnRef}
        onClick={() => {
          setError(false);
          setRecording((r) => !r);
        }}
        onBlur={() => setRecording(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 10px",
          minWidth: 100,
          minHeight: 28,
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          border: recording
            ? "1px solid var(--accent)"
            : "1px solid var(--border)",
          background: recording ? "rgba(0,122,255,0.08)" : "var(--surface-hover)",
          fontFamily: "inherit",
          fontSize: 12,
          color: "var(--text-primary)",
          cursor: "pointer",
          transition: "all 0.12s",
        }}
      >
        {recording ? (
          <span style={{ color: "var(--accent)", fontSize: 11 }}>
            {t("settings.shortcut.recording")}
          </span>
        ) : (
          tokens.map((tok, i) => (
            <kbd
              key={i}
              style={{
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-primary)",
              }}
            >
              {tok}
            </kbd>
          ))
        )}
      </button>
      {error && (
        <span style={{ fontSize: 10, color: "var(--red)" }}>
          {t("settings.shortcut.invalid")}
        </span>
      )}
    </div>
  );
}
