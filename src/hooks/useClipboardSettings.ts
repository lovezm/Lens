import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";

const STORE_FILE = "settings.json";
const RETENTION_KEY = "clipboard-retention";
const RECORD_FILES_KEY = "clipboard-record-files";

export type Retention = "forever" | "3m" | "1m" | "7d";

export const RETENTION_OPTIONS: Retention[] = ["forever", "3m", "1m", "7d"];

function retentionToDays(r: Retention): number | null {
  switch (r) {
    case "forever":
      return null;
    case "3m":
      return 90;
    case "1m":
      return 30;
    case "7d":
      return 7;
  }
}

const store = new LazyStore(STORE_FILE);

export function useClipboardSettings() {
  const [retention, setRetentionState] = useState<Retention>("forever");
  const [recordFiles, setRecordFilesState] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = (await store.get<Retention>(RETENTION_KEY)) ?? "forever";
        const rf = (await store.get<boolean>(RECORD_FILES_KEY)) ?? false;
        setRetentionState(r);
        setRecordFilesState(rf);
        await invoke("clipboard_set_record_files", { enabled: rf });
        await invoke("clipboard_prune", { retentionDays: retentionToDays(r) });
      } catch (e) {
        console.error("clipboard settings init failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setRetention = useCallback(async (r: Retention) => {
    setRetentionState(r);
    await store.set(RETENTION_KEY, r);
    await store.save();
    await invoke("clipboard_prune", { retentionDays: retentionToDays(r) });
  }, []);

  const setRecordFiles = useCallback(async (enabled: boolean) => {
    setRecordFilesState(enabled);
    await store.set(RECORD_FILES_KEY, enabled);
    await store.save();
    await invoke("clipboard_set_record_files", { enabled });
  }, []);

  return { retention, setRetention, recordFiles, setRecordFiles, loaded };
}
