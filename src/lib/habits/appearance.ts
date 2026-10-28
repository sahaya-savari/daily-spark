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
    subtitle: "Refined Neo-Retro & Warm Terracotta",
    fontDisplay: '"Block Craft", "JetBrains Mono", monospace',
    fontApp: '"JetBrains Mono", ui-monospace, monospace',
    bg: "#17171D",
    surface: "#24242C",
    surface2: "#2A2A34",
    fg: "#FAF7F5",
    muted: "#8F8D88",
    accent: "oklch(0.68 0.12 50)",
    border: "rgba(255, 255, 255, 0.09)",
    radius: "16px",
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    subtitle: "Zen Swiss & Pure Monospace",
    fontDisplay: '"Geist Mono", "JetBrains Mono", "SF Mono", "Menlo", monospace',
    fontApp: '"Geist Mono", "JetBrains Mono", "SF Mono", "Menlo", monospace',
    bg: "#000000",
    surface: "#0D0D0D",
    surface2: "#171717",
    fg: "#FFFFFF",
    muted: "#71717A",
    accent: "#FF5722",
    border: "rgba(255, 255, 255, 0.12)",
    radius: "4px",
  },
  expressive: {
    id: "expressive",
    name: "Expressive",
    subtitle: "Kinetic Neo-Glass 2.0",
    fontDisplay: '"Space Grotesk", "Syne", "Clash Display", sans-serif',
    fontApp: '"Inter Display", system-ui, -apple-system, sans-serif',
    bg: "#06050C",
    surface: "rgba(255, 255, 255, 0.05)",
    surface2: "rgba(255, 255, 255, 0.09)",
    fg: "#F1F5F9",
    muted: "#94A3B8",
    accent: "#06B6D4",
    border: "rgba(6, 182, 212, 0.24)",
    radius: "24px",
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
    // Soft amber warmth blend at night
    root.style.setProperty("--circadian-warmth", circadianWarmth.toFixed(3));
    root.style.setProperty("--circadian-amber-tint", `rgba(217, 119, 6, ${(circadianWarmth * 0.08).toFixed(3)})`);
  } else {
    root.style.setProperty("--circadian-warmth", "0");
    root.style.setProperty("--circadian-amber-tint", "transparent");
  }

  root.style.setProperty("--color-ember", config.accent);
  root.style.setProperty("--ember", config.accent);
  root.style.setProperty("--primary", config.accent);
}
