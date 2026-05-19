import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export type ClipKind = "text" | "image" | "file";

export interface Clip {
  id: number;
  kind: ClipKind;
  hash: string;
  text_content: string | null;
  image_path: string | null;
  source_bundle_id: string | null;
  source_name: string | null;
  created_at: number;
  updated_at: number;
  pinned: boolean;
  byte_size: number;
}

interface UseItemsArgs {
  query: string;
  kind: ClipKind | null;
}

export function useClipboardItems({ query, kind }: UseItemsArgs) {
  const [items, setItems] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoke<Clip[]>("clipboard_list", {
        args: { query, kind, limit: 300 },
      });
      setItems(res);
    } catch (e) {
      console.error("clipboard list failed", e);
    } finally {
      setLoading(false);
    }
  }, [query, kind]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch on new clips
  useEffect(() => {
    const un = listen("clipboard:changed", () => refresh());
    return () => {
      un.then((f) => f());
    };
  }, [refresh]);

  return { items, loading, refresh };
}
