/**
 * Backup & Restore Service
 * 
 * Provides local-first export/import functionality for Daily Spark.
 * - Exports all localStorage data to a downloadable JSON file
 * - Imports and validates backup files
 * - No backend, no auth, 100% client-side
 * 
 * File Format: daily-spark-backup-YYYY-MM-DD.json
 * 
 * Backup Structure:
 * {
 *   version: "1.0.0",
 *   exportDate: "2026-01-31T12:00:00.000Z",
 *   data: {
 *     streaks: [...],
 *     actionHistory: [...],
 *     notifications: {...},
 *     settings: {...}
 *   }
 * }
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

// Key for storing last backup timestamp (not included in backup itself)
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

  // Collect all data from localStorage
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        // Parse to validate it's valid JSON
        backup.data[key] = JSON.parse(value);
      } else {
        // Store null if key doesn't exist (new users might not have all keys)
        backup.data[key] = null;
      }
    } catch (error) {
      console.error(`Failed to export ${name}:`, error);
      // Store the raw value if JSON parse fails
      backup.data[key] = localStorage.getItem(key);
    }
  });

  return backup;
};

/**
 * Download backup as JSON file
 */
export const downloadBackup = (): void => {
  try {
    const backup = createBackup();
    const today = getTodayDate();
    const filename = `daily-spark-backup-${today}.json`;
    
    // Convert to pretty JSON
    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Save timestamp of successful backup
    saveLastBackupTimestamp();
    
    console.log('Backup downloaded:', filename);
  } catch (error) {
    console.error('Failed to download backup:', error);
    throw new Error('Failed to create backup file. Please try again.');
  }
};

/**
 * Validate backup file structure
 */
export const validateBackup = (backup: unknown): ValidationResult => {
  const warnings: string[] = [];
  
  // Check if it's an object
  if (!backup || typeof backup !== 'object') {
    return {
      valid: false,
      error: 'Invalid backup file format. Expected JSON object.',
    };
  }
  
  const data = backup as Partial<BackupData>;
  
  // Check required fields
  if (!data.version) {
    return {
      valid: false,
      error: 'Missing version information. This may not be a Daily Spark backup file.',
    };
  }
  
  if (!data.exportDate) {
    warnings.push('Export date missing. File may be corrupted.');
  }
  
  if (!data.data || typeof data.data !== 'object') {
    return {
      valid: false,
      error: 'Missing or invalid data section. File may be corrupted.',
    };
  }
  
  // Check version compatibility
  const [majorVersion] = data.version.split('.');
  const [currentMajor] = BACKUP_VERSION.split('.');
  
  if (majorVersion !== currentMajor) {
    warnings.push(
      `Backup version (${data.version}) differs from current version (${BACKUP_VERSION}). ` +
      'Import may fail or cause issues.'
    );
  }
  
  // Check if backup has any recognizable data
  const hasStreaks = STORAGE_KEYS.STREAKS in data.data;
  const hasActionHistory = STORAGE_KEYS.ACTION_HISTORY in data.data;
  
  if (!hasStreaks && !hasActionHistory) {
    warnings.push('Backup appears to be empty or missing streak data.');
  }
  
  return {
    valid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Restore backup data to localStorage
 * CAUTION: This will overwrite all existing data!
 */
export const restoreBackup = (backup: BackupData): void => {
  try {
    // First, validate the backup
    const validation = validateBackup(backup);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid backup file');
    }
    
    // Create a backup of current data (in case restore fails)
    const currentBackup: Record<string, string | null> = {};
    Object.values(STORAGE_KEYS).forEach(key => {
      currentBackup[key] = localStorage.getItem(key);
    });
    
    try {
      // Clear existing data and restore from backup
      Object.entries(backup.data).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          // Remove key if backup has null
          localStorage.removeItem(key);
        } else {
          // Store as JSON string
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
      
      console.log('Backup restored successfully');
    } catch (error) {
      // Restore failed, rollback to previous state
      console.error('Restore failed, rolling back:', error);
      Object.entries(currentBackup).forEach(([key, value]) => {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      });
      throw new Error('Failed to restore backup. Your data has not been changed.');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to restore backup. Please check the file and try again.');
  }
};

/**
 * Read and parse backup file
 */
export const readBackupFile = (file: File): Promise<BackupData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const backup = JSON.parse(content);
        resolve(backup);
      } catch (error) {
        reject(new Error('Failed to parse backup file. File may be corrupted.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Get backup statistics (for display)
 */
export const getBackupStats = (backup: BackupData): {
  streakCount: number;
  actionCount: number;
  exportDate: string;
} => {
  try {
    const streaks = backup.data[STORAGE_KEYS.STREAKS] as Array<unknown> | null;
    const actions = backup.data[STORAGE_KEYS.ACTION_HISTORY] as Array<unknown> | null;
    
    return {
      streakCount: Array.isArray(streaks) ? streaks.length : 0,
      actionCount: Array.isArray(actions) ? actions.length : 0,
      exportDate: new Date(backup.exportDate).toLocaleDateString(),
    };
  } catch (error) {
    return {
      streakCount: 0,
      actionCount: 0,
      exportDate: 'Unknown',
    };
  }
};

/**
 * Save timestamp of last successful backup
 * Called automatically after downloadBackup() succeeds
 */
const saveLastBackupTimestamp = (): void => {
  try {
    const timestamp = new Date().toISOString();
    localStorage.setItem(LAST_BACKUP_KEY, timestamp);
  } catch (error) {
    console.error('Failed to save backup timestamp:', error);
  }
};

/**
 * Get the last backup date (for display in UI)
 * Returns formatted date string or null if no backup exists
 */
export const getLastBackupDate = (): string | null => {
  try {
    const timestamp = localStorage.getItem(LAST_BACKUP_KEY);
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Failed to read backup timestamp:', error);
    return null;
  }
};
