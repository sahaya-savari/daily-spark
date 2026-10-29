import { useSyncExternalStore } from "react";
import { en, type TranslationKey } from "./dictionaries/en";
import { es } from "./dictionaries/es";

export type SupportedLanguage = "en" | "es";

const STORAGE_KEY = "dailyspark_language";

const DICTIONARIES: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en,
  es,
};

let currentLanguage: SupportedLanguage = "en";

// Hydrate from localStorage if in browser environment
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (saved && (saved === "en" || saved === "es")) {
      currentLanguage = saved;
    }
  } catch {
    // Ignore storage access errors
  }
}

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export const i18nActions = {
  getLanguage(): SupportedLanguage {
    return currentLanguage;
  },
  setLanguage(lang: SupportedLanguage) {
    if (currentLanguage === lang) return;
    currentLanguage = lang;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Ignore storage access errors
      }
    }
    emitChange();
  },
};

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot() {
  return currentLanguage;
}

/**
 * Type-safe translation lookup with optional interpolation parameters.
 * Example: `t("today.streak", { count: 5 })` -> `"5d streak"`
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = DICTIONARIES[currentLanguage] || en;
  let text = dict[key] || en[key] || key;

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
    }
  }

  return text;
}

/**
 * React hook for consuming translations with automatic re-render on language change.
 */
export function useTranslation() {
  const language = useSyncExternalStore(subscribe, getSnapshot, () => "en");

  const translate = (key: TranslationKey, params?: Record<string, string | number>) => {
    const dict = DICTIONARIES[language] || en;
    let text = dict[key] || en[key] || key;

    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(value));
      }
    }

    return text;
  };

  return {
    t: translate,
    language,
    setLanguage: i18nActions.setLanguage,
    languages: [
      { code: "en", label: "English" },
      { code: "es", label: "Español" },
    ] as const,
  };
}
