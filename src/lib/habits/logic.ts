import { addDays, isValidKey, lastNDays, todayKey } from "./dates";
import { DEFAULT_SETTINGS, MILESTONES, type Habit, type HabitCollection, type HabitSettings, type MilestoneDef, type StandaloneNote } from "./types";
import { calculateCleanStreak } from "./avoid";
import { currentStreakWithNeutral } from "./vacation";

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
  let cur: number;
  let bestRun: number;

  if (habit.kind === "avoid") {
    cur = calculateCleanStreak(habit, today);
    bestRun = cur;
  } else if (habit.vacationRanges && habit.vacationRanges.length > 0) {
    cur = currentStreakWithNeutral(completedDates, habit, today);
    bestRun = longestStreak(completedDates);
  } else {
    cur = currentStreak(completedDates, today);
    bestRun = longestStreak(completedDates);
  }

  return {
    ...habit,
    completedDates,
    currentStreak: cur,
    bestStreak: Math.max(habit.bestStreak || 0, bestRun, cur),
    lastCompletedDate: habit.kind === "avoid" ? null : (completedDates.at(-1) ?? null),
  };
}

export function isDoneOn(habit: Habit, day: string): boolean {
  if (habit.kind === "avoid") {
    const createdKey = habit.createdAt ? habit.createdAt.slice(0, 10) : "";
    if (createdKey && day < createdKey) return false;
    if (day > todayKey()) return false;
    const hasRelapse = habit.relapses?.some((r) => r.date === day);
    return !hasRelapse;
  }
  return habit.completedDates.includes(day);
}

/** Mark today as done. Doing it twice in one day changes nothing. */
export function completeToday(habit: Habit, today: string, timeStr?: string): Habit {
  if (isDoneOn(habit, today)) return habit;
  const nextTimes = { ...(habit.completionTimes || {}) };
  nextTimes[today] = timeStr || new Date().toISOString();
  return refresh({
    ...habit,
    completedDates: [...habit.completedDates, today],
    completionTimes: nextTimes,
  }, today);
}

/** Undo today's completion (mistake-friendly). Only today can be undone. */
export function undoToday(habit: Habit, today: string): Habit {
  if (!isDoneOn(habit, today)) return habit;
  const completedDates = habit.completedDates.filter((d) => d !== today);
  const nextTimes = { ...(habit.completionTimes || {}) };
  delete nextTimes[today];
  const next = refresh({
    ...habit,
    completedDates,
    completionTimes: nextTimes,
    bestStreak: 0,
  }, today);
  // Best streak never drops below the longest run still in history.
  return { ...next, bestStreak: Math.max(longestStreak(completedDates), next.currentStreak) };
}

/**
 * Safely toggle completion of any day (past or today).
 * If dateStr is in completedDates, removes it.
 * If not, adds it.
 * Recalculates currentStreak, bestStreak, and lastCompletedDate deterministically.
 */
