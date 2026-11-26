import { beforeEach, describe, expect, it } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  runStorageMigrations,
  STORAGE_KEYS,
} from "./store";

describe("store v1 -> v2 schema migrations", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("preserves existing v1 habits and settings while setting schemaVersion", () => {
    const v1Habits = [{ id: "h1", name: "Drink water", streak: 5 }];
    const v1Settings = { rolloverHour: 4 };
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(v1Habits));
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(v1Settings));

    runStorageMigrations();

    expect(localStorage.getItem(STORAGE_KEYS.schemaVersion)).toBe(
      String(CURRENT_SCHEMA_VERSION),
    );
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? "[]")).toEqual(
      v1Habits,
    );
    const migratedSettings = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.settings) ?? "{}",
    );
    expect(migratedSettings.rolloverHour).toBe(4);
  });

  it("does not overwrite habits if settings JSON is malformed", () => {
    const v1Habits = [{ id: "h1", name: "Read" }];
    localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(v1Habits));
    localStorage.setItem(STORAGE_KEYS.settings, "{bad-json");

    runStorageMigrations();

    expect(localStorage.getItem(STORAGE_KEYS.schemaVersion)).toBe(
      String(CURRENT_SCHEMA_VERSION),
    );
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.habits) ?? "[]")).toEqual(
      v1Habits,
    );
    expect(localStorage.getItem(STORAGE_KEYS.settings)).toBe("{bad-json");
  });
});
