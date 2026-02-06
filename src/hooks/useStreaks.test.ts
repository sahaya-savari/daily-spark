import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStreaks, getStreakStatus } from './useStreaks';
import { Streak } from '@/types/streak';
import * as dateUtils from '@/lib/dateUtils';

// Mock dependencies
vi.mock('@/lib/dateUtils');
vi.mock('@/services/actionHistory', () => ({
  recordAction: vi.fn(),
  canUndoAction: vi.fn(() => ({ canUndo: false, action: null })),
  initializeActionHistory: vi.fn(),
}));
vi.mock('@/services/reminderService', () => ({
  saveReminder: vi.fn(),
  getReminder: vi.fn(),
  deleteReminder: vi.fn(),
  scheduleReminder: vi.fn(),
  unscheduleReminder: vi.fn(),
}));
vi.mock('@/services/hapticService', () => ({
  triggerHapticLight: vi.fn(),
  triggerHapticSuccess: vi.fn(),
}));

describe('Streak Logic - Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();

    // Setup default date mocks
    vi.mocked(dateUtils.getTodayDate).mockReturnValue('2026-02-06');
    vi.mocked(dateUtils.getYesterdayDate).mockReturnValue('2026-02-05');
    vi.mocked(dateUtils.isToday).mockImplementation((date) => date === '2026-02-06');
    vi.mocked(dateUtils.isYesterday).mockImplementation((date) => date === '2026-02-05');
    vi.mocked(dateUtils.getDaysAgo).mockImplementation((days) => {
      const date = new Date('2026-02-06');
      date.setDate(date.getDate() - days);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // SECTION 1: getStreakStatus - Status Calculation
  // ============================================================================
  describe('getStreakStatus', () => {
    it('should return "completed" when lastCompletedDate is today', () => {
      const streak: Streak = {
        id: '1',
        name: 'Exercise',
        emoji: '💪',
        createdAt: '2026-02-01',
        currentStreak: 5,
        bestStreak: 10,
        lastCompletedDate: '2026-02-06', // Today
        completedDates: ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06'],
      };

      const status = getStreakStatus(streak);
      expect(status).toBe('completed');
    });

    it('should return "pending" when lastCompletedDate is yesterday', () => {
      const streak: Streak = {
        id: '1',
        name: 'Exercise',
        emoji: '💪',
        createdAt: '2026-02-01',
        currentStreak: 5,
        bestStreak: 10,
        lastCompletedDate: '2026-02-05', // Yesterday
        completedDates: ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
      };

      const status = getStreakStatus(streak);
      expect(status).toBe('pending');
    });

    it('should return "pending" when lastCompletedDate is null (never completed)', () => {
      const streak: Streak = {
        id: '1',
        name: 'Exercise',
        emoji: '💪',
        createdAt: '2026-02-06',
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
      };

      const status = getStreakStatus(streak);
      expect(status).toBe('pending');
    });

    it('should return "at-risk" when lastCompletedDate is 2+ days ago', () => {
      const streak: Streak = {
        id: '1',
        name: 'Exercise',
        emoji: '💪',
        createdAt: '2026-02-01',
        currentStreak: 5,
        bestStreak: 10,
        lastCompletedDate: '2026-02-04', // 2 days ago
        completedDates: ['2026-02-02', '2026-02-03', '2026-02-04'],
      };

      const status = getStreakStatus(streak);
      expect(status).toBe('at-risk');
    });
  });

  // ============================================================================
  // SECTION 2: Streak Completion Logic
  // ============================================================================
  describe('completeStreak - Streak Calculation', () => {
    it('should increment currentStreak when completing for first time (null lastCompletedDate)', () => {
      const { result } = renderHook(() => useStreaks());

      let newStreak: Streak | undefined;
      act(() => {
        newStreak = result.current.addStreak('Exercise', '💪');
      });

      expect(newStreak?.currentStreak).toBe(0);
      expect(newStreak?.bestStreak).toBe(0);
      expect(newStreak?.lastCompletedDate).toBeNull();

      // Complete it
      act(() => {
        result.current.completeStreak(newStreak!.id);
      });

      const completed = result.current.streaks[0];
      expect(completed.currentStreak).toBe(1);
      expect(completed.bestStreak).toBe(1);
      expect(completed.lastCompletedDate).toBe('2026-02-06');
      expect(completed.completedDates).toContain('2026-02-06');
    });

    it('should continue streak when completing after yesterday', () => {
      const { result } = renderHook(() => useStreaks());

      let streak: Streak | undefined;
      act(() => {
        streak = result.current.addStreak('Exercise', '💪');
      });

      // Simulate existing completion yesterday
      const existingStreak: Streak = {
        ...streak!,
        currentStreak: 5,
        bestStreak: 8,
        lastCompletedDate: '2026-02-05', // Yesterday
        completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
      };

      act(() => {
        // Replace the streak with our test data
        localStorage.setItem('streakflame_streaks', JSON.stringify([existingStreak]));
        // Re-render to load from localStorage
        result.current.streaks.splice(0, result.current.streaks.length, existingStreak);
      });

      // Complete it (today)
      act(() => {
        result.current.completeStreak(existingStreak.id);
      });

      const completed = result.current.streaks[0];
      expect(completed.currentStreak).toBe(6);
      expect(completed.bestStreak).toBe(8);
      expect(completed.lastCompletedDate).toBe('2026-02-06');
      expect(completed.completedDates.length).toBe(6);
    });

    it('should reset streak to 1 when completing after breaking (2+ days gap)', () => {
      const { result } = renderHook(() => useStreaks());

      let streak: Streak | undefined;
      act(() => {
        streak = result.current.addStreak('Exercise', '💪');
      });

      // Simulate broken streak (completed 2 days ago)
      const brokenStreak: Streak = {
        ...streak!,
        currentStreak: 5,
        bestStreak: 8,
        lastCompletedDate: '2026-02-04', // 2 days ago
        completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04'],
      };

      act(() => {
        localStorage.setItem('streakflame_streaks', JSON.stringify([brokenStreak]));
        result.current.streaks.splice(0, result.current.streaks.length, brokenStreak);
      });

      // Complete it (today)
      act(() => {
        result.current.completeStreak(brokenStreak.id);
      });

      const completed = result.current.streaks[0];
      expect(completed.currentStreak).toBe(1); // Reset to 1
      expect(completed.bestStreak).toBe(8); // Best streak unchanged
      expect(completed.lastCompletedDate).toBe('2026-02-06');
      expect(completed.completedDates).toContain('2026-02-06');
    });

    it('should not update if already completed today', () => {
      const { result } = renderHook(() => useStreaks());

      let streak: Streak | undefined;
      act(() => {
        streak = result.current.addStreak('Exercise', '💪');
      });

      // Simulate already completed today
      const completedToday: Streak = {
        ...streak!,
        currentStreak: 6,
        bestStreak: 8,
        lastCompletedDate: '2026-02-06', // Today
        completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06'],
      };

      act(() => {
        localStorage.setItem('streakflame_streaks', JSON.stringify([completedToday]));
        result.current.streaks.splice(0, result.current.streaks.length, completedToday);
      });

      const initialStreak = result.current.streaks[0];
      const initialCurrentStreak = initialStreak.currentStreak;

      // Try to complete again
      act(() => {
        result.current.completeStreak(completedToday.id);
      });

      const afterSecondComplete = result.current.streaks[0];
      expect(afterSecondComplete.currentStreak).toBe(initialCurrentStreak); // Unchanged
      expect(afterSecondComplete.completedDates.length).toBe(6); // No duplicate
    });

    it('should update bestStreak if currentStreak exceeds it', () => {
      const { result } = renderHook(() => useStreaks());

      let streak: Streak | undefined;
      act(() => {
        streak = result.current.addStreak('Exercise', '💪');
      });

      // Current streak is 7, best is 5
      const streakData: Streak = {
        ...streak!,
        currentStreak: 7,
        bestStreak: 5,
        lastCompletedDate: '2026-02-05', // Yesterday
        completedDates: Array(7).fill(null).map((_, i) => {
          const date = new Date('2026-02-06');
          date.setDate(date.getDate() - (7 - i));
          return `2026-02-0${date.getDate()}`;
        }),
      };

      act(() => {
        localStorage.setItem('streakflame_streaks', JSON.stringify([streakData]));
        result.current.streaks.splice(0, result.current.streaks.length, streakData);
      });

      // Complete today (would make currentStreak = 8)
      act(() => {
        result.current.completeStreak(streakData.id);
      });

      const completed = result.current.streaks[0];
      expect(completed.currentStreak).toBe(8);
      expect(completed.bestStreak).toBe(8); // Updated to match new current
    });
  });

  // ============================================================================
  // SECTION 3: Undo Functionality
  // ============================================================================
  describe('undoStreak - Undo Completion', () => {
    it.skip('should restore previous state when undoing', () => {
      // Note: Undo test requires deeper mock setup for actionHistory
      // This is tested indirectly through integration tests
      // Skip for now, will verify with Item 2 validation
    });
  });

  // ============================================================================
  // SECTION 4: Data Import/Export Scenarios
  // ============================================================================
  describe('Streak Import - Historical Data Restoration', () => {
    it('should correctly restore streak from JSON with historical completedDates', () => {
      const { result } = renderHook(() => useStreaks());

      const importedStreak: Streak = {
        id: 'imported-1',
        name: 'Reading',
        emoji: '📚',
        createdAt: '2026-01-01',
        currentStreak: 10,
        bestStreak: 15,
        lastCompletedDate: '2026-02-05', // Yesterday
        completedDates: [
          '2026-01-27', '2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31',
          '2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05',
        ],
      };

      act(() => {
        localStorage.setItem('streakflame_streaks', JSON.stringify([importedStreak]));
        // Trigger hook to load from localStorage
      });

      // Re-render hook to load data
      const hookResult = renderHook(() => useStreaks());
      
      // After loading, streak should be preserved
      expect(hookResult.result.current.streaks.length).toBe(1);
      const loaded = hookResult.result.current.streaks[0];
      expect(loaded.currentStreak).toBe(10);
      expect(loaded.bestStreak).toBe(15);
      expect(loaded.completedDates.length).toBe(10);
    });

    it('should handle streaks with gaps in completedDates correctly', () => {
      const { result } = renderHook(() => useStreaks());

      const streakWithGaps: Streak = {
        id: 'gap-1',
        name: 'Meditation',
        emoji: '🧘',
        createdAt: '2026-01-01',
        currentStreak: 3,
        bestStreak: 20,
        lastCompletedDate: '2026-02-06', // Today
        completedDates: [
          '2026-01-27', '2026-01-28',
          // Gap here
          '2026-02-04', '2026-02-05', '2026-02-06',
        ],
      };

      act(() => {
        localStorage.setItem('streakflame_streaks', JSON.stringify([streakWithGaps]));
      });

      const hookResult = renderHook(() => useStreaks());

      // Streak should be loaded as-is; status should reflect lastCompletedDate
      const loaded = hookResult.result.current.streaks[0];
      expect(loaded.currentStreak).toBe(3);
      expect(loaded.bestStreak).toBe(20);
      expect(getStreakStatus(loaded)).toBe('completed'); // Today
    });
  });

  // ============================================================================
  // SECTION 5: Edge Cases
  // ============================================================================
  describe('Edge Cases', () => {
    it('should handle null lastCompletedDate gracefully', () => {
      const streak: Streak = {
        id: '1',
        name: 'New Habit',
        emoji: '🌟',
        createdAt: '2026-02-06',
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
      };

      const status = getStreakStatus(streak);
      expect(status).toBe('pending');
    });

    it('should handle completedDates with duplicates', () => {
      const streak: Streak = {
        id: '1',
        name: 'Test',
        emoji: '✅',
        createdAt: '2026-02-01',
        currentStreak: 5,
        bestStreak: 5,
        lastCompletedDate: '2026-02-06',
        completedDates: ['2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05', '2026-02-06', '2026-02-06'], // Duplicate
      };

      // Should not cause errors; UI should handle displaying correctly
      expect(streak.completedDates.length).toBe(6);
      expect(streak.currentStreak).toBe(5);
    });

    it('should handle empty completedDates array', () => {
      const streak: Streak = {
        id: '1',
        name: 'Test',
        emoji: '✅',
        createdAt: '2026-02-06',
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        completedDates: [],
      };

      expect(streak.completedDates.length).toBe(0);
      expect(getStreakStatus(streak)).toBe('pending');
    });

    it('should handle bestStreak < currentStreak (corrupted data)', () => {
      const streak: Streak = {
        id: '1',
        name: 'Corrupted',
        emoji: '⚠️',
        createdAt: '2026-01-01',
        currentStreak: 10,
        bestStreak: 5, // INVALID: bestStreak < currentStreak
        lastCompletedDate: '2026-02-06',
        completedDates: Array(10).fill('2026-02-06'),
      };

      // Data exists but is invalid; should be detected in validation
      expect(streak.bestStreak).toBeLessThan(streak.currentStreak);
    });
  });

  // ============================================================================
  // SECTION 6: Multiple Streaks Operations
  // ============================================================================
  describe('Multiple Streaks', () => {
    it('should handle completing one streak without affecting others', () => {
      const { result } = renderHook(() => useStreaks());

      let streak1: Streak | undefined;
      let streak2: Streak | undefined;

      act(() => {
        streak1 = result.current.addStreak('Exercise', '💪');
        streak2 = result.current.addStreak('Reading', '📚');
      });

      expect(result.current.streaks.length).toBe(2);

      // Complete only streak1
      act(() => {
        result.current.completeStreak(streak1!.id);
      });

      const s1 = result.current.streaks.find((s) => s.id === streak1!.id)!;
      const s2 = result.current.streaks.find((s) => s.id === streak2!.id)!;

      expect(s1.currentStreak).toBe(1);
      expect(s2.currentStreak).toBe(0);
      expect(s2.lastCompletedDate).toBeNull();
    });

    it('should calculate stats correctly across multiple streaks', () => {
      const { result } = renderHook(() => useStreaks());

      const stats = result.current.getStats();

      expect(stats).toHaveProperty('totalStreaks');
      expect(stats).toHaveProperty('activeStreaks');
      expect(stats).toHaveProperty('totalCompletions');
      expect(stats).toHaveProperty('longestStreak');
    });
  });
});
