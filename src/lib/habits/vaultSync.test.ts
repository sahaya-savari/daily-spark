import { describe, it, expect } from "vitest";
import { encryptVault, decryptVault, mergeVaultHabits, type VaultPayload } from "./vaultSync";
import type { Habit } from "./types";

describe("Encrypted Vault & Conflict-Free Sync", () => {
  it("encrypts and decrypts payload faithfully with password", async () => {
    const payload: VaultPayload = {
      version: 1,
      exportedAt: "2026-04-01T12:00:00Z",
      habits: [
        {
          id: "v-1",
          name: "Deep Meditation",
          emoji: "🧘",
          createdAt: "2026-01-01",
          currentStreak: 12,
          bestStreak: 20,
          lastCompletedDate: "2026-04-01",
          completedDates: ["2026-03-30", "2026-03-31", "2026-04-01"],
        },
      ],
    };

    const password = "SparkSecurePassword!2026";
    const encrypted = await encryptVault(payload, password);

    expect(encrypted.format).toBe("dailyspark_encrypted_vault_v1");
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.iv).toBeTruthy();

    const decrypted = await decryptVault(encrypted, password);
    expect(decrypted.habits.length).toBe(1);
    expect(decrypted.habits[0].name).toBe("Deep Meditation");
    expect(decrypted.habits[0].completedDates).toEqual(["2026-03-30", "2026-03-31", "2026-04-01"]);
  });

  it("fails to decrypt with incorrect password", async () => {
    const payload: VaultPayload = {
      version: 1,
      exportedAt: "2026-04-01T12:00:00Z",
      habits: [],
    };
    const encrypted = await encryptVault(payload, "RightPassword");

    await expect(decryptVault(encrypted, "WrongPassword")).rejects.toThrow();
  });

  it("merges multi-device habits via Set-Union without data loss", () => {
    const localHabits: Habit[] = [
      {
        id: "h1",
        name: "Morning Run",
        emoji: "🏃",
        createdAt: "2026-01-01",
        currentStreak: 2,
        bestStreak: 5,
        lastCompletedDate: "2026-04-01",
        completedDates: ["2026-03-31", "2026-04-01"],
      },
      {
        id: "h2",
        name: "Local Only Habit",
        emoji: "📖",
        createdAt: "2026-01-01",
        currentStreak: 1,
        bestStreak: 1,
        lastCompletedDate: "2026-04-01",
        completedDates: ["2026-04-01"],
      },
    ];

    const remoteHabits: Habit[] = [
      {
        id: "h1",
        name: "Morning Run",
        emoji: "🏃",
        createdAt: "2026-01-01",
        currentStreak: 3,
        bestStreak: 7,
        lastCompletedDate: "2026-03-30",
        completedDates: ["2026-03-28", "2026-03-29", "2026-03-30"],
      },
      {
        id: "h3",
        name: "Remote Only Habit",
        emoji: "💧",
        createdAt: "2026-02-01",
        currentStreak: 10,
        bestStreak: 10,
        lastCompletedDate: "2026-04-01",
        completedDates: ["2026-04-01"],
      },
    ];

    const merged = mergeVaultHabits(localHabits, remoteHabits);

    expect(merged.length).toBe(3);

    const h1 = merged.find((h) => h.id === "h1")!;
    // Set-union of ["2026-03-31", "2026-04-01"] and ["2026-03-28", "2026-03-29", "2026-03-30"]
    expect(h1.completedDates).toEqual([
      "2026-03-28",
      "2026-03-29",
      "2026-03-30",
      "2026-03-31",
      "2026-04-01",
    ]);
    expect(h1.bestStreak).toBe(7); // Max of 5 and 7

    expect(merged.some((h) => h.id === "h2")).toBe(true);
    expect(merged.some((h) => h.id === "h3")).toBe(true);
  });

  it("merges subtasks, completionTimes, and totalFocusMinutes across devices", () => {
    const localHabit: Habit = {
      id: "sync-1",
      name: "Routine",
      emoji: "🌅",
      createdAt: "2026-01-01",
      currentStreak: 1,
      bestStreak: 1,
      lastCompletedDate: "2026-04-01",
      completedDates: ["2026-04-01"],
      subtasks: [{ id: "s1", title: "Wake up" }],
      subtaskCompletions: { "2026-04-01": ["s1"] },
      totalFocusMinutes: 25,
      completionTimes: { "2026-04-01": "2026-04-01T08:00:00.000Z" },
    };

    const remoteHabit: Habit = {
      id: "sync-1",
      name: "Routine",
      emoji: "🌅",
      createdAt: "2026-01-01",
      currentStreak: 1,
      bestStreak: 1,
      lastCompletedDate: "2026-03-31",
      completedDates: ["2026-03-31"],
      subtasks: [
        { id: "s1", title: "Wake up" },
        { id: "s2", title: "Hydrate" },
      ],
      subtaskCompletions: { "2026-03-31": ["s1", "s2"] },
      totalFocusMinutes: 50,
      completionTimes: { "2026-03-31": "2026-03-31T08:30:00.000Z" },
    };

    const merged = mergeVaultHabits([localHabit], [remoteHabit], "2026-04-01");
    expect(merged.length).toBe(1);
    const m = merged[0];
    expect(m.subtasks?.length).toBe(2);
    expect(m.totalFocusMinutes).toBe(50);
    expect(m.completionTimes?.["2026-04-01"]).toBe("2026-04-01T08:00:00.000Z");
    expect(m.completionTimes?.["2026-03-31"]).toBe("2026-03-31T08:30:00.000Z");
    expect(m.currentStreak).toBe(2); // Consecutive March 31 & April 1
  });
});

