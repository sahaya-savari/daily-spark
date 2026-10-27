/**
 * Habit data model. Field names match the original Daily Spark `Streak`
 * shape so data and backups move between the old app and this one.
 * `icon` is the line-icon key shown in the UI; `emoji` is kept for backup
 * compatibility with the original Android app.
 */
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
  [extra: string]: unknown;
}

export interface HabitSettings {
  enabled: boolean; // reminders master switch
  defaultTime: string; // HH:MM
  respectDND?: boolean | undefined;
  preTaskReminderOffsetMinutes?: number | undefined;
  [extra: string]: unknown;
}

export const DEFAULT_SETTINGS: HabitSettings = {
  enabled: false,
  defaultTime: "20:00",
  respectDND: true,
  preTaskReminderOffsetMinutes: 5,
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
