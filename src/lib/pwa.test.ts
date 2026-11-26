import { Capacitor } from "@capacitor/core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./pwa";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("service worker registration", () => {
  it("registers when the lazy app mounts after window load", () => {
    const register = vi.fn().mockResolvedValue({});
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    registerServiceWorker();

    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/" });
  });

  it("waits for load and registers only once when mounted earlier", () => {
    const register = vi.fn().mockResolvedValue({});
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");
    vi.stubGlobal("navigator", { serviceWorker: { register } });

    registerServiceWorker();
    expect(register).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("load"));
    window.dispatchEvent(new Event("load"));
    expect(register).toHaveBeenCalledTimes(1);
  });

  it("does not register inside the native app", () => {
    vi.spyOn(Capacitor, "isNativePlatform").mockReturnValue(true);
    const listen = vi.spyOn(window, "addEventListener");
    registerServiceWorker();
    expect(listen).not.toHaveBeenCalled();
  });
});
