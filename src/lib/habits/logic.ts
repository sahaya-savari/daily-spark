import { addDays, isValidKey, lastNDays } from "./dates";
import { DEFAULT_SETTINGS, type Habit, type HabitSettings } from "./types";

/* ------------------------------------------------------------------ */
/* Streak rules                                                        */
/* - One completion per habit per calendar day.                        */
/* - A streak stays alive until the end of the day after the last      */
/*   completion (yesterday's check-in keeps it going today).           */
/* - Missing a day resets the current streak; best streak is kept.     */
/* ------------------------------------------------------------------ */

export function normalizeDates(dates: unknown): string[] {
  if (!Array.isArray(dates)) return [];
  return [...new Set(dates.filter(isValidKey))].sort();
}

/** Consecutive completed days ending today, or yesterday if today isn't done yet. */
export function currentStreak(dates: string[], today: string): number {
  const set = new Set(dates);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

/** Longest run of consecutive days anywhere in history. */
export function longestStreak(dates: string[]): number {
  const sorted = normalizeDates(dates);
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sorted) {
    run = prev && addDays(prev, 1) === d ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

/** Recompute derived counters from completedDates. */
export function refresh(habit: Habit, today: string): Habit {
  const completedDates = normalizeDates(habit.completedDates);
  const cur = currentStreak(completedDates, today);
  return {
    ...habit,
    completedDates,
    currentStreak: cur,
    bestStreak: Math.max(habit.bestStreak || 0, longestStreak(completedDates), cur),
    lastCompletedDate: completedDates.at(-1) ?? null,
  };
}

export function isDoneOn(habit: Habit, day: string): boolean {
  return habit.completedDates.includes(day);
}

/** Mark today as done. Doing it twice in one day changes nothing. */
export function completeToday(habit: Habit, today: string): Habit {
  if (isDoneOn(habit, today)) return habit;
  return refresh({ ...habit, completedDates: [...habit.completedDates, today] }, today);
}

/** Undo today's completion (mistake-friendly). Only today can be undone. */
export function undoToday(habit: Habit, today: string): Habit {
  if (!isDoneOn(habit, today)) return habit;
  const completedDates = habit.completedDates.filter((d) => d !== today);
  const next = refresh({ ...habit, completedDates, bestStreak: 0 }, today);
  // Best streak never drops below the longest run still in history.
  return { ...next, bestStreak: Math.max(longestStreak(completedDates), next.currentStreak) };
}

export type HabitStatus = "done" | "pending" | "broken";

export function statusOf(habit: Habit, today: string): HabitStatus {
  if (isDoneOn(habit, today)) return "done";
  if (habit.completedDates.length === 0 || isDoneOn(habit, addDays(today, -1))) return "pending";
  return "broken";
}

export const isArchived = (h: Habit) => Boolean(h.archivedAt);

/* ------------------------------------------------------------------ */
/* Aggregates                                                          */
/* ------------------------------------------------------------------ */

/** Habits that count on a given day: created on/before it and not archived before it. */
function countsOn(h: Habit, day: string): boolean {
  if (h.createdAt && h.createdAt > day) return false;
  if (h.archivedAt && h.archivedAt.slice(0, 10) <= day) return false;
  return true;
}

export function dayRatio(habits: Habit[], day: string): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const h of habits) {
    const did = isDoneOn(h, day);
    if (countsOn(h, day) || did) {
      total++;
      if (did) done++;
    }
  }
  return { done, total };
}

/** Days in a row (ending today/yesterday) with at least one completed habit. */
export function overallStreak(habits: Habit[], today: string): number {
  const all = new Set(habits.flatMap((h) => h.completedDates));
  return currentStreak([...all], today);
}

