import { Capacitor } from "@capacitor/core";
import { SITE } from "@/lib/site";

export const UPDATE_STORAGE_KEYS = {
  lastCheck: "dailyspark_last_update_check",
  dismissedVersion: "dailyspark_dismissed_update_version",
  cachedRelease: "dailyspark_cached_latest_release",
} as const;

export interface AvailableUpdate {
  version: string;
  url: string;
}

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 5000;
const GITHUB_LATEST_RELEASE_API =
  "https://api.github.com/repos/sahaya-savari/daily-spark/releases/latest";

/** Parse a version string like "v1.0.2" or "1.0.2" into numeric [major, minor, patch]. */
export function parseSemver(raw: string): [number, number, number] | null {
  const cleaned = raw.trim().replace(/^v/i, "").split("-")[0];
  if (!/^\d+(\.\d+){0,2}$/.test(cleaned)) return null;
  const parts = cleaned.split(".").map((part) => Number.parseInt(part, 10));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/** Return > 0 if `a > b`, < 0 if `a < b`, 0 if equal. */
export function compareSemver(a: string, b: string): number {
  const parsedA = parseSemver(a);
  const parsedB = parseSemver(b);
  if (!parsedA || !parsedB) return 0;
  for (let i = 0; i < 3; i += 1) {
    if (parsedA[i] !== parsedB[i]) {
      return parsedA[i] - parsedB[i];
    }
  }
  return 0;
}

export function isTauriDesktop(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function isNativeOrDesktop(): boolean {
  return Capacitor.isNativePlatform() || isTauriDesktop();
}

export function getInstalledAppVersion(): string {
  if (Capacitor.isNativePlatform()) {
    return SITE.apk.version;
  }
  if (isTauriDesktop()) {
    return SITE.desktop.version;
  }
  return SITE.webVersion;
}

export function dismissAppUpdate(version: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(UPDATE_STORAGE_KEYS.dismissedVersion, version);
  } catch {
    /* ignore storage quota errors */
  }
}

function readCachedRelease(): AvailableUpdate | null {
  try {
    const raw = localStorage.getItem(UPDATE_STORAGE_KEYS.cachedRelease);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AvailableUpdate>;
    if (typeof parsed.version === "string" && typeof parsed.url === "string") {
      return { version: parsed.version, url: parsed.url };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function toAvailableIfNewer(
  release: AvailableUpdate | null,
  currentVersion: string,
): AvailableUpdate | null {
  if (!release) return null;
  if (compareSemver(release.version, currentVersion) <= 0) return null;
  try {
    const dismissed = localStorage.getItem(UPDATE_STORAGE_KEYS.dismissedVersion);
    if (dismissed === release.version) return null;
  } catch {
    /* ignore */
  }
  return release;
}

/**
 * Check GitHub Releases for a newer native/desktop build.
 * Throttled to once every 24h and fails silently when offline.
 */
export async function checkForNativeOrDesktopUpdate(options?: {
  currentVersion?: string;
  force?: boolean;
  now?: number;
}): Promise<AvailableUpdate | null> {
  if (typeof window === "undefined") return null;
  const currentVersion = options?.currentVersion ?? getInstalledAppVersion();
  const now = options?.now ?? Date.now();

  if (!options?.force) {
    try {
      const lastCheckRaw = localStorage.getItem(UPDATE_STORAGE_KEYS.lastCheck);
      if (lastCheckRaw !== null) {
        const lastCheck = Number.parseInt(lastCheckRaw, 10);
        if (Number.isFinite(lastCheck) && now - lastCheck < CHECK_INTERVAL_MS) {
          return toAvailableIfNewer(readCachedRelease(), currentVersion);
        }
      }
    } catch {
      /* ignore */
    }
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return toAvailableIfNewer(readCachedRelease(), currentVersion);
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(GITHUB_LATEST_RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      tag_name?: unknown;
      html_url?: unknown;
      draft?: unknown;
      prerelease?: unknown;
    };
    if (data.draft === true || data.prerelease === true) return null;
    if (typeof data.tag_name !== "string") return null;

    const release: AvailableUpdate = {
      version: data.tag_name.trim(),
      url:
        typeof data.html_url === "string" && data.html_url.startsWith("https://")
          ? data.html_url
          : SITE.releases,
    };

    try {
      localStorage.setItem(UPDATE_STORAGE_KEYS.lastCheck, String(now));
      localStorage.setItem(UPDATE_STORAGE_KEYS.cachedRelease, JSON.stringify(release));
    } catch {
      /* ignore */
    }

    return toAvailableIfNewer(release, currentVersion);
  } catch {
    return toAvailableIfNewer(readCachedRelease(), currentVersion);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
