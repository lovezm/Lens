import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SearchHeader from "../components/clipboard/SearchHeader";
import ClipList from "../components/clipboard/ClipList";
import ClipDetail from "../components/clipboard/ClipDetail";
import { Clip, ClipKind, useClipboardItems } from "../hooks/useClipboardItems";

export default function ClipboardPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<ClipKind | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { items, refresh } = useClipboardItems({ query, kind: kindFilter });

  // Auto-select first when items change and selected disappears
  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!items.find((i) => i.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  // Window show/focus reset
  useEffect(() => {
    const focusInput = () => requestAnimationFrame(() => inputRef.current?.focus());
    focusInput();
    const reset = () => {
      setQuery("");
      setKindFilter(null);
      focusInput();
      refresh();
    };
    const unShow = listen("clipboard:show", reset);
    const win = getCurrentWindow();
    let unFocus: (() => void) | undefined;
    win.onFocusChanged(({ payload: focused }) => {
      if (!focused) {
        // Clear search but keep window state minimal next time
        setQuery("");
        setKindFilter(null);
      }
    }).then((un) => {
      unFocus = un;
    });
    return () => {
      unShow.then((f) => f());
      unFocus?.();
    };
  }, [refresh]);

  const hideWindow = useCallback(async () => {
    await getCurrentWindow().hide();
  }, []);

  const selectedClip: Clip | null = items.find((i) => i.id === selectedId) ?? null;

  const activate = useCallback(
    async (id: number) => {
      try {
        await invoke("clipboard_paste", { id });
        await hideWindow();
      } catch (e) {
        console.error("paste failed", e);
      }
    },
    [hideWindow]
  );

  const remove = useCallback(
    async (id: number) => {
      const idx = items.findIndex((i) => i.id === id);
      // Predict next selection: prefer next sibling, then previous
      const nextId = items[idx + 1]?.id ?? items[idx - 1]?.id ?? null;
      if (nextId !== null) setSelectedId(nextId);
      try {
        await invoke("clipboard_delete", { id });
        await refresh();
      } catch (e) {
        console.error("delete failed", e);
      }
    },
    [items, refresh]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (items.length === 0 && e.key !== "Escape") return;
    const idx = items.findIndex((i) => i.id === selectedId);

    if (e.key === "Escape") {
      e.preventDefault();
      hideWindow();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(idx + 1, items.length - 1);
      setSelectedId(items[next].id);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      setSelectedId(items[prev].id);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedId !== null) activate(selectedId);
    } else if (e.key === "Backspace" && e.metaKey) {
      e.preventDefault();
      if (selectedId !== null) remove(selectedId);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "rgba(245,245,247,0.85)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
    >
      <SearchHeader
        ref={inputRef}
        query={query}
        onQuery={setQuery}
        kind={kindFilter}
        onKind={setKindFilter}
        onKeyDown={handleKeyDown}
      />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: list */}
        <div
          style={{
            width: 320,
            borderRight: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-tertiary)",
                fontSize: 12,
              }}
            >
              {t("clipboard.empty")}
            </div>
          ) : (
            <ClipList
              items={items}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onActivate={activate}
              onDelete={remove}
            />
          )}
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ClipDetail clip={selectedClip} />
        </div>
      </div>

      {/* Footer hint */}
      <div
        style={{
          padding: "6px 14px",
          fontSize: 10,
          color: "var(--text-secondary)",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {t("clipboard.hint")}
      </div>
    </div>
  );
}
