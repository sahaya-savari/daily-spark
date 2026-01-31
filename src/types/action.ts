/**
 * Types for the day-long undo system.
 * 
 * Actions are stored with their previous state, allowing full rollback.
 * Actions remain reversible until the day changes (local midnight).
 */

export type ActionType = 'complete' | 'uncomplete';

/**
 * Represents a single user action on a streak.
 * This is the core of the undo system.
 */
export interface DailyAction {
  /** Unique identifier for this action */
  id: string;
  
  /** Type of action performed */
  type: ActionType;
  
  /** ID of the streak this action applies to */
  streakId: string;
  
  /** Date when action was performed (YYYY-MM-DD in local timezone) */
  date: string;
  
  /** Timestamp when action was performed (for ordering) */
  timestamp: string;
  
  /** Whether this action has been finalized (cannot be undone) */
  finalized: boolean;
  
  /** State of the streak before this action was applied */
  previousState: {
    currentStreak: number;
    lastCompletedDate: string | null;
    completedDates: string[];
    bestStreak: number;
  };
}

/**
 * Result of checking if an action can be undone
 */
export interface UndoAvailability {
  canUndo: boolean;
  reason?: 'not-today' | 'already-finalized' | 'no-action';
  action?: DailyAction;
}
