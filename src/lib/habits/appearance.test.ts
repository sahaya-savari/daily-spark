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

  it("defaults to classic theme if none is stored", () => {
    expect(getStoredTheme()).toBe("classic");
  });

  it("stores and retrieves theme correctly", () => {
    setStoredTheme("minimal");
    expect(getStoredTheme()).toBe("minimal");

    setStoredTheme("expressive");
    expect(getStoredTheme()).toBe("expressive");
  });

  it("applies theme classes and CSS variables to documentElement", () => {
    applyThemeToDocument("minimal");
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--radius")).toBe(THEME_CONFIGS.minimal.radius);
    expect(document.documentElement.style.getPropertyValue("--font-display")).toBe(THEME_CONFIGS.minimal.fontDisplay);

    applyThemeToDocument("expressive", 0.75);
    expect(document.documentElement.classList.contains("theme-expressive")).toBe(true);
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--circadian-warmth")).toBe("0.750");
  });

  it("verifies Tri-Modal theme configs have unified 16px radius and distinct palettes", () => {
    // 1. Classic: Electric Yellow (#FACC15) on Cosmic Black (#0A0A0E)
    expect(THEME_CONFIGS.classic.accent).toBe("#FACC15");
    expect(THEME_CONFIGS.classic.bg).toBe("#0A0A0E");
    expect(THEME_CONFIGS.classic.radius).toBe("16px");

    // 2. Expressive: Solar Amber (#EC894C) on True AMOLED Black (#000000)
    expect(THEME_CONFIGS.expressive.accent).toBe("#EC894C");
    expect(THEME_CONFIGS.expressive.bg).toBe("#000000");
    expect(THEME_CONFIGS.expressive.radius).toBe("16px");

    // 3. Minimal: Warm Terracotta (#BF7245)
    expect(THEME_CONFIGS.minimal.accent).toBe("#BF7245");
    expect(THEME_CONFIGS.minimal.radius).toBe("16px");
  });
});

