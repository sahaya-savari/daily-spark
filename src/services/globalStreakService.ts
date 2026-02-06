/**
 * BUG FIX 3: Global Streak Service
 * 
 * Tracks global daily activity - ONE day = ONE global streak increment
 * Multiple streak completions on same day do NOT increase global streak
 */

import { formatLocalDate, getTodayDate, getYesterdayDate } from '@/lib/dateUtils';

const GLOBAL_ACTIVITY_KEY = 'streakflame_global_activity';

export interface GlobalActivityData {
  activeDays: string[]; // Array of YYYY-MM-DD dates when ANY streak was completed
}

/**
 * Get global activity data from localStorage
 */
export const getGlobalActivity = (): GlobalActivityData => {
  try {
    const stored = localStorage.getItem(GLOBAL_ACTIVITY_KEY);
    if (!stored) {
      return { activeDays: [] };
    }
    const data = JSON.parse(stored) as GlobalActivityData;
    if (!data || !Array.isArray(data.activeDays)) {
      return { activeDays: [] };
    }
    return data;
  } catch (error) {
    console.error('[GlobalStreak] Failed to load activity data:', error);
    return { activeDays: [] };
  }
};

/**
 * Save global activity data to localStorage
 */
export const saveGlobalActivity = (data: GlobalActivityData): void => {
  try {
    localStorage.setItem(GLOBAL_ACTIVITY_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[GlobalStreak] Failed to save activity data:', error);
  }
};

/**
 * Record activity for today (called when ANY streak is completed)
 * Only adds today's date if not already present
 */
export const recordTodayActivity = (): void => {
  const today = getTodayDate();
  const data = getGlobalActivity();
  
  if (!data.activeDays.includes(today)) {
    data.activeDays.push(today);
    // Keep only last 365 days for performance
    if (data.activeDays.length > 365) {
      data.activeDays = data.activeDays.slice(-365);
    }
    saveGlobalActivity(data);
  }
};

/**
 * Calculate current global streak (consecutive days with ANY activity)
 */
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calculateGlobalStreak = (): number => {
  const data = getGlobalActivity();
  if (data.activeDays.length === 0) {
    return 0;
  }

  // Sort dates in descending order (newest first)
  const sortedDays = [...data.activeDays].sort((a, b) => b.localeCompare(a));
  
  const today = getTodayDate();
  const yesterdayStr = getYesterdayDate();

  // Streak must include today or yesterday to be active
  if (sortedDays[0] !== today && sortedDays[0] !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  let currentDate = parseLocalDate(sortedDays[0]);

  for (let i = 1; i < sortedDays.length; i++) {
    const expectedPrevDay = new Date(currentDate);
    expectedPrevDay.setDate(expectedPrevDay.getDate() - 1);
    const expectedPrevDayStr = formatLocalDate(expectedPrevDay);

    if (sortedDays[i] === expectedPrevDayStr) {
      streak++;
      currentDate = expectedPrevDay;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Get best global streak (longest consecutive streak ever)
 */
export const getBestGlobalStreak = (): number => {
  const data = getGlobalActivity();
  if (data.activeDays.length === 0) {
    return 0;
  }

  const sortedDays = [...data.activeDays].sort((a, b) => a.localeCompare(b));
  
  let maxStreak = 1;
  let currentStreak = 1;
  let currentDate = parseLocalDate(sortedDays[0]);

  for (let i = 1; i < sortedDays.length; i++) {
    const expectedNextDay = new Date(currentDate);
    expectedNextDay.setDate(expectedNextDay.getDate() + 1);
    const expectedNextDayStr = formatLocalDate(expectedNextDay);

    if (sortedDays[i] === expectedNextDayStr) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
      currentDate = expectedNextDay;
    } else {
      currentStreak = 1;
      currentDate = parseLocalDate(sortedDays[i]);
    }
  }

  return maxStreak;
};
