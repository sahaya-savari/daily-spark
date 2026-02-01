import { SnoozeOption } from '@/types/reminder';

const SNOOZE_KEY = 'streakflame_snoozes';

export const calculateSnoozeTime = (option: SnoozeOption, customMinutes?: number): number => {
  const now = Date.now();
  
  switch (option) {
    case '30min':
      return now + 30 * 60 * 1000;
    case '1hour':
      return now + 60 * 60 * 1000;
    case 'tomorrow': {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
      return tomorrow.getTime();
    }
    case 'custom':
      return now + (customMinutes || 60) * 60 * 1000;
    default:
      return now + 60 * 60 * 1000;
  }
};

export const snoozeStreak = (streakId: string, until: number): void => {
  try {
    const snoozes = getSnoozes();
    snoozes[streakId] = until;
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozes));
  } catch (error) {
    console.error('[Snooze] Failed to save snooze:', error);
  }
};

export const clearSnooze = (streakId: string): void => {
  try {
    const snoozes = getSnoozes();
    delete snoozes[streakId];
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(snoozes));
  } catch (error) {
    console.error('[Snooze] Failed to clear snooze:', error);
  }
};

export const getSnoozes = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem(SNOOZE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
};

export const isStreakSnoozed = (streakId: string): boolean => {
  const snoozes = getSnoozes();
  const snoozeUntil = snoozes[streakId];
  
  if (!snoozeUntil) return false;
  
  const now = Date.now();
  if (now >= snoozeUntil) {
    clearSnooze(streakId);
    return false;
  }
  
  return true;
};

export const getSnoozeEndTime = (streakId: string): Date | null => {
  const snoozes = getSnoozes();
  const snoozeUntil = snoozes[streakId];
  
  if (!snoozeUntil) return null;
  
  const now = Date.now();
  if (now >= snoozeUntil) {
    clearSnooze(streakId);
    return null;
  }
  
  return new Date(snoozeUntil);
};
