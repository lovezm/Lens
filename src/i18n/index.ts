import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LazyStore } from "@tauri-apps/plugin-store";
import { listen, emit } from "@tauri-apps/api/event";
import zh from "./zh";
import en from "./en";

export type Lang = "zh" | "en";

const STORE_FILE = "settings.json";
const LANG_KEY = "language";
const LANG_EVENT = "lang:changed";

const store = new LazyStore(STORE_FILE);

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: "zh",
  fallbackLng: "zh",
  interpolation: { escapeValue: false },
});

// Load saved language for this window
store
  .get<Lang>(LANG_KEY)
  .then((saved) => {
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
    }
  })
  .catch(() => {});

// Sync language across windows
listen<Lang>(LANG_EVENT, ({ payload }) => {
  if (payload && payload !== i18n.language) {
    i18n.changeLanguage(payload);
  }
}).catch(() => {});

/// Persist + broadcast the new language to every window.
export async function setLanguage(lang: Lang) {
  await i18n.changeLanguage(lang);
  try {
    await store.set(LANG_KEY, lang);
    await store.save();
    await emit(LANG_EVENT, lang);
  } catch (e) {
    console.error("setLanguage persist failed", e);
  }
}

export default i18n;
