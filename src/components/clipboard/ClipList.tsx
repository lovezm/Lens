import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Clip } from "../../hooks/useClipboardItems";
import { clipTitle, formatTime, groupByDay } from "../../utils/clipboard";
import ClipKindIcon from "./ClipKindIcon";

interface ClipListProps {
  items: Clip[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onActivate: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function ClipList({
  items,
  selectedId,
  onSelect,
  onActivate,
  onDelete,
}: ClipListProps) {
  const { t } = useTranslation();
  const [hoverId, setHoverId] = useState<number | null>(null);
  const groups = groupByDay(items);

  const sections: { key: "today" | "yesterday" | "older"; items: Clip[] }[] = [
    { key: "today", items: groups.today },
    { key: "yesterday", items: groups.yesterday },
    { key: "older", items: groups.older },
  ];

  return (
    <div style={{ overflowY: "auto", height: "100%", padding: "6px 6px 12px" }}>
      {sections.map((sec) =>
        sec.items.length > 0 ? (
          <div key={sec.key}>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                padding: "8px 10px 4px",
                fontWeight: 500,
              }}
            >
              {t(`clipboard.${sec.key}`)}
            </div>
            {sec.items.map((item) => {
              const selected = item.id === selectedId;
              const hovered = item.id === hoverId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelect(item.id)}
                  onDoubleClick={() => onActivate(item.id)}
                  onMouseEnter={() => setHoverId(item.id)}
                  onMouseLeave={() => setHoverId((h) => (h === item.id ? null : h))}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "7px 10px",
                    margin: "1px 4px",
                    borderRadius: 7,
                    cursor: "pointer",
                    background: selected ? "rgba(0,122,255,0.12)" : "transparent",
                    color: "var(--text-primary)",
                    transition: "background 0.06s",
                  }}
                >
                  <ClipKindIcon kind={item.kind} />
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {clipTitle(item, 60) || (item.kind === "image" ? "Image" : "—")}
                  </div>
                  {item.pinned && <span style={{ fontSize: 10, opacity: 0.6 }}>★</span>}
                  {hovered ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                      }}
                      title={t("clipboard.actions.delete")}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: "none",
                        background: "rgba(0,0,0,0.06)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      <svg
                        width={11}
                        height={11}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  ) : (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text-tertiary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatTime(item.updated_at)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : null
      )}
    </div>
  );
}
