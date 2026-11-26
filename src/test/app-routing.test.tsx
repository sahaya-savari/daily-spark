import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { StandaloneApp } from "@/components/app/StandaloneApp";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
    });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches valid public routes", () => {
    const router = createRouter({
      routeTree,
    });

    const featuresMatch = router.matchRoutes("/features");
    expect(featuresMatch.at(-1)?.routeId).toBe("/features");

    const screensMatch = router.matchRoutes("/screens");
    expect(screensMatch.at(-1)?.routeId).toBe("/screens");

    const downloadMatch = router.matchRoutes("/download");
    expect(downloadMatch.at(-1)?.routeId).toBe("/download");

    const privacyMatch = router.matchRoutes("/privacy");
    expect(privacyMatch.at(-1)?.routeId).toBe("/privacy");
  });

  it("matches the local full-screen tracker at /app", () => {
    const router = createRouter({
      routeTree,
    });

    const matches = router.matchRoutes("/app");

    expect(matches.at(-1)?.routeId).toBe("/app");
  });

  describe("RootPage component", () => {
    it("renders the lazy marketing page on web", async () => {
      const { RootPage } = await import("@/routes/index");
      const { LazyLandingPage } = await import("@/components/landing/LazyLandingPage");
      const page = RootPage();
      expect(page.type).toBe(LazyLandingPage);
    });

    it("renders the lazy standalone app on native Capacitor platform", async () => {
      const { RootPage } = await import("@/routes/index");

      const original = (window as unknown as { Capacitor?: unknown }).Capacitor;
      (
        window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }
      ).Capacitor = {
        isNativePlatform: () => true,
      };

      try {
        const page = RootPage();
        expect(page.type).toBe(StandaloneApp);
      } finally {
        (window as unknown as { Capacitor?: unknown }).Capacitor = original;
      }
    });

    it("renders the lazy standalone app when androidBridge is present", async () => {
      const { RootPage } = await import("@/routes/index");

      const original = (window as unknown as { androidBridge?: unknown })
        .androidBridge;
      (window as unknown as { androidBridge?: unknown }).androidBridge = {};

      try {
        const page = RootPage();
        expect(page.type).toBe(StandaloneApp);
      } finally {
        (window as unknown as { androidBridge?: unknown }).androidBridge =
          original;
      }
    });
  });
});
