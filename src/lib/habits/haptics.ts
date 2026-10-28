import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Polyphonic Tactile Haptics Engine
 * Provides distinct tactile sensations for steps, subtasks, milestones, and warnings.
 * Uses @capacitor/haptics on Android/iOS native containers with navigator.vibrate fallback for Web.
 */

async function nativeImpact(style: ImpactStyle) {
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

export const hapticEngine = {
  /**
   * Subtle 10ms crisp tap when incrementing a quantitative step.
   */
  async tickTap(): Promise<void> {
    const handled = await nativeImpact(ImpactStyle.Light);
    if (!handled) {
      webVibrate(12);
    }
  },

  /**
   * Satisfying mechanical double-pulse when completing a checklist subtask.
   */
  async doubleClack(): Promise<void> {
    const handled = await nativeImpact(ImpactStyle.Medium);
    if (!handled) {
      webVibrate([15, 30, 15]);
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
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      } catch {
        /* fallback */
      }
    }
    webVibrate([20, 40, 35, 40, 60]);
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