export function completionRate(habits: Habit[], today: string, days: number): number {
  let done = 0;
  let total = 0;
  for (const day of lastNDays(today, days)) {
    const r = dayRatio(habits, day);
    done += r.done;
    total += r.total;
  }
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function totalCompletions(habits: Habit[]): number {
  return habits.reduce((n, h) => n + h.completedDates.length, 0);
}

/** 0-4 intensity level for heatmaps. */
export function heatLevel(done: number, total: number): 0 | 1 | 2 | 3 | 4 {
  if (done <= 0 || total <= 0) return 0;
  const r = done / total;
  if (r >= 1) return 4;
  if (r >= 0.66) return 3;
  if (r >= 0.33) return 2;
  return 1;
}

/* ------------------------------------------------------------------ */
/* Creation                                                            */
/* ------------------------------------------------------------------ */

export function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function createHabit(
  input: Pick<Habit, "name" | "emoji"> & Partial<Habit>,
  today: string,
): Habit {
  return {
    ...input,
    id: input.id ?? newId(),
    name: input.name.trim(),
    emoji: input.emoji || "🔥",
    createdAt: input.createdAt ?? today,
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    completedDates: [],
    isStarred: input.isStarred ?? false,
    archivedAt: null,
    listId: input.listId ?? "default",
  };
}

/* ------------------------------------------------------------------ */
/* Backup & restore                                                    */
/* Accepts every format the old Daily Spark produced:                  */
/*  - { version, exportDate, data: { streaks, settings } }  (app export) */
/*  - { streaks, settings }                                            */
/*  - [ ...streaks ]                                                   */
/*  - README schema: title / history / archived / starred              */
/* ------------------------------------------------------------------ */

export const BACKUP_VERSION = "1";

export interface StrictBackupStreak {
  id: string;
  title: string;
  emoji: string;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  history: string[];
  archived: boolean;
  starred: boolean;
}

export interface StrictBackupFile {
  version: "1";
  exportDate: string;
  data: {
    streaks: StrictBackupStreak[];
    settings: {
      enabled: boolean;
      defaultTime: string;
      respectDND: boolean;
      preTaskReminderOffsetMinutes: number;
    };
  };
}

export function buildStrictBackup(habits: Habit[], settings: HabitSettings, now = new Date()): StrictBackupFile {
  const exportDate = now.toISOString().slice(0, 10);
  const streaks: StrictBackupStreak[] = habits.map((h) => {
    const cur = h.currentStreak || 0;
    const history = cur > 0 && h.completedDates.length > 0 ? h.completedDates.slice(-cur) : [];
    return {
      id: h.id,
      title: h.name,
      emoji: h.emoji || "🔥",
      createdAt: h.createdAt || exportDate,
      currentStreak: cur,
      bestStreak: Math.max(h.bestStreak || 0, cur),
      lastCompletedDate: cur > 0 ? (history.at(-1) ?? null) : null,
      history,
      archived: isArchived(h),
      starred: Boolean(h.isStarred),
    };
  });

  return {
    version: "1",
    exportDate,
    data: {
      streaks,
      settings: {
        enabled: Boolean(settings.enabled),
        defaultTime: settings.defaultTime || "20:00",
        respectDND: settings.respectDND ?? true,
        preTaskReminderOffsetMinutes: settings.preTaskReminderOffsetMinutes ?? 5,
      },
    },
  };
}

export interface BackupFile {
  version: string;
  exportDate: string;
  app: "daily-spark";
  data: { streaks: Habit[]; settings: HabitSettings };
}

export function buildBackup(habits: Habit[], settings: HabitSettings, now = new Date()): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportDate: now.toISOString(),
    app: "daily-spark",
    data: { streaks: habits, settings },
  };
}

export interface ParsedBackup {
  habits: Habit[];
  settings: HabitSettings;
  skipped: number;
  exportDate: string | null;
}

export class BackupError extends Error {}

interface Raw {
  id?: unknown; name?: unknown; title?: unknown; emoji?: unknown; createdAt?: unknown;
  completedDates?: unknown; history?: unknown; archivedAt?: unknown; archived?: unknown;
  isStarred?: unknown; starred?: unknown; bestStreak?: unknown;
  data?: unknown; streaks?: unknown; settings?: unknown; exportDate?: unknown;
  [k: string]: unknown;
}

function normalizeHabit(raw: unknown, today: string): Habit | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Raw;
  const rawId = r.id;
  const id = typeof rawId === "string" && rawId.trim() ? rawId : typeof rawId === "number" ? String(rawId) : null;
  const nameSrc = typeof r.name === "string" ? r.name : typeof r.title === "string" ? r.title : "";
  const name = nameSrc.trim();
  if (!id || !name) return null;

  const dates = normalizeDates(
    Array.isArray(r.completedDates) ? r.completedDates : Array.isArray(r.history) ? r.history : [],
  );
  const archivedAt =
    typeof r.archivedAt === "string" && r.archivedAt
      ? r.archivedAt
      : r.archived === true
        ? today
        : null;

  const { title: _t, history: _h, archived: _a, starred: _s, ...rest } = r;
  void _t; void _h; void _a; void _s;

  const habit: Habit = {
    ...(rest as Partial<Habit>),
    id,
    name,
    emoji: typeof r.emoji === "string" && r.emoji.trim() ? r.emoji : "🔥",
    createdAt: isValidKey(r.createdAt) ? r.createdAt : (dates[0] ?? today),
    currentStreak: 0,
    bestStreak: typeof r.bestStreak === "number" && r.bestStreak > 0 ? Math.floor(r.bestStreak) : 0,
    lastCompletedDate: null,
    completedDates: dates,
    isStarred: r.isStarred === true || r.starred === true,
    archivedAt,
  };
  return refresh(habit, today);
}

