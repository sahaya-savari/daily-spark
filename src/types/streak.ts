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
}

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
