import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { LazyStore } from "@tauri-apps/plugin-store";
import { DEFAULT_ACCELERATOR } from "../utils/accelerator";

const STORE_FILE = "settings.json";
const SEARCH_KEY = "summon-shortcut";
const CLIPBOARD_KEY = "clipboard-shortcut";

const store = new LazyStore(STORE_FILE);

type Kind = "search" | "clipboard";

function keyFor(kind: Kind) {
  return kind === "search" ? SEARCH_KEY : CLIPBOARD_KEY;
}

function defaultFor(kind: Kind) {
  // Search has a default, clipboard requires the user to opt in
  return kind === "search" ? DEFAULT_ACCELERATOR : "";
}

export function useShortcut(kind: Kind = "search") {
  const [accelerator, setAcceleratorState] = useState<string>(defaultFor(kind));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = (await store.get<string>(keyFor(kind))) ?? null;
        const initial = saved !== null ? saved : defaultFor(kind);
        setAcceleratorState(initial);
        await invoke("register_shortcut", {
          kind,
          accelerator: initial || null,
        });
      } catch (e) {
        console.error("shortcut init failed", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, [kind]);

  const setAccelerator = useCallback(
    async (acc: string) => {
      try {
        await invoke("register_shortcut", { kind, accelerator: acc || null });
        setAcceleratorState(acc);
        await store.set(keyFor(kind), acc);
        await store.save();
      } catch (e) {
        console.error("shortcut update failed", e);
      }
    },
    [kind]
  );

  return { accelerator, setAccelerator, loaded };
}
