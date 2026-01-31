/**
 * Action History Manager
 * 
 * Manages the day-long undo system for streak actions.
 * - Stores all actions with their previous state
 * - Automatically finalizes actions when the day changes
 * - Provides undo/redo functionality
 * - Persists to localStorage
 * 
 * Key Principles:
 * 1. Actions done TODAY are reversible
 * 2. Actions from YESTERDAY+ are finalized (permanent)
 * 3. Uses LOCAL timezone only (no UTC bugs)
 * 4. Works offline, survives app restart
 */

import { DailyAction, ActionType, UndoAvailability } from '@/types/action';
import { getTodayDate } from '@/lib/dateUtils';

const ACTIONS_STORAGE_KEY = 'streakflame_action_history';
const MAX_HISTORY_DAYS = 7; // Keep history for cleanup/debugging

/**
 * Load all actions from localStorage
 */
const loadActions = (): DailyAction[] => {
  try {
    const stored = localStorage.getItem(ACTIONS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as DailyAction[];
    }
  } catch (error) {
    console.error('Failed to load action history:', error);
  }
  return [];
};

/**
 * Save all actions to localStorage
 */
const saveActions = (actions: DailyAction[]): void => {
  try {
    localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Failed to save action history:', error);
  }
};

/**
 * Generate unique action ID
 */
const generateActionId = (): string => {
  return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Record a new action
 * This is called whenever a user completes or uncompletes a streak.
 */
export const recordAction = (
  type: ActionType,
  streakId: string,
  previousState: DailyAction['previousState']
): DailyAction => {
  const today = getTodayDate();
  
  const action: DailyAction = {
    id: generateActionId(),
    type,
    streakId,
    date: today,
    timestamp: new Date().toISOString(),
    finalized: false, // Today's actions are reversible
    previousState,
  };
  
  const actions = loadActions();
  actions.push(action);
  saveActions(actions);
  
  return action;
};

/**
 * Get the most recent action for a streak on a specific date
 */
export const getLastActionForStreak = (
  streakId: string,
  date: string
): DailyAction | null => {
  const actions = loadActions();
  
  // Filter to this streak and date, sort by timestamp descending
  const relevantActions = actions
    .filter(a => a.streakId === streakId && a.date === date)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  
  return relevantActions[0] || null;
};

/**
 * Check if an action can be undone
 */
export const canUndoAction = (streakId: string): UndoAvailability => {
  const today = getTodayDate();
  const action = getLastActionForStreak(streakId, today);
  
  if (!action) {
    return { canUndo: false, reason: 'no-action' };
  }
  
  if (action.finalized) {
    return { canUndo: false, reason: 'already-finalized', action };
  }
  
  if (action.date !== today) {
    return { canUndo: false, reason: 'not-today', action };
  }
  
  return { canUndo: true, action };
};

/**
 * Finalize all actions from previous days
 * This is called on app initialization to make yesterday's actions permanent.
 */
export const finalizeOldActions = (): number => {
  const today = getTodayDate();
  const actions = loadActions();
  
  let finalizedCount = 0;
  
  const updatedActions = actions.map(action => {
    // If action is from a previous day and not finalized, finalize it
    if (action.date < today && !action.finalized) {
      finalizedCount++;
      return { ...action, finalized: true };
    }
    return action;
  });
  
  if (finalizedCount > 0) {
    saveActions(updatedActions);
    console.log(`Finalized ${finalizedCount} actions from previous days`);
  }
  
  return finalizedCount;
};

/**
 * Clean up old action history
 * Removes actions older than MAX_HISTORY_DAYS to prevent localStorage bloat.
 */
export const cleanupOldActions = (): number => {
  const today = getTodayDate();
  const actions = loadActions();
  
  // Calculate cutoff date
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_HISTORY_DAYS);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
  
  const filteredActions = actions.filter(action => action.date >= cutoffDateStr);
  const removedCount = actions.length - filteredActions.length;
  
  if (removedCount > 0) {
    saveActions(filteredActions);
    console.log(`Cleaned up ${removedCount} old actions`);
  }
  
  return removedCount;
};

/**
 * Get all actions for today (for debugging/display)
 */
export const getTodayActions = (): DailyAction[] => {
  const today = getTodayDate();
  const actions = loadActions();
  return actions.filter(a => a.date === today);
};

/**
 * Initialize the action history system
 * Called on app startup to finalize old actions and clean up history.
 */
export const initializeActionHistory = (): void => {
  finalizeOldActions();
  cleanupOldActions();
};
