import { describe, it, expect, beforeEach } from "vitest";
import {
  getStoredTheme,
  setStoredTheme,
  applyThemeToDocument,
  THEME_CONFIGS,
  type ThemeMode,
} from "./appearance";

describe("appearance.ts", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.documentElement.removeAttribute("style");
  });

  it("defaults to the clean minimal preset if none is stored", () => {
    expect(getStoredTheme()).toBe("minimal");
  });

  it("stores and retrieves theme correctly", () => {
    setStoredTheme("classic");
    expect(getStoredTheme()).toBe("classic");

    setStoredTheme("expressive");
    expect(getStoredTheme()).toBe("expressive");

    setStoredTheme("minimal");
    expect(getStoredTheme()).toBe("minimal");
  });

  it("applies theme classes and CSS variables to documentElement", () => {
    applyThemeToDocument("minimal");
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--radius")).toBe(THEME_CONFIGS.minimal.radius);
    expect(document.documentElement.style.getPropertyValue("--font-display")).toBe(THEME_CONFIGS.minimal.fontDisplay);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(THEME_CONFIGS.minimal.bg);
    expect(document.documentElement.classList.contains("density-airy")).toBe(true);
    expect(document.documentElement.classList.contains("icons-line")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--ember-glow")).toBe(THEME_CONFIGS.minimal.glow);
    expect(document.documentElement.style.getPropertyValue("--ember-soft")).toBe(THEME_CONFIGS.minimal.soft);

    applyThemeToDocument("expressive", 0.75, "cozy-room-comet-sky");
    expect(document.documentElement.classList.contains("theme-expressive")).toBe(true);
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--circadian-warmth")).toBe("0.750");
    expect(document.documentElement.style.getPropertyValue("--heat-0")).toBe(THEME_CONFIGS.expressive.heat[0]);
    expect(document.documentElement.style.getPropertyValue("--heat-4")).toBe(THEME_CONFIGS.expressive.accent);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(THEME_CONFIGS.expressive.bg);
    expect(document.documentElement.style.getPropertyValue("--theme-wallpaper")).toContain("cozy-room-comet-sky.webp");
    expect(document.documentElement.classList.contains("icons-bold")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--ember-glow")).toBe(THEME_CONFIGS.expressive.glow);
    expect(document.documentElement.style.getPropertyValue("--ember-soft")).toBe(THEME_CONFIGS.expressive.soft);
  });

  it("gives every preset a complete and distinct visual identity", () => {
    const configs = Object.values(THEME_CONFIGS);
    expect(new Set(configs.map((config) => config.fontDisplay)).size).toBe(3);
    expect(new Set(configs.map((config) => config.radius)).size).toBe(3);
    expect(new Set(configs.map((config) => config.density)).size).toBe(3);
    expect(new Set(configs.map((config) => config.iconStyle)).size).toBe(3);
    expect(THEME_CONFIGS.minimal.iconStyle).toBe("line");
    expect(THEME_CONFIGS.classic.iconStyle).toBe("heritage");
    expect(THEME_CONFIGS.expressive.iconStyle).toBe("bold");
  });
});
