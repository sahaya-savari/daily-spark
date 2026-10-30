import { Capacitor } from "@capacitor/core";

export type LauncherMode = "native" | "tauri" | "pwa-standalone" | "pwa-param" | "web-landing";

export interface LauncherDetectionResult {
  isApp: boolean;
  mode: LauncherMode;
}

/**
 * Detects whether the current session is executing within a standalone application
 * context (Capacitor native shell, Tauri 2 desktop runner, installed PWA standalone
 * display-mode, or desktop executable runner).
 */
export function detectAppLauncher(): LauncherDetectionResult {
  if (typeof window === "undefined") {
    return { isApp: false, mode: "web-landing" };
  }

  // 1. Capacitor Native Platform (Android / iOS)
  const isCapacitor =
    Capacitor.isNativePlatform() ||
    Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()) ||
    Boolean((window as unknown as { androidBridge?: unknown }).androidBridge) ||
    window.location.protocol === "capacitor:" ||
    window.location.protocol === "file:" ||
    (window.location.hostname === "localhost" && window.location.port === "");

  if (isCapacitor) {
    return { isApp: true, mode: "native" };
  }

  // 2. Tauri 2 Desktop Shell
  const isTauri =
    Boolean((window as unknown as { __TAURI__?: unknown }).__TAURI__) ||
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);

  if (isTauri) {
    return { isApp: true, mode: "tauri" };
  }

  // 3. PWA Display-Mode (standalone, window-controls-overlay, minimal-ui, fullscreen)
  try {
    const isStandaloneDisplay =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.matchMedia?.("(display-mode: window-controls-overlay)")?.matches ||
      window.matchMedia?.("(display-mode: minimal-ui)")?.matches ||
      window.matchMedia?.("(display-mode: fullscreen)")?.matches;

    if (isStandaloneDisplay) {
      return { isApp: true, mode: "pwa-standalone" };
    }
  } catch {
    // Ignore matchMedia evaluation failures in constrained test environments
  }

  // 4. iOS Safari Standalone Homescreen Mode
  if ((window.navigator as unknown as { standalone?: boolean })?.standalone === true) {
    return { isApp: true, mode: "pwa-standalone" };
  }

  // 5. URL Launcher Parameters (?mode=app, ?source=pwa, ?launcher=desktop, ?app=true)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");
    const source = searchParams.get("source");
    const launcher = searchParams.get("launcher");
    const app = searchParams.get("app");

    if (
      mode === "app" ||
      source === "pwa" ||
      source === "desktop" ||
      launcher === "true" ||
      launcher === "1" ||
      app === "true" ||
      app === "1"
    ) {
      return { isApp: true, mode: "pwa-param" };
    }
  } catch {
    // Ignore search param errors
  }

  return { isApp: false, mode: "web-landing" };
}

export function isStandaloneApp(): boolean {
  return detectAppLauncher().isApp;
}
