import { useSyncExternalStore } from "react";

export const LOCK_STORAGE_KEYS = {
  pinHash: "streakflame_pin_hash",
  lockEnabled: "streakflame_lock_enabled",
  lastActive: "streakflame_last_active",
  timeoutMinutes: "streakflame_lock_timeout_minutes",
} as const;

export const DEFAULT_TIMEOUT_MINUTES = 5;
export const TIMEOUT_OPTIONS = [0, 1, 5, 10, 15, 30] as const;
export type LockTimeoutMinutes = (typeof TIMEOUT_OPTIONS)[number];

export const INACTIVITY_TIMEOUT_MS = DEFAULT_TIMEOUT_MINUTES * 60 * 1000;

export interface LockState {
  isPinSet: boolean;
  isEnabled: boolean;
  isLocked: boolean;
  timeoutMinutes: LockTimeoutMinutes;
}

let sessionLocked = typeof window !== "undefined" ? isLockEnabled() : false;
let lastActiveTime = Date.now();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin.trim());
}

export async function hashPin(pin: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(pin.trim());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isPinSet(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(localStorage.getItem(LOCK_STORAGE_KEYS.pinHash));
  } catch {
    return false;
  }
}

export function isLockEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCK_STORAGE_KEYS.lockEnabled) === "true" && isPinSet();
  } catch {
    return false;
  }
}

export function getLockTimeoutMinutes(): LockTimeoutMinutes {
  if (typeof window === "undefined") return DEFAULT_TIMEOUT_MINUTES;
  try {
    const raw = localStorage.getItem(LOCK_STORAGE_KEYS.timeoutMinutes);
    if (!raw) return DEFAULT_TIMEOUT_MINUTES;
    const num = Number(raw);
    if (TIMEOUT_OPTIONS.includes(num as LockTimeoutMinutes)) {
      return num as LockTimeoutMinutes;
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_TIMEOUT_MINUTES;
}

export function isSessionLocked(): boolean {
  return isLockEnabled() && sessionLocked;
}

export const lockActions = {
  async setPin(pin: string): Promise<boolean> {
    if (!isValidPinFormat(pin)) return false;
    try {
      const hash = await hashPin(pin);
      localStorage.setItem(LOCK_STORAGE_KEYS.pinHash, hash);
      localStorage.setItem(LOCK_STORAGE_KEYS.lockEnabled, "true");
      sessionLocked = false;
      lastActiveTime = Date.now();
      notify();
      return true;
    } catch {
      return false;
    }
  },

  async verifyPin(pin: string): Promise<boolean> {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(LOCK_STORAGE_KEYS.pinHash);
      if (!stored) return false;
      const hash = await hashPin(pin);
      return stored === hash;
    } catch {
      return false;
    }
  },

  async unlock(pin: string): Promise<boolean> {
    const valid = await lockActions.verifyPin(pin);
    if (valid) {
      sessionLocked = false;
      lastActiveTime = Date.now();
      notify();
      return true;
    }
    return false;
  },

  lock() {
    if (isLockEnabled()) {
      sessionLocked = true;
      notify();
    }
  },

  removePin() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LOCK_STORAGE_KEYS.pinHash);
      localStorage.removeItem(LOCK_STORAGE_KEYS.lockEnabled);
      localStorage.removeItem(LOCK_STORAGE_KEYS.lastActive);
      localStorage.removeItem(LOCK_STORAGE_KEYS.timeoutMinutes);
      sessionLocked = false;
      notify();
    } catch {
      /* ignore */
    }
  },

  setTimeoutMinutes(minutes: LockTimeoutMinutes) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCK_STORAGE_KEYS.timeoutMinutes, String(minutes));
      notify();
    } catch {
      /* ignore */
    }
  },

  setEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;
    try {
      if (enabled && !isPinSet()) return;
      localStorage.setItem(LOCK_STORAGE_KEYS.lockEnabled, enabled ? "true" : "false");
      if (!enabled) {
        sessionLocked = false;
      }
      notify();
    } catch {
      /* ignore */
    }
  },

  recordActivity(now = Date.now()) {
    lastActiveTime = now;
  },

  checkTimeout(
    now = Date.now(),
    timeoutMs?: number,
  ): boolean {
    if (!isLockEnabled()) return false;
    const effectiveTimeoutMs =
      typeof timeoutMs === "number"
        ? timeoutMs
        : getLockTimeoutMinutes() * 60 * 1000;
    if (now - lastActiveTime >= effectiveTimeoutMs) {
      sessionLocked = true;
      notify();
      return true;
    }
    return false;
  },

  async authenticateBiometric(): Promise<boolean> {
    // Graceful native biometric check. If capacitor biometrics is available globally or via plugin
    try {
      type BiometricPlugin = {
        isAvailable?: () => Promise<{ has: boolean }>;
        verifyIdentity?: (options?: { reason: string }) => Promise<void>;
      };
      const cap = (window as unknown as { Capacitor?: { Plugins?: { Biometrics?: BiometricPlugin } } })
        ?.Capacitor?.Plugins?.Biometrics;
      if (cap && typeof cap.verifyIdentity === "function") {
        await cap.verifyIdentity({ reason: "Unlock Daily Spark" });
        sessionLocked = false;
        lastActiveTime = Date.now();
        notify();
        return true;
      }
    } catch {
      // Biometric failed or cancelled, remain locked for PIN entry
    }
    return false;
  },

  init() {
    if (isLockEnabled()) {
      sessionLocked = true;
      notify();
    }
  },
};

function getLockSnapshot(): LockState {
  return {
    isPinSet: isPinSet(),
    isEnabled: isLockEnabled(),
    isLocked: isSessionLocked(),
    timeoutMinutes: getLockTimeoutMinutes(),
  };
}

export function useAppLockStore(): LockState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLockSnapshot,
    () => ({
      isPinSet: false,
      isEnabled: false,
      isLocked: false,
      timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
    }),
  );
}

