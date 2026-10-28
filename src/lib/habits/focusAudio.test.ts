import { describe, it, expect, vi } from "vitest";
import { focusAudio } from "./focusAudio";

describe("Web Audio Focus Soundscape Engine", () => {
  it("safely handles environments without crashing", () => {
    expect(() => {
      focusAudio.playSoundscape("none");
      focusAudio.stopSoundscape();
      focusAudio.playCompletionChime();
      focusAudio.setMuted(true);
    }).not.toThrow();
  });

  it("handles mock AudioContext properly if present", () => {
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockOsc = {
      type: "sine",
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
    const mockCtx = {
      state: "running",
      currentTime: 10,
      destination: {},
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => mockOsc),
      createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(100) })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        loop: false,
        connect: vi.fn(),
        start: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: "lowpass",
        frequency: { setValueAtTime: vi.fn() },
        Q: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      resume: vi.fn().mockResolvedValue(undefined),
      sampleRate: 44100,
    };

    class MockAudioContext {
      constructor() {
        Object.assign(this, mockCtx);
      }
    }
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    expect(() => {
      focusAudio.playSoundscape("brown");
      focusAudio.playSoundscape("rain");
      focusAudio.playCompletionChime();
      focusAudio.stopSoundscape();
    }).not.toThrow();
  });
});
