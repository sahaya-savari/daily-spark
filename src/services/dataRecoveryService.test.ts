import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  recoverStreaksOnBoot,
  getRecoveryLog,
  clearRecoveryLog,
  saveManualBackup,
} from '@/services/dataRecoveryService';
import { Streak } from '@/types/streak';

describe('DataRecoveryService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const validStreak: Streak = {
    id: 'streak-1',
    name: 'Exercise',
    emoji: '💪',
    createdAt: '2026-02-01',
    currentStreak: 5,
    bestStreak: 8,
    lastCompletedDate: '2026-02-06',
    completedDates: ['2026-02-01', '2026-02-02'],
    listId: 'default',
    isStarred: false,
  };

  const corruptedStreak = {
    id: 'streak-1',
    name: 'Corrupted',
    emoji: '⚠️',
    createdAt: '2026-01-01',
    currentStreak: 10,
    bestStreak: 5, // Corrupted: bestStreak < currentStreak
    lastCompletedDate: '2026-02-06',
    completedDates: [],
  };

  describe('recoverStreaksOnBoot', () => {
    it('should return valid streaks when main data is uncorrupted', () => {
      localStorage.setItem('streakflame_streaks', JSON.stringify([validStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(false);
      expect(result.streaks.length).toBe(1);
      expect(result.streaks[0].id).toBe('streak-1');
      expect(result.message).toContain('Loaded');
    });

    it('should restore from backup when main data is corrupted', () => {
      // Save a valid backup
      localStorage.setItem(
        'streakflame_backup_latest',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          streaks: [validStreak],
        })
      );

      // Corrupt main data
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(true);
      expect(result.reason).toBe('backup_restored');
      expect(result.streaks.length).toBe(1);
      expect(result.message).toContain('Recovered');
    });

    it('should start fresh when no backup available', () => {
      // Corrupt main data without backup
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(true);
      expect(result.reason).toBe('no_backup');
      expect(result.streaks.length).toBe(0);
      expect(result.message).toContain('Starting fresh');
    });

    it('should handle missing main data gracefully', () => {
      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(false);
      expect(result.streaks.length).toBe(0);
      expect(result.message).toContain('Loaded');
    });

    it('should handle unparseable main data', () => {
      localStorage.setItem('streakflame_streaks', 'not valid json{]');

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(true);
      expect(result.reason).toBe('no_backup');
      expect(result.streaks.length).toBe(0);
    });

    it('should save backup after successful load', () => {
      localStorage.setItem('streakflame_streaks', JSON.stringify([validStreak]));

      recoverStreaksOnBoot();

      const backup = localStorage.getItem('streakflame_backup_latest');
      expect(backup).toBeDefined();

      const parsed = JSON.parse(backup!);
      expect(parsed.streaks.length).toBe(1);
    });

    it('should handle partial corrupted data', () => {
      // Mix of valid & corrupted streaks
      const mixedData = [
        validStreak,
        corruptedStreak,
      ];

      localStorage.setItem('streakflame_streaks', JSON.stringify(mixedData));

      const result = recoverStreaksOnBoot();

      // The validation will reject the whole bunch since at least one is corrupted
      expect(result.recovered).toBe(true);
    });

    it('should log recovery events', () => {
      localStorage.setItem(
        'streakflame_backup_latest',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          streaks: [validStreak],
        })
      );
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      recoverStreaksOnBoot();

      const log = getRecoveryLog();
      expect(log.length).toBeGreaterThan(0);
      expect(log.some((e) => e.type === 'corrupted_detected')).toBe(true);
    });
  });

  describe('Recovery Edge Cases', () => {
    it('should handle backup with corrupted data', () => {
      // Backup is also corrupted
      localStorage.setItem(
        'streakflame_backup_latest',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          streaks: [corruptedStreak],
        })
      );

      // Main data is corrupted
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(true);
      expect(result.reason).toBe('no_backup');
      expect(result.streaks.length).toBe(0);
    });

    it('should handle empty array', () => {
      localStorage.setItem('streakflame_streaks', JSON.stringify([]));

      const result = recoverStreaksOnBoot();

      expect(result.recovered).toBe(false);
      expect(result.streaks.length).toBe(0);
    });

    it('should never throw an error', () => {
      // Try various error conditions
      localStorage.setItem('streakflame_streaks', '');
      localStorage.setItem('streakflame_backup_latest', '{broken json');

      expect(() => recoverStreaksOnBoot()).not.toThrow();
    });
  });

  describe('getRecoveryLog', () => {
    it('should retrieve recovery history', () => {
      recoverStreaksOnBoot();

      const log = getRecoveryLog();
      expect(Array.isArray(log)).toBe(true);
    });

    it('should handle missing log gracefully', () => {
      const log = getRecoveryLog();
      expect(log.length).toBe(0);
    });
  });

  describe('Manual Backup', () => {
    it('should save manual backup', () => {
      const streak = { ...validStreak, id: 'test-123' };
      saveManualBackup([streak]);

      const backup = localStorage.getItem('streakflame_backup_latest');
      expect(backup).toBeDefined();

      const parsed = JSON.parse(backup!);
      expect(parsed.streaks[0].id).toBe('test-123');
    });
  });

  describe('User-Facing Messages', () => {
    it('should provide clear message for successful load', () => {
      localStorage.setItem('streakflame_streaks', JSON.stringify([validStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.message).toMatch(/✅|Loaded/);
    });

    it('should provide clear message for backup restore', () => {
      localStorage.setItem(
        'streakflame_backup_latest',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          streaks: [validStreak],
        })
      );
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.message).toMatch(/⚠️|Recovered|backup/);
    });

    it('should provide clear message for empty recovery', () => {
      localStorage.setItem('streakflame_streaks', JSON.stringify([corruptedStreak]));

      const result = recoverStreaksOnBoot();

      expect(result.message).toMatch(/⚠️|Starting fresh|recovered/);
    });
  });
});
