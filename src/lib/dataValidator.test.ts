import { describe, it, expect } from 'vitest';
import {
  validateStreak,
  validateBackupData,
  isValidDateFormat,
  formatValidationMessage,
} from './dataValidator';
import { Streak } from '@/types/streak';

describe('Data Validator - JSON Import Validation', () => {
  // ============================================================================
  // SECTION 1: Date Format Validation
  // ============================================================================
  describe('isValidDateFormat', () => {
    it('should accept valid YYYY-MM-DD dates', () => {
      expect(isValidDateFormat('2026-02-06')).toBe(true);
      expect(isValidDateFormat('2025-01-01')).toBe(true);
      expect(isValidDateFormat('2026-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateFormat('02-06-2026')).toBe(false); // Wrong order
      expect(isValidDateFormat('2026/02/06')).toBe(false); // Wrong separator
      expect(isValidDateFormat('2026-2-6')).toBe(false); // Missing leading zero
      expect(isValidDateFormat('06-02-2026')).toBe(false);
    });

    it('should reject invalid dates', () => {
      expect(isValidDateFormat('2026-02-30')).toBe(false); // Feb 30 doesn't exist
      expect(isValidDateFormat('2026-13-01')).toBe(false); // Month 13
      expect(isValidDateFormat('2026-02-00')).toBe(false); // Day 0
    });

    it('should reject null/undefined', () => {
      expect(isValidDateFormat(null as unknown as string)).toBe(false);
      expect(isValidDateFormat(undefined as unknown as string)).toBe(false);
      expect(isValidDateFormat('')).toBe(false);
    });
  });

  // ============================================================================
  // SECTION 2: Single Streak Validation
  // ============================================================================
  describe('validateStreak - Required Fields', () => {
    const validStreak = {
      id: 'streak-1',
      name: 'Exercise',
      emoji: '💪',
      createdAt: '2026-02-01',
      currentStreak: 5,
      bestStreak: 8,
      lastCompletedDate: '2026-02-05',
      completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
    };

    it('should accept valid streak', () => {
      const result = validateStreak(validStreak);
      expect(result.valid).toBe(true);
      expect(result.cleaned).toBeDefined();
    });

    it('should reject missing ID', () => {
      const invalid = { ...validStreak, id: '' };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('id');
      expect(result.error?.message).toContain('Missing or invalid Streak ID');
    });

    it('should reject missing name', () => {
      const invalid = { ...validStreak, name: null };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('name');
      expect(result.error?.message).toContain('Missing streak name');
    });

    it('should reject missing emoji', () => {
      const invalid = { ...validStreak, emoji: '' };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('emoji');
      expect(result.error?.message).toContain('Missing emoji');
    });

    it('should reject invalid createdAt', () => {
      const invalid = { ...validStreak, createdAt: '02-01-2026' };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('createdAt');
      expect(result.error?.message).toContain('Invalid creation date');
    });

    it('should reject missing createdAt', () => {
      const invalid = { ...validStreak, createdAt: null };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('createdAt');
      expect(result.error?.message).toContain('Missing creation date');
    });

    it('should reject negative currentStreak', () => {
      const invalid = { ...validStreak, currentStreak: -1 };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('currentStreak');
      expect(result.error?.message).toContain('Invalid current streak');
    });

    it('should reject negative bestStreak', () => {
      const invalid = { ...validStreak, bestStreak: -5 };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('bestStreak');
    });

    it('should reject non-array completedDates', () => {
      const invalid = { ...validStreak, completedDates: '2026-02-01' };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('completedDates');
    });
  });

  // ============================================================================
  // SECTION 3: Data Integrity Checks
  // ============================================================================
  describe('validateStreak - Data Integrity', () => {
    const validStreak = {
      id: 'streak-1',
      name: 'Exercise',
      emoji: '💪',
      createdAt: '2026-02-01',
      currentStreak: 5,
      bestStreak: 8,
      lastCompletedDate: '2026-02-05',
      completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
    };

    it('should reject bestStreak < currentStreak (corrupted data)', () => {
      const corrupted = { ...validStreak, currentStreak: 10, bestStreak: 5 };
      const result = validateStreak(corrupted);
      expect(result.valid).toBe(false);
      expect(result.error?.message).toContain('Corrupted streak data');
      expect(result.error?.detail).toContain('streak');
    });

    it('should reject invalid lastCompletedDate format', () => {
      const invalid = { ...validStreak, lastCompletedDate: '02-05-2026' };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('lastCompletedDate');
      expect(result.error?.message).toContain('Invalid last completed date format');
    });

    it('should accept null lastCompletedDate', () => {
      const valid = { ...validStreak, lastCompletedDate: null };
      const result = validateStreak(valid);
      expect(result.valid).toBe(true);
      expect(result.cleaned?.lastCompletedDate).toBeNull();
    });

    it('should reject invalid dates in completedDates array', () => {
      const invalid = {
        ...validStreak,
        completedDates: ['2026-02-01', 'invalid-date', '2026-02-03'],
      };
      const result = validateStreak(invalid);
      expect(result.valid).toBe(false);
      expect(result.error?.field).toBe('completedDates');
      expect(result.error?.message).toContain('Invalid dates in completion history');
    });

    it('should accept empty completedDates array', () => {
      const valid = {
        ...validStreak,
        completedDates: [],
        currentStreak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
      };
      const result = validateStreak(valid);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 4: Optional Fields (Graceful Fallback)
  // ============================================================================
  describe('validateStreak - Optional Fields', () => {
    const minimalStreak = {
      id: 'streak-1',
      name: 'Exercise',
      emoji: '💪',
      createdAt: '2026-02-01',
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      completedDates: [],
    };

    it('should clean and provide defaults for optional fields', () => {
      const result = validateStreak(minimalStreak);
      expect(result.valid).toBe(true);
      expect(result.cleaned?.color).toBeUndefined();
      expect(result.cleaned?.notes).toBeUndefined();
      expect(result.cleaned?.isPaused).toBe(false);
      expect(result.cleaned?.isStarred).toBe(false);
    });

    it('should include optional fields when valid', () => {
      const full = {
        ...minimalStreak,
        color: 'blue',
        notes: 'Some notes',
        isPaused: true,
        isStarred: true,
        description: 'A description',
        listId: 'list-1',
      };
      const result = validateStreak(full);
      expect(result.valid).toBe(true);
      expect(result.cleaned?.color).toBe('blue');
      expect(result.cleaned?.notes).toBe('Some notes');
      expect(result.cleaned?.isPaused).toBe(true);
      expect(result.cleaned?.isStarred).toBe(true);
      expect(result.cleaned?.description).toBe('A description');
      expect(result.cleaned?.listId).toBe('list-1');
    });

    it('should skip invalid optional fields', () => {
      const withInvalid = {
        ...minimalStreak,
        color: 123, // Should be string
        fontSize: 'huge', // Should be small|medium|large
        scheduledDate: 'invalid-date', // Should be YYYY-MM-DD
      };
      const result = validateStreak(withInvalid);
      expect(result.valid).toBe(true);
      expect(result.cleaned?.color).toBeUndefined(); // Skipped invalid
      expect(result.cleaned?.fontSize).toBeUndefined();
      expect(result.cleaned?.scheduledDate).toBeUndefined();
    });
  });

  // ============================================================================
  // SECTION 5: Batch Validation (Multiple Streaks)
  // ============================================================================
  describe('validateBackupData - Batch Import', () => {
    it('should validate array of streaks', () => {
      const streaks = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
        },
        {
          id: 'streak-2',
          name: 'Reading',
          emoji: '📚',
          createdAt: '2026-01-15',
          currentStreak: 3,
          bestStreak: 10,
          lastCompletedDate: '2026-02-06',
          completedDates: ['2026-02-04', '2026-02-05', '2026-02-06'],
        },
      ];

      const result = validateBackupData(streaks);
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
      expect(result.summary.invalid).toBe(0);
      expect(result.streaks.length).toBe(2);
      expect(result.errors.length).toBe(0);
    });

    it('should skip invalid streaks and report errors', () => {
      const streaks = [
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
        },
        {
          id: 'streak-2',
          name: '', // Invalid: empty name
          emoji: '📚',
          createdAt: '2026-01-15',
          currentStreak: 3,
          bestStreak: 10,
          lastCompletedDate: '2026-02-06',
          completedDates: [],
        },
        {
          id: 'streak-3',
          name: 'Meditation',
          emoji: '🧘',
          createdAt: '2026-01-20',
          currentStreak: 10,
          bestStreak: 5, // Invalid: bestStreak < currentStreak
          lastCompletedDate: '2026-02-06',
          completedDates: Array(10).fill('2026-02-06'),
        },
      ];

      const result = validateBackupData(streaks);
      expect(result.summary.total).toBe(3);
      expect(result.summary.valid).toBe(1);
      expect(result.summary.invalid).toBe(2);
      expect(result.streaks.length).toBe(1);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle backup object format', () => {
      const backup = {
        version: '1.0.0',
        exportDate: '2026-02-06T12:00:00Z',
        data: {
          streakflame_streaks: [
            {
              id: 'streak-1',
              name: 'Exercise',
              emoji: '💪',
              createdAt: '2026-02-01',
              currentStreak: 5,
              bestStreak: 8,
              lastCompletedDate: '2026-02-05',
              completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
            },
          ],
        },
      };

      const result = validateBackupData(backup);
      expect(result.summary.valid).toBe(1);
      expect(result.streaks.length).toBe(1);
    });

    it('should handle empty backup', () => {
      const result = validateBackupData([]);
      expect(result.summary.total).toBe(0);
      expect(result.summary.valid).toBe(0);
      expect(result.streaks.length).toBe(0);
    });

    it('should reject invalid backup format', () => {
      const result = validateBackupData({ notStreaks: true });
      expect(result.streaks.length).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Invalid backup file format');
    });
  });

  // ============================================================================
  // SECTION 6: User-Facing Messages
  // ============================================================================
  describe('formatValidationMessage - User Display', () => {
    it('should show success message for valid import', () => {
      const result = validateBackupData([
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
        },
      ]);

      const message = formatValidationMessage(result);
      expect(message).toContain('✅');
      expect(message).toContain('All 1 streak');
    });

    it('should show recovery summary for partial import', () => {
      const result = validateBackupData([
        {
          id: 'streak-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
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
      ]);

      const message = formatValidationMessage(result);
      expect(message).toContain('✅ Loaded 1 streak');
      expect(message).toContain('⚠️ Skipped 1 invalid streak');
      expect(message).toContain('Errors:');
    });

    it('should limit error display to first 3', () => {
      const streaks = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `streak-${i}`,
          name: '', // All invalid
          emoji: '💪',
          createdAt: '2026-02-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: [],
        }));

      const result = validateBackupData(streaks);
      const message = formatValidationMessage(result);

      expect(message).toContain('⚠️ Skipped 10 invalid streaks');
      expect(message).toContain('...and 7 more errors');
    });
  });

  // ============================================================================
  // SECTION 7: Real-World Scenarios
  // ============================================================================
  describe('Real-World Scenarios', () => {
    it('should handle export from older app version with missing fields', () => {
      // Old format might not have all new fields
      const oldFormat = [
        {
          id: 'old-1',
          name: 'Exercise',
          emoji: '💪',
          createdAt: '2026-01-01',
          currentStreak: 5,
          bestStreak: 8,
          lastCompletedDate: '2026-02-05',
          completedDates: ['2026-02-01', '2026-02-02', '2026-02-03', '2026-02-04', '2026-02-05'],
          // Missing: isPaused, isStarred, listId, etc.
        },
      ];

      const result = validateBackupData(oldFormat);
      expect(result.summary.valid).toBe(1);
      expect(result.streaks[0].isPaused).toBe(false); // Gets default
      expect(result.streaks[0].isStarred).toBe(false);
    });

    it('should recover from accidentally corrupted completedDates', () => {
      const corrupted = {
        id: 'streak-1',
        name: 'Exercise',
        emoji: '💪',
        createdAt: '2026-02-01',
        currentStreak: 5,
        bestStreak: 8,
        lastCompletedDate: '2026-02-05',
        completedDates: [
          '2026-02-01',
          '2026-02-02',
          'corrupted',
          '2026-02-04',
          '2026-02-05',
        ],
      };

      const result = validateStreak(corrupted);
      expect(result.valid).toBe(false); // We reject if ANY dates are invalid
      expect(result.error?.message).toContain('Invalid dates in completion history');
    });
  });
});