export function parseBackup(text: string, today: string): ParsedBackup {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new BackupError("This file isn't valid JSON. Pick a Daily Spark backup (.json).");
  }

  let streaks: unknown;
  let settings: unknown;
  let exportDate: unknown;
  if (Array.isArray(json)) {
    streaks = json;
  } else if (json && typeof json === "object") {
    const o = json as Raw;
    const data = (o.data && typeof o.data === "object" ? o.data : o) as Raw;
    streaks = data.streaks;
    settings = data.settings;
    exportDate = o.exportDate ?? data.exportDate;
  }
  if (!Array.isArray(streaks)) {
    throw new BackupError("No habits found in this file. Is it a Daily Spark backup?");
  }

  const seen = new Set<string>();
  const habits: Habit[] = [];
  let skipped = 0;
  for (const s of streaks) {
    const h = normalizeHabit(s, today);
    if (!h || seen.has(h.id)) {
      skipped++;
      continue;
    }
    seen.add(h.id);
    habits.push(h);
  }

  return {
    habits,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(settings && typeof settings === "object" ? (settings as Partial<HabitSettings>) : {}),
    },
    skipped,
    exportDate: typeof exportDate === "string" ? exportDate : null,
  };
}

export function habitsToCsv(habits: Habit[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["id", "name", "emoji", "createdAt", "currentStreak", "bestStreak", "archived", "completedDates"];
  const rows = habits.map((h) =>
    [
      esc(h.id),
      esc(h.name),
      esc(h.emoji),
      h.createdAt,
      h.currentStreak,
      h.bestStreak,
      isArchived(h) ? "true" : "false",
      esc(h.completedDates.join(" ")),
    ].join(","),
  );
  return [head.join(","), ...rows].join("\n");
}

export interface ParsedCsvResult {
  habits: Habit[];
  added: number;
  skipped: number;
  errors: string[];
}

/**
 * Imports habits from CSV as specified in README (name,emoji or title,start_date,current_count).
 * Starts new streaks at Day 1 (no history) and never overwrites existing streaks.
 */
export function parseCsvHabits(
  csvText: string,
  today: string,
  existingHabits: Habit[] = [],
): ParsedCsvResult {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { habits: [], added: 0, skipped: 0, errors: ["Empty CSV file"] };
  }

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headerLine = lines[0]!.toLowerCase();
  const headers = parseLine(headerLine);

  let nameIdx = headers.findIndex((h) => h === "name" || h === "title");
  let emojiIdx = headers.findIndex((h) => h === "emoji");
  let startDateIdx = headers.findIndex((h) => h === "start_date" || h === "createdat" || h === "created_at");

  if (nameIdx === -1) {
    nameIdx = 0;
    emojiIdx = 1;
  }

  const existingNames = new Set(existingHabits.map((h) => h.name.toLowerCase()));
  const newHabits: Habit[] = [];
  let skipped = 0;
  const errors: string[] = [];

  const isHeaderRow = headers.some((h) => ["name", "title", "emoji", "start_date", "current_count"].includes(h));
  const dataLines = isHeaderRow ? lines.slice(1) : lines;

  for (let idx = 0; idx < dataLines.length; idx++) {
    const rawLine = dataLines[idx]!;
    const cols = parseLine(rawLine);
    const name = cols[nameIdx]?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    if (existingNames.has(name.toLowerCase())) {
      skipped++;
      continue;
    }

    const emojiRaw = emojiIdx !== -1 ? cols[emojiIdx]?.trim() : undefined;
    const emoji = emojiRaw && emojiRaw.length > 0 ? emojiRaw : "🔥";
    const startDate = startDateIdx !== -1 && cols[startDateIdx] && isValidKey(cols[startDateIdx])
      ? cols[startDateIdx]!
      : today;

    const habit = createHabit({ name, emoji, createdAt: startDate }, today);
    newHabits.push(habit);
    existingNames.add(name.toLowerCase());
  }

  return {
    habits: newHabits,
    added: newHabits.length,
    skipped,
    errors,
  };
}
