import { ClipKind } from "../../hooks/useClipboardItems";

const COLOR: Record<ClipKind, string> = {
  text: "#8E8E93",
  image: "#5856D6",
  file: "#FF9500",
};

export default function ClipKindIcon({ kind, size = 18 }: { kind: ClipKind; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={COLOR[kind]}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      {kind === "text" && (
        <>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </>
      )}
      {kind === "image" && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </>
      )}
      {kind === "file" && (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </>
      )}
    </svg>
  );
}
