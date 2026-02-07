/**
 * Data Recovery Service
 *
 * Handles automatic backup, corruption detection, and safe recovery.
 * App NEVER fails to boot - always provides fallback data.
 *
 * Strategy:
 * 1. On app boot, validate streaks integrity
 * 2. If corrupted, attempt restore from backup
 * 3. If no backup, start fresh with empty array
 * 4. Always show user what happened
 *
 * Storage Keys:
 * - streakflame_streaks: Main data (validated on boot)
 * - streakflame_backup_latest: Last known good backup (auto-saved after successful load)
 * - streakflame_recovery_log: Timeline of recovery events
 */

import { Streak } from '@/types/streak';
import { validateBackupData } from '@/lib/dataValidator';
import { getTodayDate } from '@/lib/dateUtils';

const STORAGE_KEYS = {
  STREAKS: 'streakflame_streaks',
  BACKUP_LATEST: 'streakflame_backup_latest',
  RECOVERY_LOG: 'streakflame_recovery_log',
} as const;

const isDev = import.meta.env.DEV;

/**
 * Recovery event for audit trail
 */
export interface RecoveryEvent {
  timestamp: string;
  type: 'boot_validation' | 'corrupted_detected' | 'restored_from_backup' | 'empty_recovery';
  details: string;
  strykCount?: number;
}

/**
 * Recovery result - what happened during boot
 */
export interface RecoveryResult {
  streaks: Streak[];
  recovered: boolean;
  reason?: string;
  message: string;
}

/**
 * Validate streaks integrity
 * Returns null if data is corrupted, array if valid
 */
const validateStreaksIntegrity = (data: unknown): Streak[] | null => {
  try {
    const result = validateBackupData(data);
    
    // If any errors during validation, data is corrupted
    if (result.errors.length > 0) {
      console.warn('[DataRecovery] Corruption detected:', result.errors);
      return null;
    }
    
    // Validation passed - data is safe
    return result.streaks;
  } catch (error) {
    console.warn('[DataRecovery] Integrity check failed:', error);
    return null;
  }
};

/**
 * Try to load streaks from localStorage
 * Returns { streaks, isValid }
 */
const loadStreaksRaw = (key: string): { data: unknown; isValid: boolean } => {
  try {
    const raw = localStorage.getItem(key);
    
    // Key doesn't exist - not corrupted, just empty
    if (raw === null) {
      return { data: null, isValid: true };
    }
    
    // Try parsing
    const data = JSON.parse(raw);
    return { data, isValid: true };
  } catch (error) {
    console.warn('[DataRecovery] Failed to parse localStorage:', error);
    return { data: null, isValid: false };
  }
};

/**
 * Save backup of current valid streaks
 * Called after successful load to preserve last-known-good state
 */
const saveBackup = (streaks: Streak[]): void => {
  try {
    localStorage.setItem(
      STORAGE_KEYS.BACKUP_LATEST,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        streaks,
      })
    );
  } catch (error) {
    console.warn('[DataRecovery] Failed to save backup:', error);
    // Don't throw - backup failure doesn't block app boot
  }
};

/**
 * Try to restore from backup
 */
const restoreFromBackup = (): Streak[] | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BACKUP_LATEST);
    
    if (!raw) {
      if (isDev) {
        console.info('[DataRecovery] No backup available');
      }
      return null;
    }
    
    const backup = JSON.parse(raw) as { timestamp: string; streaks: unknown };
    
    // Validate backup data
    const validated = validateStreaksIntegrity(backup.streaks);
    
    if (validated) {
      if (isDev) {
        console.info('[DataRecovery] Successfully restored from backup');
      }
      logRecoveryEvent('restored_from_backup', `Recovered ${validated.length} streaks from backup`);
      return validated;
    }
    
    return null;
  } catch (error) {
    console.warn('[DataRecovery] Backup restore failed:', error);
    return null;
  }
};

/**
 * Log recovery event to audit trail
 */
