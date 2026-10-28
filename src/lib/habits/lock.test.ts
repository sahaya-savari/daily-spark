import { describe, expect, it, beforeEach } from "vitest";
import {
  lockActions,
  hashPin,
  isValidPinFormat,
  LOCK_STORAGE_KEYS,
  isPinSet,
  isLockEnabled,
  isSessionLocked,
} from "./lock";

describe("Phase 2: App Lock (PIN & Biometrics)", () => {
  beforeEach(() => {
    localStorage.clear();
    lockActions.removePin();
  });

  it("validates 4-digit PIN format", () => {
    expect(isValidPinFormat("1234")).toBe(true);
    expect(isValidPinFormat("0000")).toBe(true);
    expect(isValidPinFormat("9876")).toBe(true);
    expect(isValidPinFormat("123")).toBe(false);
    expect(isValidPinFormat("12345")).toBe(false);
    expect(isValidPinFormat("abcd")).toBe(false);
    expect(isValidPinFormat("")).toBe(false);
  });

  it("hashes PIN using SHA-256 via Web Crypto", async () => {
    const hash1 = await hashPin("1234");
    const hash2 = await hashPin("1234");
    const hashOther = await hashPin("5678");

    expect(hash1).toBe("03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4");
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashOther);
  });

  it("sets, verifies, and removes PIN correctly", async () => {
    expect(isPinSet()).toBe(false);
    expect(isLockEnabled()).toBe(false);

    const success = await lockActions.setPin("4321");
    expect(success).toBe(true);
    expect(isPinSet()).toBe(true);
    expect(isLockEnabled()).toBe(true);

    const valid = await lockActions.verifyPin("4321");
    expect(valid).toBe(true);

    const invalid = await lockActions.verifyPin("9999");
    expect(invalid).toBe(false);

    lockActions.removePin();
    expect(isPinSet()).toBe(false);
    expect(isLockEnabled()).toBe(false);
    expect(localStorage.getItem(LOCK_STORAGE_KEYS.pinHash)).toBeNull();
  });

  it("rejects invalid PIN format when setting", async () => {
    const success = await lockActions.setPin("123");
    expect(success).toBe(false);
    expect(isPinSet()).toBe(false);
  });

  it("handles lock and unlock sessions", async () => {
    await lockActions.setPin("2468");
    expect(isSessionLocked()).toBe(false);

    lockActions.lock();
    expect(isSessionLocked()).toBe(true);

    const wrongUnlock = await lockActions.unlock("1111");
    expect(wrongUnlock).toBe(false);
    expect(isSessionLocked()).toBe(true);

    const correctUnlock = await lockActions.unlock("2468");
    expect(correctUnlock).toBe(true);
    expect(isSessionLocked()).toBe(false);
  });

  it("triggers timeout lock after 5 minutes of inactivity", async () => {
    await lockActions.setPin("1357");
    const t0 = 100000;
    lockActions.recordActivity(t0);

    // 4 minutes elapsed -> not locked
    const lockedEarly = lockActions.checkTimeout(t0 + 4 * 60 * 1000, 5 * 60 * 1000);
    expect(lockedEarly).toBe(false);
    expect(isSessionLocked()).toBe(false);

    // 5 minutes elapsed -> locked
    const lockedTimeout = lockActions.checkTimeout(t0 + 5 * 60 * 1000, 5 * 60 * 1000);
    expect(lockedTimeout).toBe(true);
    expect(isSessionLocked()).toBe(true);
  });

  it("disables lock without clearing PIN", async () => {
    await lockActions.setPin("9999");
    expect(isLockEnabled()).toBe(true);

    lockActions.setEnabled(false);
    expect(isLockEnabled()).toBe(false);
    expect(isPinSet()).toBe(true); // PIN hash still retained

    lockActions.lock();
    expect(isSessionLocked()).toBe(false); // Does not lock when disabled

    lockActions.setEnabled(true);
    expect(isLockEnabled()).toBe(true);
  });

  it("configures custom inactivity timeout options (0, 1, 5, 10, 30 min)", async () => {
    await lockActions.setPin("7777");
    const t0 = 200000;
    lockActions.recordActivity(t0);

    // Set 10-minute timeout
    lockActions.setTimeoutMinutes(10);
    expect(lockActions.checkTimeout(t0 + 9 * 60 * 1000)).toBe(false);
    expect(isSessionLocked()).toBe(false);

    expect(lockActions.checkTimeout(t0 + 10 * 60 * 1000)).toBe(true);
    expect(isSessionLocked()).toBe(true);

    // Unlock
    await lockActions.unlock("7777");
    expect(isSessionLocked()).toBe(false);

    // Set 30-minute timeout
    lockActions.recordActivity(t0);
    lockActions.setTimeoutMinutes(30);
    expect(lockActions.checkTimeout(t0 + 29 * 60 * 1000)).toBe(false);
    expect(lockActions.checkTimeout(t0 + 30 * 60 * 1000)).toBe(true);
  });

  it("locks session on app startup if lock is enabled", async () => {
    await lockActions.setPin("4321");
    // After setPin session is unlocked
    expect(isSessionLocked()).toBe(false);

    // When app restarts/inits, it locks
    lockActions.init();
    expect(isSessionLocked()).toBe(true);
  });
});

