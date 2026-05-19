import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import SearchInput from "../components/search/SearchInput";
import ResultList, { SearchResult } from "../components/search/ResultList";

const INPUT_HEIGHT = 64;
const RESULT_ITEM_HEIGHT = 52;
const RESULT_PADDING = 12;
const FOOTER_HEIGHT = 26;
const MAX_VISIBLE = 8;
const DEBOUNCE_MS = 140;

function calcHeight(count: number): number {
  if (count === 0) return INPUT_HEIGHT;
  const visible = Math.min(count, MAX_VISIBLE);
  return INPUT_HEIGHT + visible * RESULT_ITEM_HEIGHT + RESULT_PADDING + FOOTER_HEIGHT;
}

export default function SearchPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [showEmpty, setShowEmpty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);
  const queryIdRef = useRef(0);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Sync window height when results change
  useEffect(() => {
    const visibleRows = showEmpty ? 1 : results.length;
    invoke("resize_search_window", { height: calcHeight(visibleRows) });
  }, [results, showEmpty]);

  // Reset state when window is shown or hidden — keeps the next open clean
  useEffect(() => {
    focusInput();
    const reset = () => {
      setQuery("");
      setResults([]);
      setSelected(0);
      setShowEmpty(false);
    };
    const unShow = listen("search:show", () => {
      reset();
      focusInput();
    });
    const win = getCurrentWindow();
    let unFocus: (() => void) | undefined;
    win.onFocusChanged(({ payload: focused }) => {
      if (!focused) reset();
    }).then((un) => {
      unFocus = un;
    });
    return () => {
      unShow.then((f) => f());
      unFocus?.();
    };
  }, [focusInput]);

  // Debounced async search
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setShowEmpty(false);
      setSelected(0);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      const id = ++queryIdRef.current;
      try {
        const res = await invoke<SearchResult[]>("search_items", { query: trimmed });
        if (id !== queryIdRef.current) return;
        setResults(res);
        setSelected(0);
        setShowEmpty(res.length === 0);
      } catch (e) {
        console.error(e);
      }
    }, DEBOUNCE_MS);
  }, [query]);

  const hideWindow = useCallback(async () => {
    await getCurrentWindow().hide();
  }, []);

  const openItem = useCallback(
    async (item: SearchResult) => {
      try {
        await invoke("open_path", { path: item.path });
        await hideWindow();
      } catch (e) {
        console.error(e);
      }
    },
    [hideWindow]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      hideWindow();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selected]) openItem(results[selected]);
    }
  };

  const hasContent = results.length > 0 || showEmpty;

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "rgba(245,245,247,0.78)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
      }}
    >
      {/* Top drag region */}
      <div
        data-tauri-drag-region
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: INPUT_HEIGHT,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <SearchInput
        ref={inputRef}
        value={query}
        onChange={setQuery}
        onKeyDown={handleKeyDown}
      />

      {hasContent && (
        <>
          <div style={{ height: 1, background: "rgba(0,0,0,0.06)" }} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            {results.length > 0 ? (
              <ResultList
                items={results}
                selected={selected}
                onSelect={setSelected}
                onOpen={openItem}
              />
            ) : (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                {t("search.empty")}
              </div>
            )}
          </div>
          {results.length > 0 && (
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
              {t("search.hint")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
