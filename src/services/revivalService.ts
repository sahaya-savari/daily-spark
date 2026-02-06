/**
 * BUG FIX 5: Streak Revival Service
 * 
 * Simple local recovery system to prevent harsh streak loss
 * - Limited revival points (default: 5)
 * - 1 point revives 1 failed streak
 * - Local-first, no backend
 */

import { formatLocalDate } from '@/lib/dateUtils';

const REVIVAL_POINTS_KEY = 'streakflame_revival_points';
const DEFAULT_REVIVAL_POINTS = 5;

export interface RevivalData {
  points: number;
  lastReset: string; // ISO date
}

/**
 * Get current revival points
 */
export const getRevivalPoints = (): number => {
  try {
    const stored = localStorage.getItem(REVIVAL_POINTS_KEY);
    if (!stored) {
      // Initialize with default points
      initializeRevivalPoints();
      return DEFAULT_REVIVAL_POINTS;
    }
    const data = JSON.parse(stored) as RevivalData;
    return data.points ?? DEFAULT_REVIVAL_POINTS;
  } catch (error) {
    console.error('[Revival] Failed to load points:', error);
    return DEFAULT_REVIVAL_POINTS;
  }
};

/**
 * Initialize revival points (first time or reset)
 */
export const initializeRevivalPoints = (): void => {
  const data: RevivalData = {
    points: DEFAULT_REVIVAL_POINTS,
    lastReset: formatLocalDate(new Date()),
  };
  try {
    localStorage.setItem(REVIVAL_POINTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[Revival] Failed to initialize points:', error);
  }
};

/**
 * Use one revival point
 * @returns true if point was used, false if no points available
 */
export const useRevivalPoint = (): boolean => {
  try {
    const stored = localStorage.getItem(REVIVAL_POINTS_KEY);
    if (!stored) {
      initializeRevivalPoints();
    }
    
    const data = JSON.parse(localStorage.getItem(REVIVAL_POINTS_KEY) || '{}') as RevivalData;
    
    if (data.points <= 0) {
      return false;
    }
    
    data.points -= 1;
    localStorage.setItem(REVIVAL_POINTS_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('[Revival] Failed to use point:', error);
    return false;
  }
};

/**
 * Check if revival is available
 */
export const hasRevivalPoints = (): boolean => {
  return getRevivalPoints() > 0;
};

/**
 * Get full revival data (for display)
 */
export const getRevivalData = (): RevivalData => {
  try {
    const stored = localStorage.getItem(REVIVAL_POINTS_KEY);
    if (!stored) {
      initializeRevivalPoints();
      return {
        points: DEFAULT_REVIVAL_POINTS,
        lastReset: formatLocalDate(new Date()),
      };
    }
    return JSON.parse(stored) as RevivalData;
  } catch (error) {
    console.error('[Revival] Failed to load data:', error);
    return {
      points: DEFAULT_REVIVAL_POINTS,
      lastReset: formatLocalDate(new Date()),
    };
  }
};

/**
 * Restore a specific number of points (admin/debug)
 */
export const restoreRevivalPoints = (count: number): void => {
  try {
    const data = getRevivalData();
    data.points = Math.min(count, DEFAULT_REVIVAL_POINTS);
    localStorage.setItem(REVIVAL_POINTS_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('[Revival] Failed to restore points:', error);
  }
};
