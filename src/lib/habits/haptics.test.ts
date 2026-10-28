import { describe, it, expect, vi } from "vitest";
import { hapticEngine } from "./haptics";

describe("haptics.ts", () => {
  it("executes haptic patterns safely without throwing", async () => {
    await expect(hapticEngine.tickTap()).resolves.toBeUndefined();
    await expect(hapticEngine.doubleClack()).resolves.toBeUndefined();
    await expect(hapticEngine.crescendoPulse()).resolves.toBeUndefined();
    await expect(hapticEngine.gentleThud()).resolves.toBeUndefined();
  });
});
