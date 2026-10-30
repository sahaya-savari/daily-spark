import { describe, it, expect, beforeEach } from "vitest";
import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  i18nActions,
  t,
} from "./index";

describe("i18n internationalization", () => {
  beforeEach(() => {
    localStorage.clear();
    i18nActions.setLanguage("en");
  });

  it("registers 10 supported languages including Indian languages", () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toEqual([
      "en",
      "es",
      "hi",
      "ta",
      "te",
      "ml",
      "kn",
      "ur",
      "fr",
      "de",
    ]);
    expect(SUPPORTED_LANGUAGES.length).toBe(10);
  });

  it.each([
    ["en", "Today", "Settings"],
    ["es", "Hoy", "Ajustes"],
    ["hi", "आज", "सेटिंग्स"],
    ["ta", "இன்று", "அமைப்புகள்"],
    ["te", "ఈరోజు", "సెట్టింగ్‌లు"],
    ["ml", "ഇന്ന്", "ക്രമീകരണങ്ങൾ"],
    ["kn", "ಇಂದು", "ಸೆಟ್ಟಿಂಗ್‌ಗಳು"],
    ["ur", "آج", "ترتیبات"],
    ["fr", "Aujourd'hui", "Paramètres"],
    ["de", "Heute", "Einstellungen"],
  ] as const)(
    "translates nav.today and settings.title for language '%s'",
    (lang: SupportedLanguage, expectedToday: string, expectedSettings: string) => {
      i18nActions.setLanguage(lang);
      expect(i18nActions.getLanguage()).toBe(lang);
      expect(t("nav.today")).toBe(expectedToday);
      expect(t("settings.title")).toBe(expectedSettings);
    }
  );

  it("handles string parameter interpolation properly", () => {
    i18nActions.setLanguage("en");
    expect(t("today.streak", { count: 7 })).toBe("7d streak");
    expect(t("today.doneCount", { done: 3, total: 5 })).toBe(
      "3 of 5 completed"
    );
    expect(t("common.version", { version: "1.0.1" })).toBe("Version 1.0.1");
  });
});
