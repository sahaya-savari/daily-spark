export type ThemeMode = "minimal" | "classic" | "expressive";
export type ThemeDensity = "airy" | "balanced" | "compact";
export type ThemeIconStyle = "line" | "heritage" | "bold";

export interface ExpressiveBackground {
  id: string;
  name: string;
  description: string;
  file?: string;
  position?: string;
}

export const EXPRESSIVE_BACKGROUNDS: ExpressiveBackground[] = [
  { id: "abstract", name: "Violet Atmosphere", description: "Lightweight gradient and dither" },
  { id: "moonlit-solitude-sea", name: "Moonlit Sea", description: "Quiet moon over open water", file: "moonlit-solitude-sea.webp" },
  { id: "starry-countryside-twilight", name: "Country Twilight", description: "Purple fields beneath the stars", file: "starry-countryside-twilight.webp" },
  { id: "starlit-mountain-path", name: "Mountain Path", description: "A luminous path through the night", file: "starlit-mountain-path.webp" },
  { id: "snowy-lakeside-dawn", name: "Lakeside Dawn", description: "Soft light across a snowy lake", file: "snowy-lakeside-dawn.webp" },
  { id: "moonlit-rain-rural-paddies", name: "Moonlit Rain", description: "Rain over peaceful rural fields", file: "moonlit-rain-rural-paddies.webp" },
  { id: "afternoon-train-cherry-blossoms", name: "Cherry Train", description: "A bright journey through blossoms", file: "afternoon-train-cherry-blossoms.webp" },
  { id: "cozy-room-comet-sky", name: "Comet Room", description: "Warm focus beneath a comet sky", file: "cozy-room-comet-sky.webp" },
  { id: "moonlit-village-festival", name: "Village Festival", description: "Lantern light under a violet night", file: "moonlit-village-festival.webp" },
  { id: "moonlit-earth-clouds", name: "Earth & Clouds", description: "A quiet view beyond the clouds", file: "moonlit-earth-clouds.webp" },
];

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  subtitle: string;
  personality: string;
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
  cardRadius: string;
  shadow: string;
  density: ThemeDensity;
  iconStyle: ThemeIconStyle;
  motionScale: string;
  heat: [string, string, string, string, string];
}

export const THEME_CONFIGS: Record<ThemeMode, ThemeConfig> = {
  minimal: {
    id: "minimal", name: "Minimal", subtitle: "Quiet, flat, and distraction-free",
    personality: "Clean neutral surfaces, simple line icons, generous space",
    fontDisplay: '"Inter Local", Inter, system-ui, sans-serif', fontApp: '"Inter Local", Inter, system-ui, sans-serif',
    bg: "#0C0D0F", surface: "rgba(22, 23, 26, 0.94)", surface2: "rgba(31, 32, 36, 0.96)",
    fg: "#F7F7F5", muted: "#A3A3A0", accent: "#D48A5B", accentForeground: "#16100C",
    glow: "rgba(212, 138, 91, 0.22)", soft: "rgba(212, 138, 91, 0.12)", border: "rgba(255, 255, 255, 0.09)",
    radius: "12px", cardRadius: "16px", shadow: "0 10px 30px -24px rgba(0, 0, 0, 0.8)",
    density: "airy", iconStyle: "line", motionScale: "0.72",
    heat: ["rgba(255,255,255,.05)", "#302018", "#603A25", "#9B5D38", "#D48A5B"],
  },
  classic: {
    id: "classic", name: "Classic", subtitle: "Warm editorial character",
    personality: "Heritage type, amber details, tactile framed surfaces",
    fontDisplay: 'Georgia, "Times New Roman", serif', fontApp: '"Inter Local", Inter, system-ui, sans-serif',
    bg: "#100D09", surface: "rgba(32, 25, 17, 0.96)", surface2: "rgba(46, 36, 24, 0.98)",
    fg: "#FFF7E8", muted: "#C3B39A", accent: "#E8A83A", accentForeground: "#241708",
    glow: "rgba(232, 168, 58, 0.32)", soft: "rgba(232, 168, 58, 0.15)", border: "rgba(232, 168, 58, 0.22)",
    radius: "8px", cardRadius: "12px", shadow: "0 18px 44px -28px rgba(0, 0, 0, 0.92)",
    density: "compact", iconStyle: "heritage", motionScale: "0.86",
    heat: ["rgba(255,255,255,.05)", "#49350E", "#7F5C12", "#C98A21", "#E8A83A"],
  },
  expressive: {
    id: "expressive", name: "Expressive", subtitle: "Bold modern atmosphere",
    personality: "Violet glass, cinematic backgrounds, energetic motion",
    fontDisplay: '"Space Grotesk Local", "Inter Local", system-ui, sans-serif', fontApp: '"Inter Local", Inter, system-ui, sans-serif',
    bg: "#08060F", surface: "rgba(15, 11, 27, 0.82)", surface2: "rgba(28, 20, 48, 0.88)",
    fg: "#FFFFFF", muted: "#B9B2C8", accent: "#9B6DFF", accentForeground: "#FFFFFF",
    glow: "rgba(155, 109, 255, 0.48)", soft: "rgba(155, 109, 255, 0.18)", border: "rgba(174, 139, 255, 0.25)",
    radius: "18px", cardRadius: "26px", shadow: "0 24px 64px -32px rgba(91, 33, 182, 0.82)",
    density: "balanced", iconStyle: "bold", motionScale: "1",
    heat: ["rgba(255,255,255,.06)", "#2E1065", "#5B21B6", "#7C3AED", "#9B6DFF"],
  },
};

