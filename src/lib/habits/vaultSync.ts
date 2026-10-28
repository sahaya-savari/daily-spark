import { normalizeDates, refresh } from "./logic";
import { todayKey } from "./dates";
import type { Habit, HabitSettings } from "./types";

export interface VaultPayload {
  version: number;
  exportedAt: string;
  habits: Habit[];
  settings?: HabitSettings;
}

export interface EncryptedVaultPackage {
  format: "dailyspark_encrypted_vault_v1";
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
}

/**
 * Derives an AES-GCM-256 key from a user password using PBKDF2 with SHA-256.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts habits and settings into an AES-GCM-256 vault package.
 */
export async function encryptVault(
  payload: VaultPayload,
  passphrase: string
): Promise<EncryptedVaultPackage> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const encodedData = enc.encode(JSON.stringify(payload));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encodedData
  );

  return {
    format: "dailyspark_encrypted_vault_v1",
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(encryptedBuffer),
  };
}

/**
 * Decrypts an AES-GCM-256 vault package using the user's passphrase.
 */
export async function decryptVault(
  pkg: EncryptedVaultPackage,
  passphrase: string
): Promise<VaultPayload> {
  if (pkg.format !== "dailyspark_encrypted_vault_v1") {
    throw new Error("Invalid or unsupported vault format");
  }

  const salt = base64ToBuffer(pkg.salt);
  const iv = base64ToBuffer(pkg.iv);
  const key = await deriveKey(passphrase, salt);

  const ciphertext = base64ToBuffer(pkg.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext as BufferSource
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decryptedBuffer);
  return JSON.parse(jsonStr) as VaultPayload;
}

/**
 * Set-union merge for multi-device synchronization:
 * Never loses any completed date logged on any device.
 * For matching habit IDs, merges completedDates, preserves highest streaks, and retains metadata.
 */
export function mergeVaultHabits(localHabits: Habit[], remoteHabits: Habit[], today: string = todayKey()): Habit[] {
  const map = new Map<string, Habit>();

  for (const h of localHabits) {
    map.set(h.id, { ...h });
  }

  for (const remote of remoteHabits) {
    const local = map.get(remote.id);
    if (!local) {
      // New habit from remote device
      map.set(remote.id, refresh({ ...remote }, today));
    } else {
      // Merge completed dates with set union
      const combinedDates = normalizeDates([
        ...(local.completedDates || []),
        ...(remote.completedDates || []),
      ]);

      // Merge quantitative values if present
      const combinedQuant = {
        ...(local.quantitativeValues || {}),
        ...(remote.quantitativeValues || {}),
      };

      // Merge relapses if present
      const existingRelapseDates = new Set((local.relapses || []).map((r) => r.date));
      const combinedRelapses = [...(local.relapses || [])];
      for (const r of remote.relapses || []) {
        if (!existingRelapseDates.has(r.date)) {
          combinedRelapses.push(r);
        }
      }

      // Merge vacation ranges
      const combinedVacations = [
        ...(local.vacationRanges || []),
        ...(remote.vacationRanges || []).filter(
          (rv) => !local.vacationRanges?.some((lv) => lv.start === rv.start && lv.end === rv.end)
        ),
      ];

      // Merge subtasks
      const localSubtasks = local.subtasks || [];
      const remoteSubtasks = remote.subtasks || [];
      const combinedSubtasks = localSubtasks.length >= remoteSubtasks.length ? localSubtasks : remoteSubtasks;

      const combinedSubtaskCompletions: Record<string, string[]> = {
        ...(local.subtaskCompletions || {}),
      };
      for (const [date, ids] of Object.entries(remote.subtaskCompletions || {})) {
        if (!combinedSubtaskCompletions[date]) {
          combinedSubtaskCompletions[date] = ids;
        } else {
          combinedSubtaskCompletions[date] = Array.from(new Set([...combinedSubtaskCompletions[date], ...ids]));
        }
      }

      // Merge completion times
      const combinedCompletionTimes = {
        ...(remote.completionTimes || {}),
        ...(local.completionTimes || {}),
      };

      const updatedCandidate: Habit = {
        ...local,
        name: remote.name || local.name,
        emoji: remote.emoji || local.emoji,
        notes: (local.notes && local.notes.length >= (remote.notes || "").length) ? local.notes : remote.notes,
        kind: remote.kind || local.kind,
        targetValue: remote.targetValue ?? local.targetValue,
        unit: remote.unit ?? local.unit,
        stepIncrement: remote.stepIncrement ?? local.stepIncrement,
        dailyCost: remote.dailyCost ?? local.dailyCost,
        subtasks: combinedSubtasks,
        subtaskCompletions: combinedSubtaskCompletions,
        completionTimes: combinedCompletionTimes,
        totalFocusMinutes: Math.max(local.totalFocusMinutes || 0, remote.totalFocusMinutes || 0),
        elasticTargets: remote.elasticTargets || local.elasticTargets,
        cueText: remote.cueText || local.cueText,
        afterHabitId: remote.afterHabitId || local.afterHabitId,
        completedDates: combinedDates,
        quantitativeValues: combinedQuant,
        relapses: combinedRelapses,
        vacationRanges: combinedVacations,
      };

      const refreshed = refresh(updatedCandidate, today);
      map.set(local.id, {
        ...refreshed,
        bestStreak: Math.max(local.bestStreak || 0, remote.bestStreak || 0, refreshed.bestStreak || 0),
      });
    }
  }

  return Array.from(map.values());
}

