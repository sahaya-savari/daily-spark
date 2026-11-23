import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Polyphonic Tactile Haptics Engine
 * Provides distinct tactile sensations for steps, subtasks, milestones, and warnings.
 * Uses @capacitor/haptics on Android/iOS native containers with navigator.vibrate fallback for Web.
 */

let enabled = true;

async function nativeImpact(style: ImpactStyle) {
  if (!enabled) return true;
  if (Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

function webVibrate(pattern: number | number[]) {
  if (!enabled) return true;
  if (typeof window !== "undefined" && "navigator" in window && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(pattern);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Procedural Web Audio micro-tick:
 * Generates an organic mechanical tick tone (18ms damped sine burst)
 * to deliver tactile confirmation when hardware vibration is absent.
 */
function playWebAudioTick(freq = 720, duration = 0.016) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 120);
  } catch {
    // Autoplay or audio context initialization blocked
  }
}

export const hapticEngine = {
  setEnabled(value: boolean) { enabled = value; },
  /**
   * Subtle 10ms crisp tap when incrementing a quantitative step.
   */
  async tickTap(): Promise<void> {
    const handled = await nativeImpact(ImpactStyle.Light);
    if (!handled) {
      const vibrated = webVibrate(12);
      if (!vibrated) {
        playWebAudioTick(720, 0.016);
      }
    }
  },

  /**
   * Satisfying mechanical double-pulse when completing a checklist subtask.
   */
  async doubleClack(): Promise<void> {
    const handled = await nativeImpact(ImpactStyle.Medium);
    if (!handled) {
      const vibrated = webVibrate([15, 30, 15]);
      if (!vibrated) {
        playWebAudioTick(840, 0.012);
        setTimeout(() => playWebAudioTick(680, 0.015), 35);
      }
    } else {
      setTimeout(() => {
        nativeImpact(ImpactStyle.Light).catch(() => {});
      }, 50);
    }
  },

  /**
   * 3-step ascending resonant vibration upon reaching a streak milestone or multi-lap target.
   */
  async crescendoPulse(): Promise<void> {
    if (!enabled) return;
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      } catch {
        /* fallback */
      }
    }
    const vibrated = webVibrate([20, 40, 35, 40, 60]);
    if (!vibrated) {
      playWebAudioTick(580, 0.02);
      setTimeout(() => playWebAudioTick(740, 0.025), 50);
      setTimeout(() => playWebAudioTick(920, 0.035), 110);
    }
  },

  /**
   * Low-frequency warning vibration when confirming a habit deletion or relapse entry.
   */
  async gentleThud(): Promise<void> {
    const handled = await nativeImpact(ImpactStyle.Heavy);
    if (!handled) {
      webVibrate([50]);
    }
  },
};
