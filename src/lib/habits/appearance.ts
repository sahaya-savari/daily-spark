export type ThemeMode = "minimal" | "classic" | "expressive";

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
  accentForeground: string;
  border: string;
  radius: string;
  heat: [string, string, string, string, string];
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    subtitle: "Warm Terracotta Brown",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", "JetBrains Mono", monospace',
    bg: "#0A0A0A",
    surface: "rgba(30, 22, 18, 0.65)",
    surface2: "rgba(42, 31, 26, 0.75)",
    fg: "#FAF7F5",
    muted: "#A8A29E",
    accent: "#BF7245",
    accentForeground: "#FFFFFF",
    border: "rgba(191, 114, 69, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#2E1B13", "#5A3320", "#8F4E2B", "#BF7245"],
  },
  classic: {
    id: "classic",
    name: "Classic",
    subtitle: "Electric Solar Gold on Cosmic Black",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", system-ui, sans-serif',
    bg: "#0A0A0A",
    surface: "#141824",
    surface2: "#1E2433",
    fg: "#F8FAFC",
    muted: "#94A3B8",
    accent: "#F59E0B",
    accentForeground: "#0B0F17",
    border: "rgba(245, 158, 11, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#45330A", "#785B0D", "#D99E0B", "#F59E0B"],
  },
  expressive: {
    id: "expressive",
    name: "Expressive",
    subtitle: "Electric Violet on Deep Obsidian",
    fontDisplay: '"Mozilla Headline", sans-serif',
    fontApp: '"Inter", system-ui, sans-serif',
    bg: "#0A0A0A",
    surface: "#0D0A17",
    surface2: "#171226",
    fg: "#FFFFFF",
    muted: "#A1A1AA",
    accent: "#8B5CF6",
    accentForeground: "#FFFFFF",
    border: "rgba(139, 92, 246, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#2E1065", "#5B21B6", "#7C3AED", "#8B5CF6"],
  },
};

const STORAGE_KEY = "streakflame_appearance_theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "minimal";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "minimal" || stored === "expressive" || stored === "classic") {
    return stored;
  }
  return "minimal";
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
  const config = THEME_CONFIGS[mode] || THEME_CONFIGS.minimal;

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

  // Ensure background stays deep black across all themes
  root.style.setProperty("--background", config.bg);
  root.style.setProperty("--color-ember", config.accent);
  root.style.setProperty("--ember", config.accent);
  root.style.setProperty("--primary", config.accent);
  root.style.setProperty("--ember-foreground", config.accentForeground);
  root.style.setProperty("--primary-foreground", config.accentForeground);
  root.style.setProperty("--heat-0", config.heat[0]);
  root.style.setProperty("--heat-1", config.heat[1]);
  root.style.setProperty("--heat-2", config.heat[2]);
  root.style.setProperty("--heat-3", config.heat[3]);
  root.style.setProperty("--heat-4", config.heat[4]);

  // Update <meta name="theme-color"> dynamically
  try {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute("content", config.bg);
  } catch {
    /* ignore in non-browser env */
  }
}
