import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import { DEFAULT_ACCELERATOR } from "../utils/accelerator";

const STORE_FILE = "settings.json";
const KEY = "summon-shortcut";

const store = new LazyStore(STORE_FILE);

export function useShortcut() {
  const [accelerator, setAcceleratorState] = useState<string>(DEFAULT_ACCELERATOR);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await store.get<string>(KEY);
        const initial = saved || DEFAULT_ACCELERATOR;
        setAcceleratorState(initial);
        await invoke("register_search_shortcut", { accelerator: initial });
      } catch (_) {
        // ignore
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setAccelerator = useCallback(async (acc: string) => {
    try {
      await invoke("register_search_shortcut", { accelerator: acc });
      setAcceleratorState(acc);
      await store.set(KEY, acc);
      await store.save();
    } catch (e) {
      console.error("Failed to register shortcut:", e);
    }
  }, []);

  return { accelerator, setAccelerator, loaded };
}
