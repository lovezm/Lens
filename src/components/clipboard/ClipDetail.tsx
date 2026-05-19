import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Clip } from "../../hooks/useClipboardItems";
import { formatBytes, formatDateTime } from "../../utils/clipboard";

interface ClipDetailProps {
  clip: Clip | null;
}

export default function ClipDetail({ clip }: ClipDetailProps) {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(null);
    if (clip?.kind === "image" && clip.image_path) {
      invoke<string>("clipboard_image_path", { relative: clip.image_path })
        .then((abs) => setImageUrl(convertFileSrc(abs)))
        .catch(() => setImageUrl(null));
    }
  }, [clip]);

  if (!clip) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        —
      </div>
    );
  }

  const text = clip.text_content ?? "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Preview */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 18,
          fontFamily:
            clip.kind === "text"
              ? '"SF Mono", "JetBrains Mono", Menlo, monospace'
              : "inherit",
          fontSize: clip.kind === "text" ? 12 : 13,
          color: "var(--text-primary)",
          whiteSpace: clip.kind === "text" ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {clip.kind === "image" ? (
          imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: 6,
              }}
            />
          ) : (
            <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>Loading…</div>
          )
        ) : (
          text
        )}
      </div>

      {/* Info panel */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.06)",
          padding: "12px 18px",
          fontSize: 12,
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ fontWeight: 500, marginBottom: 6, color: "var(--text-primary)" }}>
          {t("clipboard.info.title")}
        </div>
        <InfoRow label={t("clipboard.info.source")} value={clip.source_name ?? "—"} />
        <InfoRow label={t("clipboard.info.type")} value={kindLabel(clip.kind, t)} />
        <InfoRow label={t("clipboard.info.size")} value={formatBytes(clip.byte_size)} />
        {clip.kind === "text" && (
          <InfoRow
            label={t("clipboard.info.characters")}
            value={(clip.text_content ?? "").length.toString()}
          />
        )}
        <InfoRow label={t("clipboard.info.copied")} value={formatDateTime(clip.updated_at)} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 0",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--text-primary)", marginLeft: 16 }}>{value}</span>
    </div>
  );
}

function kindLabel(kind: string, t: (k: string) => string) {
  if (kind === "text") return t("clipboard.typeFilter.text");
  if (kind === "image") return t("clipboard.typeFilter.image");
  return t("clipboard.typeFilter.file");
}
