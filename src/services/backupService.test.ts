import { describe, it, expect } from 'vitest';
import { validateAndCleanStreaks, restoreStreaksFromJson } from '@/services/backupService';

describe('BackupService - Validation Integration', () => {
  describe('validateAndCleanStreaks', () => {
    it('should accept valid streaks', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        },
      ];

      const result = validateAndCleanStreaks(data);
      expect(result.streaks.length).toBe(1);
      expect(result.hasErrors).toBe(false);
    });

    it('should skip invalid streaks with error flag', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        },
        {
          id: 'streak-2',
          name: '', // Invalid
          emoji: '📚',
          createdAt: '2026-01-15',
          currentStreak: 3,
          bestStreak: 10,
          lastCompletedDate: '2026-02-06',
          completedDates: [],
        },
      ];

      const result = validateAndCleanStreaks(data);
      expect(result.streaks.length).toBe(1);
      expect(result.hasErrors).toBe(true);
    });

    it('should detect corrupted data', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Corrupted',
          emoji: '⚠️',
          createdAt: '2026-01-01',
          currentStreak: 10,
          bestStreak: 5, // Corrupted
          lastCompletedDate: '2026-02-06',
          completedDates: [],
        },
      ];

      const result = validateAndCleanStreaks(data);
      expect(result.streaks.length).toBe(0);
      expect(result.hasErrors).toBe(true);
    });
  });

  describe('restoreStreaksFromJson', () => {
    it('should return valid restore result', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        },
      ];

      const result = restoreStreaksFromJson(data);
      expect(result.success).toBeDefined();
      expect(result.streaks).toBeDefined();
      expect(result.message).toBeDefined();
    });

    it('should handle partial import', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        },
        { id: '', name: 'Invalid' },
      ];

      const result = restoreStreaksFromJson(data);
      expect(result.success).toBe(true);
      expect(result.streaks.length).toBe(1);
    });

    it('should reject all if strict mode and any invalid', () => {
      const data = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        },
        { id: '', name: 'Invalid' },
      ];

      const result = restoreStreaksFromJson(data, false);
      expect(result.success).toBe(false);
    });

    it('should never crash on invalid input', () => {
      const result = restoreStreaksFromJson({ notStreaks: true });
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('should handle empty data', () => {
      const result = restoreStreaksFromJson([]);
      expect(result.success).toBe(true);
      expect(result.streaks.length).toBe(0);
    });
  });
});
