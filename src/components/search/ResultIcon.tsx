import { useFileIcon } from "../../hooks/useFileIcon";

interface ResultIconProps {
  path: string;
  kind: string;
  size?: number;
}

const FALLBACK_COLORS: Record<string, string> = {
  app: "#007AFF",
  folder: "#FFB340",
  file: "#8E8E93",
};

export default function ResultIcon({ path, kind, size = 32 }: ResultIconProps) {
  const url = useFileIcon(path);

  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={{ flexShrink: 0, borderRadius: 4, objectFit: "contain" }}
      />
    );
  }

  // Subtle placeholder while loading
  const color = FALLBACK_COLORS[kind] ?? FALLBACK_COLORS.file;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: color,
        flexShrink: 0,
        opacity: 0.25,
      }}
    />
  );
}
