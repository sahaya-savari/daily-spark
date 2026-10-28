/**
 * Procedural Binaural Beats Engine
 * Generates true stereo differential frequencies for cognitive brainwave entrainment
 * combined with procedural pink noise (0 KB asset download, 100% offline).
 */

export type BinauralWaveType = "alpha" | "theta" | "beta";

export interface BinauralPreset {
  type: BinauralWaveType;
  name: string;
  beatFrequencyHz: number;
  carrierLeftHz: number;
  carrierRightHz: number;
  description: string;
}

export const BINAURAL_PRESETS: Record<BinauralWaveType, BinauralPreset> = {
  alpha: {
    type: "alpha",
    name: "Alpha (10 Hz)",
    beatFrequencyHz: 10,
    carrierLeftHz: 210,
    carrierRightHz: 200,
    description: "Flow State & Creative Execution",
  },
  theta: {
    type: "theta",
    name: "Theta (6 Hz)",
    beatFrequencyHz: 6,
    carrierLeftHz: 106,
    carrierRightHz: 100,
    description: "Deep Meditation & Reflection",
  },
  beta: {
    type: "beta",
    name: "Beta (18 Hz)",
    beatFrequencyHz: 18,
    carrierLeftHz: 218,
    carrierRightHz: 200,
    description: "Sharp Focus & High-Intensity Work",
  },
};

export class BinauralEngine {
  private ctx: AudioContext | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseNode: AudioNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted = false;
  private activePreset: BinauralWaveType | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generates procedural pink noise with gentle modulation.
   */
  private createPinkNoise(ctx: AudioContext): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }

    this.noiseSource = ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(600, ctx.currentTime);

    this.noiseSource.connect(noiseFilter);
    this.noiseSource.start();
    return noiseFilter;
  }

  public play(presetKey: BinauralWaveType, volume = 0.4): void {
    this.stop();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const preset = BINAURAL_PRESETS[presetKey];
      this.activePreset = presetKey;

      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : volume, ctx.currentTime);

      // Stereo merger: Left to channel 0, Right to channel 1
      const merger = ctx.createChannelMerger(2);

      // Left oscillator
      this.oscLeft = ctx.createOscillator();
      this.oscLeft.type = "sine";
      this.oscLeft.frequency.setValueAtTime(preset.carrierLeftHz, ctx.currentTime);

      const leftGain = ctx.createGain();
      leftGain.gain.setValueAtTime(0.3, ctx.currentTime);
      this.oscLeft.connect(leftGain);
      leftGain.connect(merger, 0, 0);

      // Right oscillator
      this.oscRight = ctx.createOscillator();
      this.oscRight.type = "sine";
      this.oscRight.frequency.setValueAtTime(preset.carrierRightHz, ctx.currentTime);

      const rightGain = ctx.createGain();
      rightGain.gain.setValueAtTime(0.3, ctx.currentTime);
      this.oscRight.connect(rightGain);
      rightGain.connect(merger, 0, 1);

      // Procedural pink noise background
      this.noiseNode = this.createPinkNoise(ctx);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      this.noiseNode.connect(noiseGain);
      noiseGain.connect(merger, 0, 0);
      noiseGain.connect(merger, 0, 1);

      merger.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      this.oscLeft.start();
      this.oscRight.start();
    } catch (err) {
      console.warn("[BinauralEngine] Playback failed", err);
    }
  }

  public stop(): void {
    if (this.oscLeft) {
      try {
        this.oscLeft.stop();
        this.oscLeft.disconnect();
      } catch {
        /* ignore */
      }
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try {
        this.oscRight.stop();
        this.oscRight.disconnect();
      } catch {
        /* ignore */
      }
      this.oscRight = null;
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        /* ignore */
      }
      this.noiseSource = null;
    }
    if (this.noiseNode) {
      try {
        this.noiseNode.disconnect();
      } catch {
        /* ignore */
      }
      this.noiseNode = null;
    }
    this.activePreset = null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getActivePreset(): BinauralWaveType | null {
    return this.activePreset;
  }
}

export const binauralEngine = new BinauralEngine();
