/**
 * Backup & Restore Service
 *
 * Provides local-first export/import functionality for Daily Spark.
 * - Exports all localStorage data to a downloadable JSON file
 * - Imports and validates backup files
 * - No backend, no auth, 100% client-side
 *
 * File Format: daily-spark-backup-YYYY-MM-DD.json
 */

import { getTodayDate } from '@/lib/dateUtils';

const BACKUP_VERSION = '1.0.0';

// All localStorage keys used by the app
const STORAGE_KEYS = {
  STREAKS: 'streakflame_streaks',
  ACTION_HISTORY: 'streakflame_action_history',
  NOTIFICATIONS: 'streakflame_notifications',
  SENT_REMINDERS: 'streakflame_sent_reminders',
} as const;

// Key for storing last backup timestamp
const LAST_BACKUP_KEY = 'streakflame_last_backup';

/**
 * Backup data structure
 */
export interface BackupData {
  version: string;
  exportDate: string;
  data: {
    [key: string]: unknown;
  };
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Export all app data to a backup object
 */
export const createBackup = (): BackupData => {
  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    data: {},
  };

  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      const value = localStorage.getItem(key);
      backup.data[key] = value ? JSON.parse(value) : null;
    } catch {
      backup.data[key] = localStorage.getItem(key);
    }
  });

  return backup;
};

/**
 * Download backup as JSON file
 * ✅ ANDROID / MOBILE SAFE
 */
export const downloadBackup = (): void => {
  try {
    const backup = createBackup();
    const today = getTodayDate();
    const filename = `daily-spark-backup-${today}.json`;

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);

    // IMPORTANT: delayed click + delayed revoke (Android requirement)
    setTimeout(() => {
      link.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 1000);
    }, 100);

    saveLastBackupTimestamp();
  } catch {
    throw new Error('Failed to create backup file. Please try again.');
  }
};

/**
 * Validate backup file structure
 */
export const validateBackup = (backup: unknown): ValidationResult => {
  const warnings: string[] = [];

  if (!backup || typeof backup !== 'object') {
    return { valid: false, error: 'Invalid backup format.' };
  }

  const data = backup as Partial<BackupData>;

  if (!data.version) {
    return { valid: false, error: 'Missing backup version.' };
  }

  if (!data.data || typeof data.data !== 'object') {
    return { valid: false, error: 'Invalid backup data.' };
  }

  const [major] = data.version.split('.');
  const [currentMajor] = BACKUP_VERSION.split('.');

  if (major !== currentMajor) {
    warnings.push('Backup version mismatch.');
  }

  return { valid: true, warnings: warnings.length ? warnings : undefined };
};

/**
 * Restore backup data
 */
export const restoreBackup = (backup: BackupData): void => {
  const validation = validateBackup(backup);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid backup');
  }

  const rollback: Record<string, string | null> = {};
  Object.values(STORAGE_KEYS).forEach((key) => {
    rollback[key] = localStorage.getItem(key);
  });

  try {
    Object.entries(backup.data).forEach(([key, value]) => {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    });
  } catch {
    Object.entries(rollback).forEach(([key, value]) => {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    });
    throw new Error('Restore failed. Data rolled back.');
  }
};

/**
 * Read backup file
 */
export const readBackupFile = (file: File): Promise<BackupData> =>
  new Promise((resolve, reject) => {
    if (!file.name.endsWith('.json')) {
      reject(new Error('Invalid file type'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File too large'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        resolve(JSON.parse(reader.result as string));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsText(file);
  });

/**
 * Backup statistics
 */
export const getBackupStats = (backup: BackupData) => {
  const streaks = backup.data[STORAGE_KEYS.STREAKS] as unknown[];
  const actions = backup.data[STORAGE_KEYS.ACTION_HISTORY] as unknown[];

  return {
    streakCount: Array.isArray(streaks) ? streaks.length : 0,
    actionCount: Array.isArray(actions) ? actions.length : 0,
    exportDate: new Date(backup.exportDate).toLocaleDateString(),
  };
};

/**
 * Save last backup timestamp
 */
const saveLastBackupTimestamp = (): void => {
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
};

/**
 * Get last backup date
 */
export const getLastBackupDate = (): string | null => {
  const ts = localStorage.getItem(LAST_BACKUP_KEY);
  if (!ts) return null;
  return new Date(ts).toLocaleDateString();
};
