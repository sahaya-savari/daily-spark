export type ThemeMode = "classic" | "minimal" | "expressive";

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  subtitle: string;
  fontDisplay: string;
  fontApp: string;
  bg: string;
  surface: string;
  surface2: string;
  fg: string;
  muted: string;
  accent: string;
  border: string;
  radius: string;
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  classic: {
    id: "classic",
    name: "Classic",
    subtitle: "Electric Yellow on Cosmic Black",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", system-ui, sans-serif',
    bg: "#0A0A0E",
    surface: "#14141A",
    surface2: "#1C1C24",
    fg: "#F8FAFC",
    muted: "#94A3B8",
    accent: "#FACC15",
    border: "rgba(250, 204, 21, 0.24)",
    radius: "16px",
  },
  expressive: {
    id: "expressive",
    name: "Expressive",
    subtitle: "Solar Amber on True AMOLED Black",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", system-ui, sans-serif',
    bg: "#000000",
    surface: "#0D0D0D",
    surface2: "#181818",
    fg: "#FFFFFF",
    muted: "#A1A1AA",
    accent: "#EC894C",
    border: "rgba(236, 137, 76, 0.24)",
    radius: "16px",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    subtitle: "Warm Terracotta Frosted Glass",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", "JetBrains Mono", monospace',
    bg: "#0F0F12",
    surface: "rgba(25, 25, 32, 0.65)",
    surface2: "rgba(35, 35, 45, 0.75)",
    fg: "#FAF7F5",
    muted: "#A8A29E",
    accent: "#BF7245",
    border: "rgba(191, 114, 69, 0.24)",
    radius: "16px",
  },
};

const STORAGE_KEY = "streakflame_appearance_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "classic";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "minimal" || stored === "expressive" || stored === "classic") {
    return stored;
  }
  return "classic";
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyThemeToDocument(mode);
}

/**
 * Injects CSS variables and theme classes directly onto the document root.
 * 100% offline, zero network requests, zero CDNs.
 */
export function applyThemeToDocument(mode: ThemeMode, circadianWarmth = 0): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const config = THEME_CONFIGS[mode] || THEME_CONFIGS.classic;

  // Set theme classes
  root.classList.remove("theme-classic", "theme-minimal", "theme-expressive");
  root.classList.add(`theme-${mode}`);

  // Base CSS variable injection
  root.style.setProperty("--font-display", config.fontDisplay);
  root.style.setProperty("--font-app", config.fontApp);
  root.style.setProperty("--font-mono", '"Geist Mono", "JetBrains Mono", monospace');
  root.style.setProperty("--radius", config.radius);

  // Apply solar circadian warmth shift if night warmth is active (> 0)
  if (circadianWarmth > 0) {
    // Soft ember warmth blend at night
    root.style.setProperty("--circadian-warmth", circadianWarmth.toFixed(3));
    root.style.setProperty("--circadian-amber-tint", `rgba(236, 137, 76, ${(circadianWarmth * 0.08).toFixed(3)})`);
  } else {
    root.style.setProperty("--circadian-warmth", "0");
    root.style.setProperty("--circadian-amber-tint", "transparent");
  }

  root.style.setProperty("--color-ember", config.accent);
  root.style.setProperty("--ember", config.accent);
  root.style.setProperty("--primary", config.accent);
}
