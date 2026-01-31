import { useState, useEffect, useCallback } from 'react';
import { Streak, StreakStats, StreakStatus } from '@/types/streak';
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

const STORAGE_KEY = 'streakflame_streaks';

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
  const [isLoading, setIsLoading] = useState(true);

  // Load streaks from localStorage
  useEffect(() => {
    const loadStreaks = () => {
      try {
        // Initialize action history (finalize old actions, cleanup)
        initializeActionHistory();
        
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Streak[];
          // Recalculate current streaks based on dates
          const updated = parsed.map(streak => recalculateStreak(streak));
          setStreaks(updated);
        }
      } catch (error) {
        console.error('Failed to load streaks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStreaks();
  }, []);

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
  const addStreak = useCallback((name: string, emoji: string, color?: string) => {
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
    };
    setStreaks(prev => [...prev, newStreak]);
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
    setStreaks(prev => prev.filter(streak => streak.id !== id));
  }, []);

  // Undo today's completion for a streak
  const undoStreak = useCallback((id: string): boolean => {
    const undoCheck = canUndoAction(id);
    
    if (!undoCheck.canUndo || !undoCheck.action) {
      console.warn('Cannot undo:', undoCheck.reason);
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
  const editStreak = useCallback((id: string, updates: Partial<Pick<Streak, 'name' | 'emoji' | 'color'>>) => {
    setStreaks(prev => prev.map(streak => 
      streak.id === id ? { ...streak, ...updates } : streak
    ));
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
    isLoading,
    addStreak,
    completeStreak,
    undoStreak,
    deleteStreak,
    editStreak,
    getStats,
    getStreakStatus,
    canUndoAction,
  };
};

// Re-export date utilities for backward compatibility
export { getTodayDate, getYesterdayDate, isToday, isYesterday } from '@/lib/dateUtils';