const logRecoveryEvent = (
  type: RecoveryEvent['type'],
  details: string,
  streakCount?: number
): void => {
  try {
    const event: RecoveryEvent = {
      timestamp: new Date().toISOString(),
      type,
      details,
      strykCount: streakCount,
    };
    
    const existing = localStorage.getItem(STORAGE_KEYS.RECOVERY_LOG);
    const log: RecoveryEvent[] = existing ? JSON.parse(existing) : [];
    
    // Keep only last 100 events
    log.push(event);
    if (log.length > 100) log.shift();
    
    localStorage.setItem(STORAGE_KEYS.RECOVERY_LOG, JSON.stringify(log));
  } catch (error) {
    console.warn('[DataRecovery] Failed to log recovery event:', error);
  }
};

/**
 * CORE FUNCTION: Recovery on app boot
 * 
 * Never throws. Always returns valid streaks + recovery info.
 * Called once during app initialization.
 */
export const recoverStreaksOnBoot = (): RecoveryResult => {
  try {
    if (isDev) {
      console.info('[DataRecovery] Starting boot recovery process...');
    }
    
    // Step 1: Try to load main data
    const { data: mainData, isValid: canParse } = loadStreaksRaw(STORAGE_KEYS.STREAKS);
    
    // Step 2: If storage is empty, treat as clean first boot
    if (canParse && mainData === null) {
      logRecoveryEvent('boot_validation', 'Boot validation passed: 0 streaks', 0);
      return {
        streaks: [],
        recovered: false,
        message: '✅ Loaded 0 streaks successfully',
      };
    }

    // Step 3: If we can parse it, validate integrity
    if (canParse && mainData !== null) {
      const validated = validateStreaksIntegrity(mainData);
      
      if (validated) {
        // ✅ Main data is valid - save backup and return
        logRecoveryEvent('boot_validation', `Boot validation passed: ${validated.length} streaks`, validated.length);
        saveBackup(validated);
        
        return {
          streaks: validated,
          recovered: false,
          message: `✅ Loaded ${validated.length} streaks successfully`,
        };
      }
    }
    
    // Step 4: Main data corrupted - attempt recovery
    console.warn('[DataRecovery] Main data corrupted or missing, attempting recovery...');
    logRecoveryEvent('corrupted_detected', 'Main data corrupted or unreadable');
    
    const backupStreaks = restoreFromBackup();
    
    if (backupStreaks) {
      // ✅ Restored from backup
      try {
        localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(backupStreaks));
      } catch (error) {
        console.warn('[DataRecovery] Failed to write recovered data:', error);
      }
      
      return {
        streaks: backupStreaks,
        recovered: true,
        reason: 'backup_restored',
        message: `⚠️  Data was corrupted. Recovered ${backupStreaks.length} streaks from backup.\n\nPlease review your streaks to ensure everything looks correct.`,
      };
    }
    
    // Step 5: No backup available - start fresh
    if (isDev) {
      console.info('[DataRecovery] No backup found, starting fresh');
    }
    logRecoveryEvent('empty_recovery', 'No backup available, starting with empty data');
    
    // Clear any corrupted data to prevent re-corruption
    try {
      localStorage.removeItem(STORAGE_KEYS.STREAKS);
    } catch {
      // Ignore
    }
    
    return {
      streaks: [],
      recovered: true,
      reason: 'no_backup',
      message: '⚠️  Your data could not be recovered. Starting fresh.\n\nYour streaks will start from today.',
    };
  } catch (error) {
    console.error('[DataRecovery] ❌ CRITICAL ERROR in boot recovery:', error);
    // Return empty state - don't crash the app
    return {
      streaks: [],
      recovered: true,
      reason: 'recovery_error',
      message: '⚠️  An error occurred during recovery. Starting fresh.',
    };
  }
};

/**
 * Get recovery history for debugging
 */
export const getRecoveryLog = (): RecoveryEvent[] => {
  try {
    const log = localStorage.getItem(STORAGE_KEYS.RECOVERY_LOG);
    return log ? JSON.parse(log) : [];
  } catch {
    return [];
  }
};

/**
 * Clear recovery log (usually only after user inspects it)
 */
export const clearRecoveryLog = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECOVERY_LOG);
  } catch {
    // Ignore
  }
};

/**
 * Manual backup trigger (for testing or explicit save)
 */
export const saveManualBackup = (streaks: Streak[]): void => {
  saveBackup(streaks);
  logRecoveryEvent('boot_validation', `Manual backup saved: ${streaks.length} streaks`);
};
