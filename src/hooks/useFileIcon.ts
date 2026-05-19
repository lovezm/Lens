import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const cache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

export function useFileIcon(path: string): string | null {
  const [url, setUrl] = useState<string | null>(() => cache.get(path) ?? null);

  useEffect(() => {
    if (cache.has(path)) {
      setUrl(cache.get(path) ?? null);
      return;
    }

    let cancelled = false;
    let promise = inflight.get(path);
    if (!promise) {
      promise = invoke<string | null>("get_file_icon", { path }).then((b64) => {
        if (!b64) return null;
        const dataUrl = `data:image/png;base64,${b64}`;
        cache.set(path, dataUrl);
        inflight.delete(path);
        return dataUrl;
      });
      inflight.set(path, promise);
    }
    promise.then((result) => {
      if (!cancelled) setUrl(result);
    });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}
