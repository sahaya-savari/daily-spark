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

  it("defaults to minimal (warm terracotta brown) theme if none is stored", () => {
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
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#0A0A0A");

    applyThemeToDocument("expressive", 0.75);
    expect(document.documentElement.classList.contains("theme-expressive")).toBe(true);
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--circadian-warmth")).toBe("0.750");
    expect(document.documentElement.style.getPropertyValue("--heat-0")).toBe("rgba(255, 255, 255, 0.05)");
    expect(document.documentElement.style.getPropertyValue("--heat-4")).toBe(THEME_CONFIGS.expressive.accent);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#0A0A0A");
  });

  it("verifies Tri-Modal theme configs have unified 16px radius and black background", () => {
    // 1. Minimal: Warm Terracotta Brown (#BF7245) on black (#0A0A0A)
    expect(THEME_CONFIGS.minimal.accent).toBe("#BF7245");
    expect(THEME_CONFIGS.minimal.accentForeground).toBe("#FFFFFF");
    expect(THEME_CONFIGS.minimal.bg).toBe("#0A0A0A");
    expect(THEME_CONFIGS.minimal.radius).toBe("16px");

    // 2. Classic: Electric Solar Gold (#F59E0B) on black (#0A0A0A) with #0B0F17 foreground contrast
    expect(THEME_CONFIGS.classic.accent).toBe("#F59E0B");
    expect(THEME_CONFIGS.classic.accentForeground).toBe("#0B0F17");
    expect(THEME_CONFIGS.classic.bg).toBe("#0A0A0A");
    expect(THEME_CONFIGS.classic.radius).toBe("16px");

    // 3. Expressive: Electric Violet (#8B5CF6) on black (#0A0A0A)
    expect(THEME_CONFIGS.expressive.accent).toBe("#8B5CF6");
    expect(THEME_CONFIGS.expressive.accentForeground).toBe("#FFFFFF");
    expect(THEME_CONFIGS.expressive.bg).toBe("#0A0A0A");
    expect(THEME_CONFIGS.expressive.radius).toBe("16px");
  });
});
