/**
 * Habit data model. Field names match the original Daily Spark `Streak`
 * shape so data and backups move between the old app and this one.
 * `icon` is the line-icon key shown in the UI; `emoji` is kept for backup
 * compatibility with the original Android app.
 */
export type HabitSchedule = Pick<Habit, "frequencyType" | "targetDaysPerWeek" | "customDays">;
export type DatedHabitSchedule = HabitSchedule & { effectiveOn: string };

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  icon?: string | undefined;
  createdAt: string; // YYYY-MM-DD
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  completedDates: string[]; // YYYY-MM-DD, unique, sorted
  color?: string | undefined;
  notes?: string | undefined;
  description?: string | undefined;
  isStarred?: boolean | undefined;
  archivedAt?: string | null | undefined;
  reminderEnabled?: boolean | undefined;
  reminderTime?: string | undefined; // HH:MM
  listId?: string | undefined;
  // Phase 2 additions
  category?: string | undefined;
  orderIndex?: number | undefined;
  isPaused?: boolean | undefined;
  pausedAt?: string | null | undefined;
  // Phase 3 additions
  scheduleHistory?: DatedHabitSchedule[];
  frequencyType?: "daily" | "weekly_target" | "specific_days" | undefined;
  targetDaysPerWeek?: number | undefined;
  customDays?: number[] | undefined; // 0=Sun, 1=Mon, ..., 6=Sat
  milestonesReached?: number[] | undefined;
  pauseReason?: string | undefined;
  snoozedUntil?: number | undefined; // Unix timestamp in ms
  // Phase 4 additions
  kind?: "boolean" | "quantitative" | "avoid" | undefined;
  targetValue?: number | undefined;
  unit?: string | undefined;
  stepIncrement?: number | undefined;
  quantitativeValues?: Record<string, number> | undefined;
  dailyCost?: number | undefined;
  relapses?: RelapseEntry[] | undefined;
  subtasks?: SubtaskItem[] | undefined;
  subtaskCompletions?: Record<string, string[]> | undefined; // dateKey -> array of subtask IDs
  vacationRanges?: VacationRange[] | undefined;
  // Phase 5 additions
  dayNotes?: Record<string, string>;
  completionTimes?: Record<string, string> | undefined; // dateKey -> ISO string or HH:MM
  totalFocusMinutes?: number | undefined;
  // Phase 6 & 7 additions
  elasticTargets?: ElasticTargets | undefined;
  cueText?: string | undefined;
  afterHabitId?: string | undefined;
  [extra: string]: unknown;
}

/** Optional organization layer; habits remain independent and can belong to multiple collections. */
export interface HabitCollection {
  id: string;
  name: string;
  description?: string | undefined;
  icon: string;
  color: string;
  habitIds: string[];
  orderIndex: number;
  isPinned?: boolean | undefined;
  startMode?: "guided" | "list" | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface ElasticTargets {
  mini: number;
  plus: number;
  elite: number;
  unit?: string | undefined;
}

export interface RelapseEntry {
  date: string; // YYYY-MM-DD
  timestamp?: string | undefined;
  cost?: number | undefined;
  reason?: string | undefined;
}

export interface SubtaskItem {
  id: string;
  title: string;
}

export interface VacationRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  reason?: string | undefined;
}

export interface QuantProgress {
  laps: number;
  fraction: number;
  reachedGoal: boolean;
  exceededGoal: boolean;
  totalPercent: number;
}

export interface StandaloneNote {
  id: string; // UUID or timestamp-based
  title: string; // Plain text title
  content: string; // Markdown or plain text content
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  pinned?: boolean | undefined; // Pinned to top
  color?: string | undefined; // Accent color swatch
}

export interface PlannerTask {
  id: string;
  title: string;
  dueOn: string | null;
  routineId: string | null;
  completedOn: string | null;
}

export interface FocusSession {
  id: string;
  minutes: number;
  endedAt: string;
  day: string;
  habitId: string | null;
  credited: boolean;
}

export interface HabitSettings {
  reduceMotion?: boolean;
  hapticsEnabled?: boolean;
  colorMode?: "system" | "light" | "dark" | "amoled";
  customAccent?: string | null;
  focusMinutes?: 15 | 25 | 50;
  focusDailyGoal?: number;
  focusSessions?: FocusSession[];
  weekStartsOn?: 0 | 1 | 6;
  todayPlannerEnabled?: boolean;
  plannerTasks?: PlannerTask[];
  enabled: boolean; // reminders master switch
  defaultTime: string; // HH:MM
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  muteCompletedReminders?: boolean;
  respectDND?: boolean | undefined;
  preTaskReminderOffsetMinutes?: number | undefined;
  autoBackupHistoryEnabled?: boolean | undefined;
  themeMode?: "classic" | "minimal" | "expressive" | undefined;
  solarCircadianGlide?: boolean | undefined;
  rolloverHour?: number | undefined;
  todayShowNextUp?: boolean | undefined;
  todayShowWeeklyRhythm?: boolean | undefined;
  todayCompletedDisplay?: "show" | "last" | "hide";
  todayShowRoutines?: boolean | undefined;
  [extra: string]: unknown;
}

export const DEFAULT_SETTINGS: HabitSettings = {
  enabled: false,
  defaultTime: "20:00",
  respectDND: true,
  preTaskReminderOffsetMinutes: 5,
  autoBackupHistoryEnabled: true,
  themeMode: "classic",
  solarCircadianGlide: true,
  rolloverHour: 0,
  todayShowNextUp: true,
  todayShowWeeklyRhythm: true,
  todayShowRoutines: true,
};

export const COLOR_OPTIONS = [
  { name: "Clay", value: "fire" },
  { name: "Amber", value: "sunset" },
  { name: "Sage", value: "forest" },
  { name: "Tide", value: "ocean" },
  { name: "Plum", value: "purple" },
  { name: "Rose", value: "rose" },
] as const;

/** Color tag swatches, muted to sit on the charcoal palette. */
export const COLOR_SWATCH: Record<string, string> = {
  fire: "#D9A184",
  sunset: "#E0B15A",
  forest: "#8FA377",
  ocean: "#86A3B8",
  purple: "#A897BE",
  rose: "#C98E96",
};

export interface MilestoneDef {
  days: number;
  title: string;
  badge: string;
  description: string;
}

export const MILESTONES: MilestoneDef[] = [
  { days: 3, title: "Spark Ignition", badge: "✨", description: "3 days of solid momentum" },
  { days: 7, title: "First Spark", badge: "🌱", description: "One full week of showing up" },
  { days: 21, title: "Habit Loop", badge: "⚡", description: "21 days: neural pattern forming" },
  { days: 50, title: "Steady Rhythm", badge: "🔥", description: "50 days of unshakeable consistency" },
  { days: 100, title: "Century Run", badge: "🌟", description: "Triple digits: dedicated mastery" },
  { days: 365, title: "Year of Spark", badge: "👑", description: "One full revolution around the sun" },
];

export interface CategoryDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const CURATED_CATEGORIES: CategoryDef[] = [
  { id: "daily", name: "Daily Essentials", emoji: "⚡", color: "fire" },
  { id: "health", name: "Health & Body", emoji: "🏃", color: "forest" },
  { id: "study", name: "Study & Skill", emoji: "📚", color: "ocean" },
  { id: "work", name: "Deep Work", emoji: "💼", color: "purple" },
  { id: "mindfulness", name: "Mind & Calm", emoji: "🧘", color: "sunset" },
  { id: "creative", name: "Creative Craft", emoji: "🎨", color: "rose" },
];
