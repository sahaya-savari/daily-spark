export interface Streak {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  completedDates: string[];
  color?: string;
  notes?: string; // Editable description/notes for the streak
  // New fields for pause and notification support
  isPaused?: boolean;
  pausedAt?: string | null;
  reminderEnabled?: boolean;
  reminderTime?: string; // HH:MM format
  archivedAt?: string | null;
  // Google Tasks-like customization
  description?: string; // Long-form streak description
  isStarred?: boolean; // Whether streak is starred (pinned to top)
  listId?: string; // Which list this streak belongs to (default: 'default')
  scheduledDate?: string; // YYYY-MM-DD format, if streak is scheduled for specific date
  scheduledTime?: string; // HH:MM format, if streak is scheduled for specific time
  // Display customization
  fontSize?: 'small' | 'medium' | 'large';
  textAlign?: 'left' | 'center' | 'right';
  // Snooze feature
  snoozedUntil?: number; // Unix timestamp
  // Grace system
  graceUsedThisWeek?: boolean;
  graceUsedThisMonth?: string; // ISO date of last monthly grace use
  lastGraceWeek?: string; // ISO week identifier (YYYY-Www)
}

export interface StreakList {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export const DEFAULT_LIST_ID = 'default';
export const DEFAULT_LIST: StreakList = {
  id: DEFAULT_LIST_ID,
  name: 'My Streaks',
  color: 'fire',
  createdAt: new Date().toISOString().split('T')[0],
};

export interface StreakStats {
  totalStreaks: number;
  activeStreaks: number;
  totalCompletions: number;
  longestStreak: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
}

export type StreakStatus = 'completed' | 'pending' | 'at-risk';

export const EMOJI_OPTIONS = [
  '🔥', '💪', '📚', '🏃', '🧘', '💧', '🥗', '💤', 
  '✍️', '🎯', '🌟', '💡', '🎨', '🎵', '💻', '🌱',
  '🧠', '❤️', '🏋️', '🚴', '🏊', '📝', '🙏', '☀️'
];

export const COLOR_OPTIONS = [
  { name: 'Fire', value: 'fire' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Forest', value: 'forest' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Purple', value: 'purple' },
  { name: 'Rose', value: 'rose' },
];