export function togglePastDay(habit: Habit, dateStr: string, today: string): Habit {
  if (!isValidKey(dateStr) || dateStr > today) return habit;
  const isCompleted = habit.completedDates.includes(dateStr);
  const nextDates = isCompleted
    ? habit.completedDates.filter((d) => d !== dateStr)
    : [...habit.completedDates, dateStr];

  const nextTimes = { ...(habit.completionTimes || {}) };
  if (isCompleted) {
    delete nextTimes[dateStr];
  } else if (!nextTimes[dateStr]) {
    nextTimes[dateStr] = new Date().toISOString();
  }

  const sortedDates = normalizeDates(nextDates);
  const updatedHabit = {
    ...habit,
    completedDates: sortedDates,
    completionTimes: nextTimes,
    bestStreak: isCompleted ? 0 : (habit.bestStreak || 0),
  };
  return refresh(updatedHabit, today);
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
  if (h.isPaused) return false;
  return isHabitDueToday(h, day);
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

/**
 * 0-4 intensity level for heatmaps.
 *
 * The selected appearance mode maps these intensity levels to one cohesive
 * hue family; this function only determines intensity and never assigns a
 * color itself.
 */
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
    notes: typeof input.notes === "string" ? input.notes.slice(0, 1000) : "",
    category: typeof input.category === "string" && input.category.trim() ? input.category.trim() : undefined,
    orderIndex: typeof input.orderIndex === "number" ? input.orderIndex : undefined,
    isPaused: Boolean(input.isPaused),
    pausedAt: input.pausedAt ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Reordering & Organization                                           */
/* ------------------------------------------------------------------ */

/**
 * Reorders habits by moving the habit with sourceId to the index of targetId.
 * Updates orderIndex on all habits in sequence.
 */
export function reorderHabits(habits: Habit[], sourceId: string, targetId: string): Habit[] {
  if (sourceId === targetId) return habits;
  const sourceIndex = habits.findIndex((h) => h.id === sourceId);
  const targetIndex = habits.findIndex((h) => h.id === targetId);
  if (sourceIndex === -1 || targetIndex === -1) return habits;

  const result = [...habits];
  const [removed] = result.splice(sourceIndex, 1);
  if (!removed) return habits;
  result.splice(targetIndex, 0, removed);

  return result.map((h, idx) => ({ ...h, orderIndex: idx }));
}

/**
 * Reorders habits according to an explicit array of IDs.
 */
export function reorderHabitsByIds(habits: Habit[], orderedIds: string[]): Habit[] {
  const map = new Map(habits.map((h) => [h.id, h]));
  const ordered: Habit[] = [];
  for (const id of orderedIds) {
    const item = map.get(id);
    if (item) {
      ordered.push(item);
      map.delete(id);
    }
  }
  for (const remaining of map.values()) {
    ordered.push(remaining);
  }
  return ordered.map((h, idx) => ({ ...h, orderIndex: idx }));
}

/* ------------------------------------------------------------------ */
/* Data Integrity Check & Auto-Healing                                 */
/* ------------------------------------------------------------------ */

export interface IntegrityResult {
  healed: Habit[];
  issuesFound: number;
}

/**
 * Startup Data Integrity Check & Auto-Healing.
 * 1. Duplicate IDs: Assigns deterministic new IDs to duplicate entries.
 * 2. Streak Counter Drift: Recalculates currentStreak and bestStreak using pure rules.
 * 3. History Invariance: Ensures completedDates are unique, valid YYYY-MM-DD, sorted.
 * 4. Safe Phase-2 Defaults: Populates notes, category, orderIndex, and pause flags.
 */
export function verifyAndHealIntegrity(habits: Habit[], today: string): IntegrityResult {
  let issuesFound = 0;
  const seenIds = new Set<string>();
  const healed: Habit[] = [];

  for (let i = 0; i < habits.length; i++) {
    const raw = habits[i];
    if (!raw || typeof raw !== "object") {
      issuesFound++;
      continue;
    }

    let habit = { ...raw };

    // 1. ID check & deduplication
    if (!habit.id || typeof habit.id !== "string" || !habit.id.trim()) {
      habit.id = newId();
      issuesFound++;
    } else if (seenIds.has(habit.id)) {
      habit.id = `${habit.id}-dup-${i + 1}`;
      issuesFound++;
    }
    seenIds.add(habit.id);

    // 2. Name sanity
    if (!habit.name || typeof habit.name !== "string" || !habit.name.trim()) {
      habit.name = "Untitled Habit";
      issuesFound++;
    }

    // 3. History invariance: unique, valid YYYY-MM-DD strings, chronologically sorted
    const rawDates = Array.isArray(habit.completedDates) ? habit.completedDates : [];
    const normalized = normalizeDates(rawDates);
    const datesChanged =
      normalized.length !== rawDates.length ||
      normalized.some((d, idx) => d !== rawDates[idx]);
    if (datesChanged) {
      issuesFound++;
    }

    // 4. Streak counter drift
    let correctCurrent = currentStreak(normalized, today);
    let longest = longestStreak(normalized);
    if (habit.kind === "avoid") {
      correctCurrent = calculateCleanStreak(habit, today);
      longest = correctCurrent;
    } else if (habit.vacationRanges && habit.vacationRanges.length > 0) {
      correctCurrent = currentStreakWithNeutral(normalized, habit, today);
    }
    const correctBest = Math.max(habit.bestStreak || 0, longest, correctCurrent);
    const correctLastCompleted = habit.kind === "avoid" ? null : (normalized.at(-1) ?? null);

    if (
      habit.currentStreak !== correctCurrent ||
      habit.bestStreak !== correctBest ||
      habit.lastCompletedDate !== correctLastCompleted
    ) {
      issuesFound++;
    }

    const rawNotes = typeof habit.notes === "string" ? habit.notes : "";
    const notes = rawNotes.slice(0, 1000);
    if (typeof habit.notes !== "string" || habit.notes.length > 1000) {
      issuesFound++;
    }

    const isPaused = Boolean(habit.isPaused);
    if (habit.isPaused !== isPaused) {
      issuesFound++;
    }

    habit = {
      ...habit,
      completedDates: normalized,
      currentStreak: correctCurrent,
      bestStreak: correctBest,
      lastCompletedDate: correctLastCompleted,
      isStarred: Boolean(habit.isStarred),
      archivedAt: habit.archivedAt ?? null,
      notes,
      category: typeof habit.category === "string" ? habit.category : undefined,
      orderIndex: typeof habit.orderIndex === "number" ? habit.orderIndex : i,
      isPaused,
      pausedAt: habit.pausedAt ?? null,
    };

    healed.push(habit);
  }

  return { healed, issuesFound };
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
  data: { streaks: Habit[]; settings: HabitSettings; notes?: StandaloneNote[]; collections?: HabitCollection[] };
}

export function buildBackup(
  habits: Habit[],
  settings: HabitSettings,
  now = new Date(),
  notes?: StandaloneNote[],
  collections?: HabitCollection[],
): BackupFile {
  return {
    version: BACKUP_VERSION,
    exportDate: now.toISOString(),
    app: "daily-spark",
    data: {
      streaks: habits,
      settings,
      ...(notes && notes.length > 0 ? { notes } : {}),
      ...(collections && collections.length > 0 ? { collections } : {}),
    },
  };
}

export interface ParsedBackup {
  version?: string;
  habits: Habit[];
  settings: HabitSettings;
  notes?: StandaloneNote[];
  collections?: HabitCollection[];
  skipped: number;
  exportDate: string | null;
}

export class BackupError extends Error {}

interface Raw {
  id?: unknown; name?: unknown; title?: unknown; emoji?: unknown; createdAt?: unknown;
  completedDates?: unknown; history?: unknown; archivedAt?: unknown; archived?: unknown;
  isStarred?: unknown; starred?: unknown; bestStreak?: unknown;
  data?: unknown; streaks?: unknown; settings?: unknown; exportDate?: unknown; notes?: unknown; collections?: unknown; version?: unknown;
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

  const rawNotes = typeof r.notes === "string" ? r.notes.slice(0, 1000) : "";
  const rawCategory = typeof r.category === "string" && r.category.trim() ? r.category.trim() : undefined;
  const rawOrderIndex = typeof r.orderIndex === "number" ? r.orderIndex : undefined;
  const rawIsPaused = Boolean(r.isPaused);
  const rawPausedAt = typeof r.pausedAt === "string" && r.pausedAt ? r.pausedAt : null;

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
    notes: rawNotes,
    category: rawCategory,
    orderIndex: rawOrderIndex,
    isPaused: rawIsPaused,
    pausedAt: rawPausedAt,
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
  let notes: StandaloneNote[] | undefined;
  let collections: HabitCollection[] | undefined;

  if (Array.isArray(json)) {
    streaks = json;
  } else if (json && typeof json === "object") {
    const o = json as Raw;
    const data = (o.data && typeof o.data === "object" ? o.data : o) as Raw;
    streaks = data.streaks;
    settings = data.settings;
    exportDate = o.exportDate ?? data.exportDate;
    const rawNotesList = Array.isArray(data.notes) ? data.notes : Array.isArray(o.notes) ? o.notes : undefined;
    if (Array.isArray(rawNotesList)) {
      notes = rawNotesList
        .filter((n): n is Record<string, unknown> => Boolean(n && typeof n === "object"))
        .map((n) => ({
          id: typeof n.id === "string" && n.id.trim() ? n.id : `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: typeof n.title === "string" && n.title.trim() ? n.title.trim() : "Untitled Note",
          content: typeof n.content === "string" ? n.content : "",
          createdAt: typeof n.createdAt === "string" ? n.createdAt : today,
          updatedAt: typeof n.updatedAt === "string" ? n.updatedAt : today,
          pinned: Boolean(n.pinned),
          color: typeof n.color === "string" ? n.color : undefined,
        }));
    }
    const rawCollections = Array.isArray(data.collections)
      ? data.collections
      : Array.isArray(o.collections)
        ? o.collections
        : undefined;
    if (Array.isArray(rawCollections)) {
      collections = rawCollections
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .filter((item) => typeof item.id === "string" && typeof item.name === "string")
        .map((item, index) => ({
          id: String(item.id),
          name: String(item.name).trim() || "Untitled Collection",
          description: typeof item.description === "string" ? item.description : undefined,
          icon: typeof item.icon === "string" ? item.icon : "folder",
          color: typeof item.color === "string" ? item.color : "fire",
          habitIds: Array.isArray(item.habitIds) ? item.habitIds.filter((id): id is string => typeof id === "string") : [],
          orderIndex: typeof item.orderIndex === "number" ? item.orderIndex : index,
          isPinned: Boolean(item.isPinned),
          startMode: item.startMode === "guided" ? "guided" : "list",
          createdAt: typeof item.createdAt === "string" ? item.createdAt : today,
          updatedAt: typeof item.updatedAt === "string" ? item.updatedAt : today,
        }));
    }
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
  const restoredHabitIds = new Set(habits.map((habit) => habit.id));
  const validCollections = collections?.map((collection) => ({
    ...collection,
    habitIds: collection.habitIds.filter((habitId) => restoredHabitIds.has(habitId)),
  }));

  return {
    version: typeof (json as Raw)?.version === "string" ? ((json as Raw).version as string) : "1",
    habits,
    settings: {
      ...DEFAULT_SETTINGS,
      ...(settings && typeof settings === "object" ? (settings as Partial<HabitSettings>) : {}),
    },
    notes,
    collections: validCollections,
    skipped,
    exportDate: typeof exportDate === "string" ? exportDate : null,
  };
}

export interface BackupPreview {
  version: string;
  exportDate: string | null;
  totalStreaks: number;
  activeCount: number;
  archivedCount: number;
  totalCompletions: number;
  notesCount: number;
  settings: HabitSettings;
}

export interface BackupInspection {
  parsed: ParsedBackup;
  preview: BackupPreview;
  notes: StandaloneNote[];
}

export interface SandboxedInspectionResult {
  valid: boolean;
  habitsCount: number;
  notesCount: number;
  settingsIncluded: boolean;
  rawPayload: unknown;
  error?: string;
}

export function inspectBackupSandbox(text: string): SandboxedInspectionResult {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: null, error: "Empty payload" };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object" || (Array.isArray(parsed) && parsed.length === 0)) {
      return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: parsed, error: "Invalid JSON root" };
    }

    const data = (parsed.data && typeof parsed.data === "object" ? parsed.data : parsed) as Record<string, unknown>;
    const habitsRaw = Array.isArray(parsed)
      ? (parsed as unknown[])
      : Array.isArray(data.streaks)
      ? (data.streaks as unknown[])
      : Array.isArray(data.habits)
      ? (data.habits as unknown[])
      : null;

    if (!habitsRaw) {
      return { valid: false, habitsCount: 0, notesCount: 0, settingsIncluded: false, rawPayload: parsed, error: "No habits array found" };
    }

    const validHabits = habitsRaw.filter((h: unknown): h is Habit => {
      if (!h || typeof h !== "object") return false;
      const item = h as Record<string, unknown>;
      const hasId = typeof item.id === "string" && item.id.trim().length > 0;
      const hasName = typeof item.name === "string" && item.name.trim().length > 0;
      return Boolean(hasId && hasName);
    });
    const notes = Array.isArray(data.notes) ? data.notes : Array.isArray(parsed.notes) ? parsed.notes : [];
    const settings = (data.settings && typeof data.settings === "object") || (parsed.settings && typeof parsed.settings === "object");

    return {
      valid: true,
      habitsCount: validHabits.length,
      notesCount: notes.length,
      settingsIncluded: Boolean(settings),
      rawPayload: parsed,
    };
  } catch (err) {
    return {
      valid: false,
      habitsCount: 0,
      notesCount: 0,
      settingsIncluded: false,
      rawPayload: null,
      error: err instanceof Error ? err.message : "Malformed JSON",
    };
  }
}

export function inspectBackup(text: string, today: string): BackupInspection {
  const parsed = parseBackup(text, today);
  const activeCount = parsed.habits.filter((h) => !isArchived(h)).length;
  const archivedCount = parsed.habits.filter((h) => isArchived(h)).length;
  const completions = totalCompletions(parsed.habits);
  const notes = parsed.notes ?? [];

  return {
    parsed,
    preview: {
      version: parsed.version ?? "1",
      exportDate: parsed.exportDate,
      totalStreaks: parsed.habits.length,
      activeCount,
      archivedCount,
      totalCompletions: completions,
      notesCount: notes.length,
      settings: parsed.settings,
    },
    notes,
  };
}

export function habitsToCsv(habits: Habit[], notes: StandaloneNote[] = []): string {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
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
  const out = [head.join(","), ...rows];
  if (notes && notes.length > 0) {
    out.push("");
    out.push("# NOTES");
    out.push(["id", "title", "content", "pinned", "createdAt", "updatedAt"].join(","));
    for (const n of notes) {
      out.push([
        esc(n.id),
        esc(n.title),
        esc((n.content || "").replace(/\r?\n/g, "\\n")),
        n.pinned ? "true" : "false",
        n.createdAt,
        n.updatedAt,
      ].join(","));
    }
  }
  return out.join("\n");
}

export function habitsToTsv(habits: Habit[], notes: StandaloneNote[] = []): string {
  const esc = (v: string) => String(v).replace(/\t/g, " ").replace(/\r?\n/g, "\\n");
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
    ].join("\t"),
  );
  const out = [head.join("\t"), ...rows];
  if (notes && notes.length > 0) {
    out.push("");
    out.push("# NOTES");
    out.push(["id", "title", "content", "pinned", "createdAt", "updatedAt"].join("\t"));
    for (const n of notes) {
      out.push([
        esc(n.id),
        esc(n.title),
        esc(n.content || ""),
        n.pinned ? "true" : "false",
        n.createdAt,
        n.updatedAt,
      ].join("\t"));
    }
  }
  return out.join("\n");
}

export interface ParsedCsvResult {
  habits: Habit[];
  notes?: StandaloneNote[];
  added: number;
  skipped: number;
  errors: string[];
}

function parseDelimitedLine(line: string, delimiter: string): string[] {
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
    } else if (char === delimiter && !inQuotes) {
      result.push(cur.trim());
      cur = "";
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Imports habits and standalone notes from CSV.
 * Starts new streaks at Day 1 (no history) and never overwrites existing streaks.
 */
export function parseCsvHabits(
  csvText: string,
  today: string,
  existingHabits: Habit[] = [],
): ParsedCsvResult {
  const [habitsPart, notesPart] = csvText.split(/# NOTES\r?\n/);
  const lines = (habitsPart || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { habits: [], added: 0, skipped: 0, errors: ["Empty CSV file"] };
  }

  const parseLine = (line: string) => parseDelimitedLine(line, ",");
  const headerLine = lines[0]!.toLowerCase();
  const headers = parseLine(headerLine);

  let nameIdx = headers.findIndex((h) => h === "name" || h === "title");
  let emojiIdx = headers.findIndex((h) => h === "emoji");
  const startDateIdx = headers.findIndex((h) => h === "start_date" || h === "createdat" || h === "created_at");
  const completedDatesIdx = headers.findIndex((h) => h === "completeddates" || h === "completed_dates");
  const archivedIdx = headers.findIndex((h) => h === "archived");
  const bestStreakIdx = headers.findIndex((h) => h === "beststreak" || h === "best_streak");

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
    if (completedDatesIdx !== -1 && cols[completedDatesIdx]) {
      const dates = cols[completedDatesIdx].split(/\s+/).filter(isValidKey);
      if (dates.length > 0) {
        habit.completedDates = normalizeDates(dates);
      }
    }
    if (archivedIdx !== -1 && cols[archivedIdx] === "true") {
      habit.archivedAt = new Date().toISOString();
    }
    if (bestStreakIdx !== -1 && Number(cols[bestStreakIdx])) {
      habit.bestStreak = Number(cols[bestStreakIdx]);
    }

    const finalHabit = refresh(habit, today);
    newHabits.push(finalHabit);
    existingNames.add(name.toLowerCase());
  }

  const notes: StandaloneNote[] = [];
  if (notesPart) {
    const noteLines = notesPart.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const noteDataLines = noteLines.slice(1);
    for (const nLine of noteDataLines) {
      const cols = parseLine(nLine);
      if (cols.length >= 2 && cols[1]) {
        notes.push({
          id: cols[0] || `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: cols[1],
          content: (cols[2] || "").replace(/\\n/g, "\n"),
          pinned: cols[3] === "true",
          createdAt: cols[4] || today,
          updatedAt: cols[5] || today,
        });
      }
    }
  }

  return {
    habits: newHabits,
    notes: notes.length > 0 ? notes : undefined,
    added: newHabits.length,
    skipped,
    errors,
  };
}

/**
 * Imports habits and standalone notes from TSV (tab-separated values).
 */
export function parseTsvHabits(
  tsvText: string,
  today: string,
  existingHabits: Habit[] = [],
): ParsedCsvResult {
  const [habitsPart, notesPart] = tsvText.split(/# NOTES\r?\n/);
  const lines = (habitsPart || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { habits: [], added: 0, skipped: 0, errors: ["Empty TSV file"] };
  }

  const parseLine = (line: string) => line.split("\t").map((c) => c.replace(/\\n/g, "\n").trim());
  const headerLine = lines[0]!.toLowerCase();
  const headers = parseLine(headerLine);

  let nameIdx = headers.findIndex((h) => h === "name" || h === "title");
  let emojiIdx = headers.findIndex((h) => h === "emoji");
  const startDateIdx = headers.findIndex((h) => h === "start_date" || h === "createdat" || h === "created_at");
  const completedDatesIdx = headers.findIndex((h) => h === "completeddates" || h === "completed_dates");
  const archivedIdx = headers.findIndex((h) => h === "archived");
  const bestStreakIdx = headers.findIndex((h) => h === "beststreak" || h === "best_streak");

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
    if (completedDatesIdx !== -1 && cols[completedDatesIdx]) {
      const dates = cols[completedDatesIdx].split(/\s+/).filter(isValidKey);
      if (dates.length > 0) {
        habit.completedDates = normalizeDates(dates);
      }
    }
    if (archivedIdx !== -1 && cols[archivedIdx] === "true") {
      habit.archivedAt = new Date().toISOString();
    }
    if (bestStreakIdx !== -1 && Number(cols[bestStreakIdx])) {
      habit.bestStreak = Number(cols[bestStreakIdx]);
    }

    const finalHabit = refresh(habit, today);
    newHabits.push(finalHabit);
    existingNames.add(name.toLowerCase());
  }

  const notes: StandaloneNote[] = [];
  if (notesPart) {
    const noteLines = notesPart.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const noteDataLines = noteLines.slice(1);
    for (const nLine of noteDataLines) {
      const cols = parseLine(nLine);
      if (cols.length >= 2 && cols[1]) {
        notes.push({
          id: cols[0] || `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: cols[1],
          content: cols[2] || "",
          pinned: cols[3] === "true",
          createdAt: cols[4] || today,
          updatedAt: cols[5] || today,
        });
      }
    }
  }

  return {
    habits: newHabits,
    notes: notes.length > 0 ? notes : undefined,
    added: newHabits.length,
    skipped,
    errors,
  };
}

/* ------------------------------------------------------------------ */
/* Phase 3: Flexible Frequencies, Milestones & Data Freedom           */
/* ------------------------------------------------------------------ */

/**
 * Checks whether a habit is scheduled / due on a specific calendar date (YYYY-MM-DD).
 * Default is daily. Respects pause state, specific days of week, and weekly targets.
 */
export function isHabitDueToday(habit: Habit, dateKey: string): boolean {
  if (habit.isPaused) return false;
  if (!habit.frequencyType || habit.frequencyType === "daily") return true;

  if (habit.frequencyType === "specific_days") {
    if (!Array.isArray(habit.customDays) || habit.customDays.length === 0) return true;
    const d = new Date(dateKey + "T12:00:00Z");
    const dayOfWeek = d.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    return habit.customDays.includes(dayOfWeek);
  }

  if (habit.frequencyType === "weekly_target") {
    // If already completed on this date, it's satisfied
    if (habit.completedDates.includes(dateKey)) return true;
    const target = habit.targetDaysPerWeek ?? 1;

    // Calculate completions in current ISO week (Mon - Sun)
    const d = new Date(dateKey + "T12:00:00Z");
    const dayOfWeek = d.getUTCDay();
    const monOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(dateKey, monOffset);
    let completionsThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const day = addDays(monday, i);
      if (habit.completedDates.includes(day)) {
        completionsThisWeek++;
      }
    }
    return completionsThisWeek < target;
  }

  return true;
}

/**
 * Calculates calm milestones reached and the next upcoming milestone.
 */
export function getMilestones(streakCount: number): {
  reached: MilestoneDef[];
  nextMilestone: MilestoneDef | null;
} {
  const count = Math.max(0, streakCount);
  const reached = MILESTONES.filter((m) => count >= m.days);
  const nextMilestone = MILESTONES.find((m) => count < m.days) ?? null;
  return { reached, nextMilestone };
}

/**
 * Pauses a habit cleanly with an optional reason, preserving its current streak without penalty.
 */
export function pauseHabit(habit: Habit, reason?: string, today?: string): Habit {
  return {
    ...habit,
    isPaused: true,
    pausedAt: today ?? new Date().toISOString().slice(0, 10),
    pauseReason: reason?.trim() || undefined,
  };
}

/**
 * Resumes a paused habit.
 */
export function resumeHabit(habit: Habit, today?: string): Habit {
  const updated: Habit = {
    ...habit,
    isPaused: false,
    pausedAt: null,
    pauseReason: undefined,
  };
  return today ? refresh(updated, today) : updated;
}

/**
 * Applies a weekly or monthly grace day to forgive a missed yesterday.
 */
export function applyGrace(habit: Habit, type: "weekly" | "monthly", today: string): Habit {
  const yesterday = addDays(today, -1);
  if (habit.completedDates.includes(yesterday)) {
    return habit;
  }
  const updated = togglePastDay(habit, yesterday, today);
  if (type === "weekly") {
    return { ...updated, graceUsedThisWeek: true };
  } else {
    return { ...updated, graceUsedThisMonth: true };
  }
}

/**
 * Exports all habits, stats, and standalone notes as a clean, beautiful Markdown report.
 */
export function exportToMarkdown(habits: Habit[], notes: StandaloneNote[] = []): string {
  const dateStr = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# 🌱 Daily Spark — Habit & Journal Export`,
    ``,
    `> **Exported on:** ${dateStr}  `,
    `> **Philosophy:** Offline-first, calm consistency, zero telemetry.`,
    ``,
    `---`,
    ``,
    `## 📊 Summary`,
    `- **Total Habits:** ${habits.length}`,
    `- **Active Habits:** ${habits.filter((h) => !isArchived(h)).length}`,
    `- **Archived Habits:** ${habits.filter((h) => isArchived(h)).length}`,
    `- **Total Historical Completions:** ${totalCompletions(habits)}`,
    `- **Standalone Journal Notes:** ${notes.length}`,
    ``,
    `---`,
    ``,
    `## 🏃 Habits`,
    ``,
  ];

  if (habits.length === 0) {
    lines.push(`_No habits recorded yet._\n`);
  } else {
    for (const h of habits) {
      const status = isArchived(h) ? "Archived" : h.isPaused ? "Paused" : "Active";
      lines.push(`### ${h.emoji} ${h.name} (${status})`);
      lines.push(`- **Current Streak:** ${h.currentStreak} days`);
      lines.push(`- **Best Streak:** ${h.bestStreak} days`);
      lines.push(`- **Created At:** ${h.createdAt}`);
      lines.push(`- **Total Completions:** ${h.completedDates.length}`);
      if (h.category) lines.push(`- **Category:** #${h.category}`);
      if (h.frequencyType && h.frequencyType !== "daily") {
        lines.push(`- **Frequency:** ${h.frequencyType}`);
      }
      if (h.notes) {
        lines.push(`- **Habit Notes:**\n> ${h.notes.replace(/\n/g, "\n> ")}`);
      }
      lines.push(``);
    }
  }

  if (notes.length > 0) {
    lines.push(`---`, ``, `## 📝 Reflections & Journal Notes`, ``);
    for (const n of notes) {
      const pin = n.pinned ? "📌 " : "";
      lines.push(`### ${pin}${n.title}`);
      lines.push(`_Updated: ${n.updatedAt.slice(0, 10)}_`);
      lines.push(``);
      lines.push(n.content || `_No content._`);
      lines.push(``);
    }
  }

  return lines.join("\n");
}

/**
 * Restores habits and journal notes from a Daily Spark Markdown export.
 */
export function parseMarkdownHabits(
  mdText: string,
  today: string,
  existingHabits: Habit[] = []
): { habits: Habit[]; notes: StandaloneNote[]; added: number; skipped: number } {
  const existingNames = new Set(existingHabits.map((h) => h.name.toLowerCase()));
  const habits: Habit[] = [];
  const notes: StandaloneNote[] = [];
  let skipped = 0;

  const [habitsSection, notesSection] = mdText.split(/## 📝 Reflections & Journal Notes/);

  // Parse habits
  if (habitsSection) {
    const habitBlocks = habitsSection.split(/###\s+/).slice(1);
    for (const block of habitBlocks) {
      const firstLine = block.split("\n")[0] || "";
      const match = firstLine.match(/^(?:([^\w\s]+)\s+)?(.*?)(?:\s*\((Active|Paused|Archived)\))?$/);
      if (match) {
        const emoji = match[1] || "⚡";
        const name = match[2]?.trim();
        if (name && !existingNames.has(name.toLowerCase())) {
          existingNames.add(name.toLowerCase());
          const habit = createHabit({ name, emoji }, today);
          habits.push(habit);
        } else if (name) {
          skipped++;
        }
      }
    }
  }

  // Parse notes
  if (notesSection) {
    const noteBlocks = notesSection.split(/###\s+/).slice(1);
    for (const block of noteBlocks) {
      const lines = block.split("\n");
      const titleLine = lines[0]?.trim() || "Untitled Note";
      const pinned = titleLine.startsWith("📌");
      const title = titleLine.replace(/^📌\s*/, "");
      const content = lines.slice(2).join("\n").trim();
      notes.push({
        id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        content: content === "_No content._" ? "" : content,
        pinned,
        createdAt: today,
        updatedAt: today,
      });
    }
  }

  return { habits, notes, added: habits.length, skipped };
}

