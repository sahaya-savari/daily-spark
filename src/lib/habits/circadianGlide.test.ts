import { describe, it, expect } from "vitest";
import {
  calculateSolarElevation,
  calculateCircadianWarmth,
  getSolarCircadianStatus,
} from "./circadianGlide";

describe("circadianGlide.ts", () => {
  it("calculates high solar elevation and zero warmth at noon", () => {
    const noon = new Date("2026-06-21T12:00:00");
    const elev = calculateSolarElevation(noon);
    const warmth = calculateCircadianWarmth(noon);

    expect(elev).toBeGreaterThan(30);
    expect(warmth).toBe(0.0);
  });

  it("calculates negative elevation and high warmth at midnight", () => {
    const midnight = new Date("2026-12-21T00:00:00");
    const elev = calculateSolarElevation(midnight);
    const warmth = calculateCircadianWarmth(midnight);

    expect(elev).toBeLessThan(0);
    expect(warmth).toBeGreaterThanOrEqual(0.7);
  });

  it("returns appropriate solar circadian status", () => {
    const midnight = new Date("2026-10-28T23:30:00");
    const status = getSolarCircadianStatus(midnight);

    expect(status.phase).toBe("night");
    expect(status.description).toContain("blue-light reduction");
  });
});
