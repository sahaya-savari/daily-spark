import { describe, it, expect } from "vitest";
import { BINAURAL_PRESETS, BinauralEngine } from "./binaural";

describe("binaural.ts", () => {
  it("defines calibrated frequencies for Alpha, Theta, and Beta states", () => {
    expect(BINAURAL_PRESETS.alpha.carrierLeftHz - BINAURAL_PRESETS.alpha.carrierRightHz).toBe(10);
    expect(BINAURAL_PRESETS.theta.carrierLeftHz - BINAURAL_PRESETS.theta.carrierRightHz).toBe(6);
    expect(BINAURAL_PRESETS.beta.carrierLeftHz - BINAURAL_PRESETS.beta.carrierRightHz).toBe(18);
  });

  it("handles engine lifecycle safely without crashing in test environment", () => {
    const engine = new BinauralEngine();
    expect(engine.getActivePreset()).toBeNull();
    engine.play("alpha");
    engine.setMuted(true);
    engine.stop();
    expect(engine.getActivePreset()).toBeNull();
  });
});
