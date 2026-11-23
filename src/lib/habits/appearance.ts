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
  glow: string;
  soft: string;
  border: string;
  radius: string;
  heat: [string, string, string, string, string];
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    subtitle: "Quiet terracotta and compact type",
    fontDisplay: '"Geist Mono", ui-monospace, monospace',
    fontApp: 'system-ui, sans-serif',
    bg: "#000000",
    surface: "rgba(22, 16, 13, 0.75)",
    surface2: "rgba(32, 23, 19, 0.85)",
    fg: "#FAF7F5",
    muted: "#A8A29E",
    accent: "#BF7245",
    accentForeground: "#FFFFFF",
    glow: "rgba(191, 114, 69, 0.45)",
    soft: "rgba(191, 114, 69, 0.18)",
    border: "rgba(191, 114, 69, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#2E1B13", "#5A3320", "#8F4E2B", "#BF7245"],
  },
  classic: {
    id: "classic",
    name: "Classic",
    subtitle: "Solar gold and clear, familiar type",
    fontDisplay: '"Inter", system-ui, sans-serif',
    fontApp: '"Inter", system-ui, sans-serif',
    bg: "#000000",
    surface: "#10131B",
    surface2: "#181D29",
    fg: "#F8FAFC",
    muted: "#94A3B8",
    accent: "#F59E0B",
    accentForeground: "#0B0F17",
    glow: "rgba(245, 158, 11, 0.40)",
    soft: "rgba(245, 158, 11, 0.18)",
    border: "rgba(245, 158, 11, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#45330A", "#785B0D", "#D99E0B", "#F59E0B"],
  },
  expressive: {
    id: "expressive",
    name: "Expressive",
    subtitle: "Violet and bold editorial type",
    fontDisplay: '"Mozilla Headline", Georgia, serif',
    fontApp: 'Georgia, serif',
    bg: "#000000",
    surface: "#0A0812",
    surface2: "#130E20",
    fg: "#FFFFFF",
    muted: "#A1A1AA",
    accent: "#8B5CF6",
    accentForeground: "#FFFFFF",
    glow: "rgba(139, 92, 246, 0.45)",
    soft: "rgba(139, 92, 246, 0.18)",
    border: "rgba(139, 92, 246, 0.24)",
    radius: "16px",
    heat: ["rgba(255, 255, 255, 0.05)", "#2E1065", "#5B21B6", "#7C3AED", "#8B5CF6"],
  },
};

const STORAGE_KEY = "streakflame_appearance_theme";

export function applyStoredInterfacePreferences(mode?: ThemeMode): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const root = document.documentElement;
  const config = THEME_CONFIGS[mode ?? getStoredTheme()];
  const font = localStorage.getItem("dailyspark_font_style") || "theme-default";
  const density = localStorage.getItem("dailyspark_density") || "comfortable";
  const iconStyle = localStorage.getItem("dailyspark_icon_style") || "signature-spark";

  const fontFamily = font === "compact-mono"
    ? '"Geist Mono", "JetBrains Mono", monospace'
    : font === "theme-default" ? config.fontApp : '"Inter", system-ui, sans-serif';
  root.style.setProperty("--font-app", fontFamily);
  root.style.setProperty("--font-sans", fontFamily);
  if (font === "compact-mono") {
    root.style.setProperty("--font-display", fontFamily);
  } else if (font === "humanist-display") {
    root.style.setProperty("--font-display", '"Mozilla Headline", Georgia, serif');
  } else {
    root.style.setProperty("--font-display", config.fontDisplay);
  }

  root.classList.remove("density-comfortable", "density-compact");
  root.classList.add(`density-${density === "compact" ? "compact" : "comfortable"}`);
  root.classList.remove("icon-style-signature-spark", "icon-style-minimal-modern", "icon-style-pixel-retro");
  root.classList.add(`icon-style-${iconStyle}`);
}

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

export type ColorMode = "system" | "light" | "dark" | "amoled";

