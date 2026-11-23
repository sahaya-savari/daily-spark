import { useSyncExternalStore } from "react";

export const LOCK_STORAGE_KEYS = {
  pinHash: "streakflame_pin_hash",
  lockEnabled: "streakflame_lock_enabled",
  lastActive: "streakflame_last_active",
  timeoutMinutes: "streakflame_lock_timeout_minutes",
  biometricEnabled: "streakflame_biometric_enabled",
  biometricCredId: "streakflame_biometric_cred_id",
} as const;

export const DEFAULT_TIMEOUT_MINUTES = 0;
export const TIMEOUT_OPTIONS = [0, 0.5, 1, 5, 10, 15, 30] as const;
export type LockTimeoutMinutes = (typeof TIMEOUT_OPTIONS)[number];

export const INACTIVITY_TIMEOUT_MS = DEFAULT_TIMEOUT_MINUTES * 60 * 1000;

export interface LockState {
  isPinSet: boolean;
  isEnabled: boolean;
  isLocked: boolean;
  isBiometricEnabled: boolean;
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

export function isBiometricEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LOCK_STORAGE_KEYS.biometricEnabled) === "true";
  } catch {
    return false;
  }
}

export async function isPlatformBiometricsAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    if (
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
    ) {
      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) return true;
    }
  } catch {
    /* fallback to capacitor */
  }
  try {
    type BiometricPlugin = { isAvailable?: () => Promise<{ has: boolean }> };
    const cap = (window as unknown as { Capacitor?: { Plugins?: { Biometrics?: BiometricPlugin } } })
      ?.Capacitor?.Plugins?.Biometrics;
    if (cap && typeof cap.isAvailable === "function") {
      const res = await cap.isAvailable();
      return Boolean(res?.has);
    }
  } catch {
    /* ignore */
  }
  return false;
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
      localStorage.removeItem(LOCK_STORAGE_KEYS.biometricEnabled);
      localStorage.removeItem(LOCK_STORAGE_KEYS.biometricCredId);
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

  setBiometricEnabled(enabled: boolean) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCK_STORAGE_KEYS.biometricEnabled, enabled ? "true" : "false");
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

  async registerBiometrics(): Promise<boolean> {
    if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));

      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Daily Spark", id: window.location.hostname || "localhost" },
          user: {
            id: userId,
            name: "Daily Spark User",
            displayName: "Daily Spark User",
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (cred) {
        localStorage.setItem(LOCK_STORAGE_KEYS.biometricEnabled, "true");
        notify();
        return true;
      }
    } catch (err) {
      console.warn("Biometrics registration cancelled or failed:", err);
    }
    return false;
  },

  async authenticateBiometric(): Promise<boolean> {
    // 1. Try Capacitor native biometrics plugin first if running in native wrapper
    try {
      type BiometricPlugin = {
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
      /* Fallback to WebAuthn platform biometrics */
    }

    // 2. WebAuthn platform biometrics (Face ID, Touch ID, Windows Hello, Android Biometrics)
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge,
            userVerification: "preferred",
            timeout: 60000,
          },
        });

        if (assertion) {
          sessionLocked = false;
          lastActiveTime = Date.now();
          notify();
          return true;
        }
      } catch (err) {
        console.warn("WebAuthn platform biometric check cancelled or failed:", err);
      }
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

let cachedSnapshot: LockState = {
  isPinSet: false,
  isEnabled: false,
  isLocked: false,
  isBiometricEnabled: false,
  timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
};

const SERVER_SNAPSHOT: LockState = {
  isPinSet: false,
  isEnabled: false,
  isLocked: false,
  isBiometricEnabled: false,
  timeoutMinutes: DEFAULT_TIMEOUT_MINUTES,
};

export function getLockSnapshot(): LockState {
  const nextPinSet = isPinSet();
  const nextEnabled = isLockEnabled();
  const nextLocked = isSessionLocked();
  const nextBiometric = isBiometricEnabled();
  const nextTimeout = getLockTimeoutMinutes();

  if (
    cachedSnapshot.isPinSet === nextPinSet &&
    cachedSnapshot.isEnabled === nextEnabled &&
    cachedSnapshot.isLocked === nextLocked &&
    cachedSnapshot.isBiometricEnabled === nextBiometric &&
    cachedSnapshot.timeoutMinutes === nextTimeout
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    isPinSet: nextPinSet,
    isEnabled: nextEnabled,
    isLocked: nextLocked,
    isBiometricEnabled: nextBiometric,
    timeoutMinutes: nextTimeout,
  };
  return cachedSnapshot;
}

export function useAppLockStore(): LockState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getLockSnapshot,
    () => SERVER_SNAPSHOT,
  );
}

