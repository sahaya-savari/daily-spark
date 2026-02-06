import { useState, useEffect, useCallback } from 'react';
import { Streak, StreakStats, StreakStatus, StreakList, DEFAULT_LIST_ID, DEFAULT_LIST } from '@/types/streak';
import { Reminder } from '@/types/reminder';
import { 
  getTodayDate, 
  getYesterdayDate, 
  getDaysAgo, 
  isToday, 
  isYesterday 
} from '@/lib/dateUtils';
import { 
  recordAction, 
  canUndoAction, 
  initializeActionHistory 
} from '@/services/actionHistory';
import {
  saveReminder,
  getReminder,
  deleteReminder,
  scheduleReminder,
  unscheduleReminder,
} from '@/services/reminderService';
import { triggerHapticLight, triggerHapticSuccess } from '@/services/hapticService';
import { recoverStreaksOnBoot } from '@/services/dataRecoveryService';

const STORAGE_KEY = 'streakflame_streaks';
const LISTS_STORAGE_KEY = 'streakflame_lists';

// Get streak status
export const getStreakStatus = (streak: Streak): StreakStatus => {
  if (isToday(streak.lastCompletedDate)) {
    return 'completed';
  }
  if (isYesterday(streak.lastCompletedDate) || streak.lastCompletedDate === null) {
    return 'pending';
  }
  return 'at-risk';
};

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useStreaks = () => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [lists, setLists] = useState<StreakList[]>([DEFAULT_LIST]);
  const [isLoading, setIsLoading] = useState(true);
  const [recoveryResult, setRecoveryResult] = useState<{
    recovered: boolean;
    message: string;
    reason?: string;
  } | null>(null);

  // Load streaks and lists from localStorage with safe recovery
  useEffect(() => {
    const loadStreaks = () => {
      try {
        // Initialize action history (finalize old actions, cleanup)
        initializeActionHistory();
        
        // Load or initialize lists
        const storedLists = localStorage.getItem(LISTS_STORAGE_KEY);
        if (storedLists) {
          setLists(JSON.parse(storedLists) as StreakList[]);
        } else {
          setLists([DEFAULT_LIST]);
          localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify([DEFAULT_LIST]));
        }
        
        // ✅ USE RECOVERY SERVICE: Never crashes, always returns valid data
        const recovery = recoverStreaksOnBoot();
        
        // Set recovery info (for UI to show if recovery happened)
        if (recovery.recovered) {
          setRecoveryResult({
            recovered: true,
            message: recovery.message,
            reason: recovery.reason,
          });
        }
        
        // Process recovered streaks
        const migrated = recovery.streaks.map(streak => ({
          ...streak,
          listId: streak.listId || DEFAULT_LIST_ID,
        }));
        
        // Recalculate current streaks based on dates
        const updated = migrated.map(streak => recalculateStreak(streak));
        setStreaks(updated);
      } catch (error) {
        console.error('[useStreaks] Unexpected error during load:', error);
        // Fail-safe: boot with empty data rather than crash
        setStreaks([]);
        setRecoveryResult({
          recovered: true,
          message: '⚠️  An unexpected error occurred. Starting fresh.',
          reason: 'error_recovery',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadStreaks();
  }, []);

  // Save lists to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists, isLoading]);

  // Save streaks to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streaks));
    }
  }, [streaks, isLoading]);

  // Recalculate streak count based on completion history
  const recalculateStreak = (streak: Streak): Streak => {
    const today = getTodayDate();
    const yesterday = getYesterdayDate();
    
    // If never completed, streak is 0
    if (!streak.lastCompletedDate) {
      return { ...streak, currentStreak: 0 };
    }
    
    // If completed today, streak is valid
    if (streak.lastCompletedDate === today) {
      return streak;
    }
    
    // If completed yesterday, streak is still valid (waiting for today)
    if (streak.lastCompletedDate === yesterday) {
      return streak;
    }
    
    // Otherwise, streak is broken - reset to 0
    return { ...streak, currentStreak: 0 };
  };

  // Add a new streak
  const addStreak = useCallback((name: string, emoji: string, reminder?: Reminder, color?: string, description?: string, listId?: string) => {
    const newStreak: Streak = {
      id: generateId(),
      name,
      emoji,
      createdAt: getTodayDate(),
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completedDates: [],
      color,
      description,
      listId: listId || DEFAULT_LIST_ID,
      isStarred: false,
    };
    setStreaks(prev => [...prev, newStreak]);
    
    if (reminder && reminder.enabled) {
      saveReminder(newStreak.id, reminder);
      scheduleReminder(
        newStreak.id,
        name,
        emoji,
        reminder,
        () => {}
      );
    }
    
    return newStreak;
  }, []);

  // Complete a streak for today
  const completeStreak = useCallback((id: string): boolean => {
    const today = getTodayDate();
    let wasCompleted = false;
    
    setStreaks(prev => prev.map(streak => {
      if (streak.id !== id) return streak;
      
      // Already completed today - do nothing
      if (streak.lastCompletedDate === today) {
        return streak;
      }
      
      wasCompleted = true;
      triggerHapticSuccess(); // Haptic feedback on completion
      
      const yesterday = getYesterdayDate();
      
      // RECORD ACTION: Save current state before modifying
      recordAction('complete', streak.id, {
        currentStreak: streak.currentStreak,
        lastCompletedDate: streak.lastCompletedDate,
        completedDates: [...streak.completedDates],
        bestStreak: streak.bestStreak,
      });
      
      // Calculate new streak count
      let newCurrentStreak: number;
      if (streak.lastCompletedDate === yesterday || streak.lastCompletedDate === null) {
        // Continue or start streak
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        // Streak was broken, start fresh
        newCurrentStreak = 1;
      }
      
      const newBestStreak = Math.max(streak.bestStreak, newCurrentStreak);
      
      return {
        ...streak,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: today,
        completedDates: [...streak.completedDates, today],
      };
    }));
    
    return wasCompleted;
  }, []);

  // Delete a streak
  const deleteStreak = useCallback((id: string) => {
    unscheduleReminder(id);
    deleteReminder(id);
    setStreaks(prev => prev.filter(streak => streak.id !== id));
  }, []);

  // Undo today's completion for a streak
  const undoStreak = useCallback((id: string): boolean => {
    const undoCheck = canUndoAction(id);
    
    if (!undoCheck.canUndo || !undoCheck.action) {
      return false;
    }
    
    const { action } = undoCheck;
    
    // Restore the previous state
    setStreaks(prev => prev.map(streak => {
      if (streak.id !== id) return streak;
      
      // RECORD UNDO: Record this as an uncomplete action
      recordAction('uncomplete', streak.id, {
        currentStreak: streak.currentStreak,
        lastCompletedDate: streak.lastCompletedDate,
        completedDates: [...streak.completedDates],
        bestStreak: streak.bestStreak,
      });
      
      return {
        ...streak,
        currentStreak: action.previousState.currentStreak,
        lastCompletedDate: action.previousState.lastCompletedDate,
        completedDates: [...action.previousState.completedDates],
        bestStreak: action.previousState.bestStreak,
      };
    }));
    
    return true;
  }, []);

  // Edit a streak
  const editStreak = useCallback((id: string, updates: Partial<Pick<Streak, 'name' | 'emoji' | 'color' | 'notes' | 'description' | 'isStarred' | 'listId' | 'scheduledDate' | 'scheduledTime' | 'fontSize' | 'textAlign'>>) => {
    setStreaks(prev => prev.map(streak => 
      streak.id === id ? { ...streak, ...updates } : streak
    ));
  }, []);

  // Toggle star on a streak
  const toggleStar = useCallback((id: string) => {
    setStreaks(prev => prev.map(streak =>
      streak.id === id ? { ...streak, isStarred: !streak.isStarred } : streak
    ));
  }, []);

  // Move streak to different list
  const moveStreakToList = useCallback((id: string, newListId: string) => {
    setStreaks(prev => prev.map(streak =>
      streak.id === id ? { ...streak, listId: newListId } : streak
    ));
  }, []);

  // Create a new list
  const createList = useCallback((name: string, color: string) => {
    const newList: StreakList = {
      id: generateId(),
      name,
      color,
      createdAt: getTodayDate(),
    };
    setLists(prev => [...prev, newList]);
    return newList;
  }, []);

  // Rename a list
  const renameList = useCallback((id: string, newName: string) => {
    setLists(prev => prev.map(list =>
      list.id === id ? { ...list, name: newName } : list
    ));
  }, []);

  // Delete a list and move all streaks to default list
  const deleteList = useCallback((id: string) => {
    if (id === DEFAULT_LIST_ID) return; // Cannot delete default list
    setStreaks(prev => prev.map(streak =>
      streak.listId === id ? { ...streak, listId: DEFAULT_LIST_ID } : streak
    ));
    setLists(prev => prev.filter(list => list.id !== id));
  }, []);

  // Get stats
  const getStats = useCallback((): StreakStats => {
    const today = getTodayDate();
    const activeStreaks = streaks.filter(s => getStreakStatus(s) !== 'at-risk').length;
    const totalCompletions = streaks.reduce((sum, s) => sum + s.completedDates.length, 0);
    const longestStreak = Math.max(0, ...streaks.map(s => s.bestStreak));
    
    // Calculate weekly completion rate
    const weekAgoStr = getDaysAgo(7);
    
    const weeklyCompletions = streaks.reduce((sum, s) => {
      return sum + s.completedDates.filter(d => d >= weekAgoStr).length;
    }, 0);
    const possibleWeeklyCompletions = streaks.length * 7;
    const weeklyCompletionRate = possibleWeeklyCompletions > 0 
      ? Math.round((weeklyCompletions / possibleWeeklyCompletions) * 100) 
      : 0;
    
    // Calculate monthly completion rate
    const monthAgoStr = getDaysAgo(30);
    
    const monthlyCompletions = streaks.reduce((sum, s) => {
      return sum + s.completedDates.filter(d => d >= monthAgoStr).length;
    }, 0);
    const possibleMonthlyCompletions = streaks.length * 30;
    const monthlyCompletionRate = possibleMonthlyCompletions > 0 
      ? Math.round((monthlyCompletions / possibleMonthlyCompletions) * 100) 
      : 0;
    
    return {
      totalStreaks: streaks.length,
      activeStreaks,
      totalCompletions,
      longestStreak,
      weeklyCompletionRate,
      monthlyCompletionRate,
    };
  }, [streaks]);

  return {
    streaks,
    lists,
    isLoading,
    recoveryResult,
    addStreak,
    completeStreak,
    undoStreak,
    deleteStreak,
    editStreak,
    toggleStar,
    moveStreakToList,
    createList,
    renameList,
    deleteList,
    getStats,
    getStreakStatus,
    canUndoAction,
    getReminder,
    saveReminder,
  };
};

export { getTodayDate, getYesterdayDate, isToday, isYesterday } from '@/lib/dateUtils';