export function accentInk(hex: string): string {
  const rgb = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = rgb.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179 ? "#000000" : "#FFFFFF";
}

export function resetStoredInterfacePreferences(): void {
  for (const key of ["dailyspark_font_style", "dailyspark_density", "dailyspark_icon_style"]) {
    localStorage.removeItem(key);
  }
  applyStoredInterfacePreferences();
}

/**
 * Injects CSS variables and theme classes directly onto the document root.
 * 100% offline, zero network requests, zero CDNs.
 */
export function applyThemeToDocument(
  mode: ThemeMode,
  circadianWarmth = 0,
  options: { colorMode?: ColorMode | undefined; customAccent?: string | null | undefined } = {},
): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const config = THEME_CONFIGS[mode] || THEME_CONFIGS.minimal;

  const light = options.colorMode === "light" || (options.colorMode === "system" &&
    typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: light)").matches);
  const background = light ? "#F8F6F2" : options.colorMode === "dark" || options.colorMode === "system" ? "#111115" : config.bg;
  const surface = light ? "#FFFFFF" : config.surface;
  const surface2 = light ? "#EFEAE5" : config.surface2;
  const foreground = light ? "#211C19" : config.fg;
  const muted = light ? "#625A54" : config.muted;
  const custom = options.customAccent && /^#[0-9a-f]{6}$/i.test(options.customAccent) ? options.customAccent : null;
  const lightAccents: Record<ThemeMode, string> = { minimal: "#914719", classic: "#865200", expressive: "#6D28D9" };
  const accent = custom ?? (light ? lightAccents[config.id] : config.accent);
  // Keep accent text readable on its surrounding surface as well as on filled buttons.
  const textAccent = custom
    ? `color-mix(in srgb, ${accent} 60%, ${light ? "#000000" : "#FFFFFF"})`
    : accent;
  const ink = custom || light ? accentInk(accent) : config.accentForeground;
  const heat = custom || light
    ? [light ? "#E9E3DE" : config.heat[0], ...[25, 45, 70].map((level) => `color-mix(in srgb, ${accent} ${level}%, ${surface})`), accent]
    : config.heat;

  root.classList.toggle("light", light);
  root.style.colorScheme = light ? "light" : "dark";
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

  root.style.setProperty("--surface", surface);
  root.style.setProperty("--surface-2", surface2);
  root.style.setProperty("--card", surface);
  root.style.setProperty("--foreground", foreground);
  root.style.setProperty("--popover", surface);
  root.style.setProperty("--popover-foreground", foreground);
  root.style.setProperty("--card-foreground", foreground);
  root.style.setProperty("--muted-foreground", muted);
  root.style.setProperty("--faint", muted);
  root.style.setProperty("--border", light ? "#D8CEC6" : config.border);
  root.style.setProperty("--ring", textAccent);
  root.style.setProperty("--background", background);
  root.style.setProperty("--color-ember", accent);
  root.style.setProperty("--ember-text", textAccent);
  root.style.setProperty("--ember", accent);
  root.style.setProperty("--ember-glow", custom ? `color-mix(in srgb, ${accent} 40%, transparent)` : config.glow);
  root.style.setProperty("--ember-soft", custom ? `color-mix(in srgb, ${accent} 18%, transparent)` : config.soft);
  root.style.setProperty("--primary", accent);
  root.style.setProperty("--ember-foreground", ink);
  root.style.setProperty("--primary-foreground", ink);
  root.style.setProperty("--heat-0", heat[0]);
  root.style.setProperty("--heat-1", heat[1]);
  root.style.setProperty("--heat-2", heat[2]);
  root.style.setProperty("--heat-3", heat[3]);
  root.style.setProperty("--heat-4", heat[4]);

  // Update <meta name="theme-color"> dynamically
  try {
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute("content", background);
  } catch {
    /* ignore in non-browser env */
  }

  applyStoredInterfacePreferences(config.id);
}
