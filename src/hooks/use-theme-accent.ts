import { useEffect, useState } from "react";
import { THEME_CONFIGS, getStoredTheme, type ThemeMode } from "@/lib/habits/appearance";

/**
 * Returns the current theme's accent hex color by reading `--ember` from the
 * DOM. Falls back to the stored theme config if the CSS variable isn't
 * available yet (SSR / first paint).
 *
 * Re-syncs whenever the `theme-*` class on `<html>` changes (via MutationObserver).
 */
export function useThemeAccent(): string {
  const [accent, setAccent] = useState<string>(() => {
    if (typeof document === "undefined") return THEME_CONFIGS.classic.accent;
    return readAccent() ?? THEME_CONFIGS[getStoredTheme()].accent;
  });

  useEffect(() => {
    // Initial read
    const initial = readAccent();
    if (initial) setAccent(initial);

    // Watch for class changes on <html> (theme switches call classList.add/remove)
    const observer = new MutationObserver(() => {
      const next = readAccent();
      if (next) setAccent(next);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  return accent;
}

/**
 * Reads the active theme mode from the <html> class list and returns its
 * accent color from the config, or reads the computed --ember CSS variable.
 */
function readAccent(): string | null {
  if (typeof document === "undefined") return null;
  const root = document.documentElement;

  // Prefer reading from theme config for exact hex (computed style may
  // return rgb() which DiaTextReveal uses in gradient stops).
  const classes = root.classList;
  const modes: ThemeMode[] = ["classic", "minimal", "expressive"];
  for (const m of modes) {
    if (classes.contains(`theme-${m}`)) {
      return THEME_CONFIGS[m].accent;
    }
  }

  // Fallback: computed CSS variable
  const computed = getComputedStyle(root).getPropertyValue("--ember").trim();
  return computed || null;
}
