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
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#000000");
    expect(document.documentElement.style.getPropertyValue("--ember-glow")).toBe(THEME_CONFIGS.minimal.glow);
    expect(document.documentElement.style.getPropertyValue("--ember-soft")).toBe(THEME_CONFIGS.minimal.soft);

    applyThemeToDocument("expressive", 0.75);
    expect(document.documentElement.classList.contains("theme-expressive")).toBe(true);
    expect(document.documentElement.classList.contains("theme-minimal")).toBe(false);
    expect(document.documentElement.style.getPropertyValue("--circadian-warmth")).toBe("0.750");
    expect(document.documentElement.style.getPropertyValue("--heat-0")).toBe("rgba(255, 255, 255, 0.05)");
    expect(document.documentElement.style.getPropertyValue("--heat-4")).toBe(THEME_CONFIGS.expressive.accent);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe("#000000");
    expect(document.documentElement.style.getPropertyValue("--ember-glow")).toBe(THEME_CONFIGS.expressive.glow);
    expect(document.documentElement.style.getPropertyValue("--ember-soft")).toBe(THEME_CONFIGS.expressive.soft);
  });

  it("verifies Tri-Modal theme configs have unified 16px radius and bold pitch black background", () => {
    // 1. Minimal: Warm Terracotta Brown (#BF7245) on black (#000000)
    expect(THEME_CONFIGS.minimal.accent).toBe("#BF7245");
    expect(THEME_CONFIGS.minimal.accentForeground).toBe("#FFFFFF");
    expect(THEME_CONFIGS.minimal.glow).toBe("rgba(191, 114, 69, 0.45)");
    expect(THEME_CONFIGS.minimal.soft).toBe("rgba(191, 114, 69, 0.18)");
    expect(THEME_CONFIGS.minimal.bg).toBe("#000000");
    expect(THEME_CONFIGS.minimal.radius).toBe("16px");

    // 2. Classic: Electric Solar Gold (#F59E0B) on black (#000000) with #0B0F17 foreground contrast
    expect(THEME_CONFIGS.classic.accent).toBe("#F59E0B");
    expect(THEME_CONFIGS.classic.accentForeground).toBe("#0B0F17");
    expect(THEME_CONFIGS.classic.glow).toBe("rgba(245, 158, 11, 0.40)");
    expect(THEME_CONFIGS.classic.soft).toBe("rgba(245, 158, 11, 0.18)");
    expect(THEME_CONFIGS.classic.bg).toBe("#000000");
    expect(THEME_CONFIGS.classic.radius).toBe("16px");

    // 3. Expressive: Electric Violet (#8B5CF6) on black (#000000)
    expect(THEME_CONFIGS.expressive.accent).toBe("#8B5CF6");
    expect(THEME_CONFIGS.expressive.accentForeground).toBe("#FFFFFF");
    expect(THEME_CONFIGS.expressive.glow).toBe("rgba(139, 92, 246, 0.45)");
    expect(THEME_CONFIGS.expressive.soft).toBe("rgba(139, 92, 246, 0.18)");
    expect(THEME_CONFIGS.expressive.bg).toBe("#000000");
    expect(THEME_CONFIGS.expressive.radius).toBe("16px");
  });

  it("changes typography and surface tokens even when a different theme is stored", () => {
    setStoredTheme("classic");
    applyThemeToDocument("expressive");
    const style = document.documentElement.style;
    expect(style.getPropertyValue("--font-sans")).toBe(THEME_CONFIGS.expressive.fontApp);
    expect(style.getPropertyValue("--font-display")).toBe(THEME_CONFIGS.expressive.fontDisplay);
    expect(style.getPropertyValue("--surface")).toBe(THEME_CONFIGS.expressive.surface);
    expect(style.getPropertyValue("--border")).toBe(THEME_CONFIGS.expressive.border);
    applyThemeToDocument("minimal");
    expect(style.getPropertyValue("--font-sans")).toBe(THEME_CONFIGS.minimal.fontApp);
    expect(style.getPropertyValue("--surface")).toBe(THEME_CONFIGS.minimal.surface);
  });

  it("keeps the style while switching color modes and choosing contrasting accent ink", () => {
    applyThemeToDocument("expressive", 0, { colorMode: "light", customAccent: "#ffffff" });
    const root = document.documentElement;
    expect(root.classList.contains("theme-expressive")).toBe(true);
    expect(root.classList.contains("light")).toBe(true);
    expect(root.style.getPropertyValue("--primary-foreground")).toBe("#000000");
    expect(root.style.getPropertyValue("--surface")).toBe("#FFFFFF");
    applyThemeToDocument("expressive", 0, { colorMode: "amoled" });
    expect(root.classList.contains("light")).toBe(false);
    expect(root.style.getPropertyValue("--background")).toBe("#000000");
    expect(root.style.getPropertyValue("--ember")).toBe(THEME_CONFIGS.expressive.accent);
  });

  it("provides an accent-derived heatmap scale for every supported theme", () => {
    for (const mode of ["minimal", "classic", "expressive"] as ThemeMode[]) {
      const config = THEME_CONFIGS[mode];
      expect(config.heat).toHaveLength(5);
      expect(config.heat[4]).toBe(config.accent);
      expect(config.heat[1]).not.toBe(config.heat[4]);
    }
  });
});
