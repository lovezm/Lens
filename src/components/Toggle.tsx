import { useCallback } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}

export default function Toggle({ checked, onChange, disabled }: ToggleProps) {
  const handleClick = useCallback(() => {
    if (!disabled) onChange(!checked);
  }, [checked, disabled, onChange]);

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={handleClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        width: 44,
        height: 26,
        borderRadius: 13,
        background: checked ? "var(--accent)" : "var(--text-tertiary)",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        padding: 3,
        transition: "background 0.2s",
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          display: "block",
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </button>
  );
}
