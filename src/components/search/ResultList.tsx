import ResultIcon from "./ResultIcon";

export interface SearchResult {
  name: string;
  path: string;
  kind: string;
}

interface ResultListProps {
  items: SearchResult[];
  selected: number;
  onSelect: (idx: number) => void;
  onOpen: (item: SearchResult) => void;
}

export default function ResultList({ items, selected, onSelect, onOpen }: ResultListProps) {
  return (
    <div style={{ padding: 6 }}>
      {items.map((item, i) => (
        <div
          key={item.path}
          onClick={() => onOpen(item)}
          onMouseEnter={() => onSelect(i)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            background: i === selected ? "rgba(0,122,255,0.85)" : "transparent",
            color: i === selected ? "white" : "var(--text-primary)",
            transition: "background 0.05s",
          }}
        >
          <ResultIcon path={item.path} kind={item.kind} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name.replace(/\.app$/, "")}
            </div>
            <div
              style={{
                fontSize: 11,
                opacity: i === selected ? 0.85 : 0.55,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 1,
                direction: "rtl",
                textAlign: "left",
              }}
            >
              {item.path}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