const STORAGE_KEY = "streakflame_appearance_theme";
const LEGACY_STYLE_KEYS = ["dailyspark_font_style", "dailyspark_density", "dailyspark_icon_style"];

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "minimal";
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "minimal" || stored === "expressive" || stored === "classic" ? stored : "minimal";
}

export function setStoredTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyThemeToDocument(mode);
}

export function clearLegacyStyleOverrides(): void {
  if (typeof window === "undefined") return;
  LEGACY_STYLE_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function resolveExpressiveBackground(id?: string): ExpressiveBackground {
  return EXPRESSIVE_BACKGROUNDS.find((background) => background.id === id) || EXPRESSIVE_BACKGROUNDS[0];
}

export function applyThemeToDocument(mode: ThemeMode, circadianWarmth = 0, expressiveBackground = "abstract"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const config = THEME_CONFIGS[mode] || THEME_CONFIGS.minimal;
  const background = resolveExpressiveBackground(expressiveBackground);

  root.classList.remove("theme-classic", "theme-minimal", "theme-expressive", "density-airy", "density-balanced", "density-compact", "icons-line", "icons-heritage", "icons-bold");
  root.classList.add(`theme-${mode}`, `density-${config.density}`, `icons-${config.iconStyle}`);
  const tokens: Record<string, string> = {
    "--font-display": config.fontDisplay, "--font-app": config.fontApp, "--font-mono": '"JetBrains Mono", ui-monospace, monospace',
    "--radius": config.radius, "--theme-card-radius": config.cardRadius, "--theme-shadow": config.shadow, "--theme-motion-scale": config.motionScale,
    "--background": config.bg, "--foreground": config.fg, "--surface": config.surface, "--surface-2": config.surface2,
    "--card": config.surface, "--card-foreground": config.fg, "--popover": config.surface, "--popover-foreground": config.fg,
    "--secondary": config.surface2, "--secondary-foreground": config.fg, "--muted": config.surface2,
    "--muted-foreground": config.muted, "--faint": config.muted, "--faint-dim": config.muted,
    "--accent": config.surface2, "--accent-foreground": config.fg, "--border": config.border, "--border-hi": config.border,
    "--input": config.border, "--ring": config.accent, "--scrim": "rgba(0,0,0,.72)",
    "--sidebar": config.surface, "--sidebar-foreground": config.fg, "--sidebar-primary": config.accent,
    "--sidebar-primary-foreground": config.accentForeground, "--sidebar-accent": config.surface2,
    "--sidebar-accent-foreground": config.fg, "--sidebar-border": config.border, "--sidebar-ring": config.accent,
    "--color-ember": config.accent, "--ember": config.accent, "--cta": config.accent,
    "--cta-foreground": config.accentForeground, "--brass": config.accent, "--gold": config.accent,
    "--ember-glow": config.glow, "--ember-soft": config.soft, "--primary": config.accent,
    "--ember-foreground": config.accentForeground, "--primary-foreground": config.accentForeground,
  };
  Object.entries(tokens).forEach(([key, value]) => root.style.setProperty(key, value));
  config.heat.forEach((value, index) => root.style.setProperty(`--heat-${index}`, value));

  const base = import.meta.env.BASE_URL || "/";
  root.style.setProperty("--theme-wallpaper", mode === "expressive" && background.file ? `url("${base}backgrounds/expressive/${background.file}")` : "none");
  root.style.setProperty("--theme-wallpaper-position", background.position || "center");
  root.dataset.expressiveBackground = background.id;
  root.style.setProperty("--circadian-warmth", circadianWarmth.toFixed(3));
  root.style.setProperty("--circadian-amber-tint", circadianWarmth > 0 ? `rgba(236, 137, 76, ${(circadianWarmth * 0.06).toFixed(3)})` : "transparent");
  clearLegacyStyleOverrides();

  const existingMeta = document.querySelector('meta[name="theme-color"]');
  const metaTheme = existingMeta || document.head.appendChild(document.createElement("meta"));
  metaTheme.setAttribute("name", "theme-color");
  metaTheme.setAttribute("content", config.bg);
}
