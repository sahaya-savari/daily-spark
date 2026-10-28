/**
 * Procedural Audio Engine for Focus Sessions using standard Web Audio API.
 * 0 KB asset overhead, 100% offline-first, $0 server cost.
 */

export type SoundscapeType = "none" | "brown" | "rain";

class FocusAudioManager {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Generates procedural brown (Brownian) noise using a 1-pole lowpass integrator.
   */
  private createBrownNoiseNode(ctx: AudioContext): AudioNode {
    const bufferSize = ctx.sampleRate * 2; // 2-second looped buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Integrate white noise with leaky integrator
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      // Scale amplitude
      output[i] *= 3.5;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter to soften edge
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    whiteNoise.connect(filter);
    whiteNoise.start();
    return filter;
  }

  /**
   * Generates procedural rain noise with filtered pink/white noise and gentle randomized drop pulses.
   */
  private createRainNode(ctx: AudioContext): AudioNode {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Paul Kellet's filter for pink noise
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    // Bandpass filter centered around 1.2 kHz for gentle rainfall feel
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(1100, ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, ctx.currentTime);

    rainSource.connect(bandpass);
    rainSource.start();
    return bandpass;
  }

  /**
   * Plays procedural soundscape (brown noise, rain, or none).
   */
  public playSoundscape(type: SoundscapeType, volume = 0.5): void {
    this.stopSoundscape();
    if (type === "none") return;

    const ctx = this.getContext();
    if (!ctx) return;

    try {
      this.gainNode = ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : Math.max(0, Math.min(1, volume)), ctx.currentTime);

      const source = type === "brown" ? this.createBrownNoiseNode(ctx) : this.createRainNode(ctx);
      source.connect(this.gainNode);
      this.gainNode.connect(ctx.destination);
      this.currentSource = source;
    } catch (err) {
      console.warn("[FocusAudio] Could not play soundscape", err);
    }
  }

  /**
   * Stops active procedural soundscape.
   */
  public stopSoundscape(): void {
    if (this.currentSource) {
      try {
        this.currentSource.disconnect();
      } catch {
        /* ignore */
      }
      this.currentSource = null;
    }
  }

  /**
   * Plays harmonic completion chime / bell.
   */
  public playCompletionChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Chime tones: fundamental + third harmonic
      const tones = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord

      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const toneGain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        toneGain.gain.setValueAtTime(0.001, now + idx * 0.08);
        toneGain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
        toneGain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(toneGain);
        toneGain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 2.0);
      });
    } catch (err) {
      console.warn("[FocusAudio] Chime failed", err);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
  }
}

export const focusAudio = new FocusAudioManager();

