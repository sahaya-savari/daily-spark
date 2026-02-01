import { Streak } from '@/types/streak';

const GRACE_KEY = 'streakflame_grace';

interface GraceTracker {
  [streakId: string]: {
    weeklyUsed: boolean;
    weekId: string; // YYYY-Www format
    monthlyUsed: string | null; // ISO date of last monthly use
  };
}

const getWeekId = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

const getGraceTracker = (): GraceTracker => {
  try {
    const stored = localStorage.getItem(GRACE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
};

const saveGraceTracker = (tracker: GraceTracker): void => {
  try {
    localStorage.setItem(GRACE_KEY, JSON.stringify(tracker));
  } catch (error) {
    console.error('[Grace] Failed to save grace tracker:', error);
  }
};

export const canUseWeeklyGrace = (streakId: string): boolean => {
  const tracker = getGraceTracker();
  const currentWeek = getWeekId();
  const grace = tracker[streakId];
  
  if (!grace) return true;
  if (grace.weekId !== currentWeek) return true;
  
  return !grace.weeklyUsed;
};

export const canUseMonthlyGrace = (streakId: string): boolean => {
  const tracker = getGraceTracker();
  const grace = tracker[streakId];
  
  if (!grace || !grace.monthlyUsed) return true;
  
  const lastUseDate = new Date(grace.monthlyUsed);
  const now = new Date();
  
  const monthDiff = (now.getFullYear() - lastUseDate.getFullYear()) * 12 + 
                    (now.getMonth() - lastUseDate.getMonth());
  
  return monthDiff >= 1;
};

export const useWeeklyGrace = (streakId: string): boolean => {
  if (!canUseWeeklyGrace(streakId)) return false;
  
  const tracker = getGraceTracker();
  const currentWeek = getWeekId();
  
  tracker[streakId] = {
    weeklyUsed: true,
    weekId: currentWeek,
    monthlyUsed: tracker[streakId]?.monthlyUsed || null,
  };
  
  saveGraceTracker(tracker);
  return true;
};

export const useMonthlyGrace = (streakId: string): boolean => {
  if (!canUseMonthlyGrace(streakId)) return false;
  
  const tracker = getGraceTracker();
  const today = new Date().toISOString().split('T')[0];
  
  tracker[streakId] = {
    weeklyUsed: tracker[streakId]?.weeklyUsed || false,
    weekId: tracker[streakId]?.weekId || getWeekId(),
    monthlyUsed: today,
  };
  
  saveGraceTracker(tracker);
  return true;
};

export const getGraceStatus = (streakId: string): {
  weeklyAvailable: boolean;
  monthlyAvailable: boolean;
} => {
  return {
    weeklyAvailable: canUseWeeklyGrace(streakId),
    monthlyAvailable: canUseMonthlyGrace(streakId),
  };
};

export const resetWeeklyGrace = (): void => {
  const tracker = getGraceTracker();
  const currentWeek = getWeekId();
  
  Object.keys(tracker).forEach(streakId => {
    if (tracker[streakId].weekId !== currentWeek) {
      tracker[streakId].weeklyUsed = false;
      tracker[streakId].weekId = currentWeek;
    }
  });
  
  saveGraceTracker(tracker);
};
