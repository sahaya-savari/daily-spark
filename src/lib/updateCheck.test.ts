import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkForNativeOrDesktopUpdate,
  compareSemver,
  dismissAppUpdate,
  UPDATE_STORAGE_KEYS,
} from "./updateCheck";

describe("updateCheck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("compares semantic versions accurately", () => {
    expect(compareSemver("v1.0.2", "v1.0.1")).toBeGreaterThan(0);
    expect(compareSemver("2.0.0", "1.9.9")).toBeGreaterThan(0);
    expect(compareSemver("v1.0.2", "1.0.2")).toBe(0);
    expect(compareSemver("v1.0.1", "v1.0.2")).toBeLessThan(0);
  });

  it("returns available update when a newer GitHub release exists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: "v1.0.2",
        html_url: "https://github.com/sahaya-savari/daily-spark/releases/tag/v1.0.2",
        draft: false,
        prerelease: false,
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const update = await checkForNativeOrDesktopUpdate({
      currentVersion: "v1.0.1",
      now: 1000,
    });

    expect(update).toEqual({
      version: "v1.0.2",
      url: "https://github.com/sahaya-savari/daily-spark/releases/tag/v1.0.2",
    });
  });

  it("throttles network checks and respects dismissed versions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: "v2.0.0",
        html_url: "https://github.com/sahaya-savari/daily-spark/releases/tag/v2.0.0",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const first = await checkForNativeOrDesktopUpdate({
      currentVersion: "v1.0.2",
      now: 1_000_000,
    });
    expect(first?.version).toBe("v2.0.0");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Second check within 24h uses cache without fetching
    const second = await checkForNativeOrDesktopUpdate({
      currentVersion: "v1.0.2",
      now: 1_000_000 + 60_000,
    });
    expect(second?.version).toBe("v2.0.0");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Dismissing hides it
    dismissAppUpdate("v2.0.0");
    expect(localStorage.getItem(UPDATE_STORAGE_KEYS.dismissedVersion)).toBe("v2.0.0");
    const afterDismiss = await checkForNativeOrDesktopUpdate({
      currentVersion: "v1.0.2",
      now: 1_000_000 + 120_000,
    });
    expect(afterDismiss).toBeNull();
  });

  it("fails silently when offline or fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const update = await checkForNativeOrDesktopUpdate({
      currentVersion: "v1.0.1",
      force: true,
    });
    expect(update).toBeNull();
  });
});
