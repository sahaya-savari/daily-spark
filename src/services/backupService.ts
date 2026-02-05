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

import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getTodayDate } from '@/lib/dateUtils';
import { Streak } from '@/types/streak';

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
      // Silently fail - store the raw value if JSON parse fails
      backup.data[key] = localStorage.getItem(key);
    }
  });

  return backup;
};

/**
 * Download backup as JSON file
 */
export interface DownloadResult {
  filename: string;
  location?: string;
  shared?: boolean;
}

const downloadTextFile = async (
  filename: string,
  content: string,
  mimeType: string,
  shareTitle: string
): Promise<DownloadResult> => {
  if (Capacitor.isNativePlatform()) {
    const path = `DailySpark/${filename}`;
    const writeResult = await Filesystem.writeFile({
      path,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    let shared = false;
    try {
      await Share.share({
        title: shareTitle,
        text: 'Your file is ready.',
        url: writeResult.uri,
      });
      shared = true;
    } catch {
      shared = false;
    }

    saveLastBackupTimestamp();
    return { filename, location: writeResult.uri, shared };
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  saveLastBackupTimestamp();
  return { filename };
};

export const downloadBackup = async (): Promise<DownloadResult> => {
  try {
    const backup = createBackup();
    const today = getTodayDate();
    const filename = `daily-spark-backup-${today}.json`;
    const json = JSON.stringify(backup, null, 2);
    return await downloadTextFile(filename, json, 'application/json', 'Daily Spark backup');
  } catch (error) {
    throw new Error('Failed to create backup file. Please try again.');
  }
};

const CSV_HEADERS = [
  'name',
  'emoji',
  'color',
  'description',
  'notes',
  'reminderEnabled',
  'reminderTime',
  'scheduledDate',
  'scheduledTime',
  'isStarred',
] as const;

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
};

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (value === undefined) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return ['true', '1', 'yes', 'y'].includes(normalized);
};

const getStoredStreaks = (): Streak[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Streak[]) : [];
  } catch {
    return [];
  }
};

export const createStreaksCsv = (): string => {
  const streaks = getStoredStreaks();
  const headerRow = CSV_HEADERS.join(',');

  const rows = streaks.map((streak) => {
    const values = [
      streak.name ?? '',
      streak.emoji ?? '',
      streak.color ?? '',
      streak.description ?? '',
      streak.notes ?? '',
      streak.reminderEnabled ?? false,
      streak.reminderTime ?? '',
      streak.scheduledDate ?? '',
      streak.scheduledTime ?? '',
      streak.isStarred ?? false,
    ];
    return values.map(escapeCsvValue).join(',');
  });

  return [headerRow, ...rows].join('\n');
};

export const downloadStreaksCsv = async (): Promise<DownloadResult> => {
  try {
    const today = getTodayDate();
    const filename = `daily-spark-streaks-${today}.csv`;
    const csv = createStreaksCsv();
    return await downloadTextFile(filename, csv, 'text/csv', 'Daily Spark CSV export');
  } catch (error) {
    throw new Error('Failed to create CSV file. Please try again.');
  }
};

export interface CsvStreakImportRow {
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
  notes?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  isStarred?: boolean;
}

export const parseStreaksCsv = (text: string): { rows: CsvStreakImportRow[]; errors: string[] } => {
  const errors: string[] = [];
  const content = text.replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ['CSV file is empty.'] };
  }

  const headerCells = parseCsvLine(lines[0]).map(cell => cell.trim());
  const headerMap = new Map<string, number>();
  headerCells.forEach((header, index) => {
    headerMap.set(header.toLowerCase(), index);
  });

  if (!headerMap.has('name')) {
    return { rows: [], errors: ['CSV must include a "name" column.'] };
  }

  const rows: CsvStreakImportRow[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    const cells = parseCsvLine(line);

    const getValue = (key: typeof CSV_HEADERS[number]) => {
      const index = headerMap.get(key.toLowerCase());
      if (index === undefined) return undefined;
      return cells[index]?.trim() ?? '';
    };

    const name = getValue('name');
    if (!name) {
      errors.push(`Row ${i + 1}: missing name.`);
      continue;
    }

    rows.push({
      name,
      emoji: getValue('emoji') || undefined,
      color: getValue('color') || undefined,
      description: getValue('description') || undefined,
      notes: getValue('notes') || undefined,
      reminderEnabled: parseBoolean(getValue('reminderEnabled')),
      reminderTime: getValue('reminderTime') || undefined,
      scheduledDate: getValue('scheduledDate') || undefined,
      scheduledTime: getValue('scheduledTime') || undefined,
      isStarred: parseBoolean(getValue('isStarred')),
    });
  }

  return { rows, errors };
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
      
      // Backup restored successfully
    } catch (error) {
      // Restore failed, rollback to previous state (silently)
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
    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new Error('Invalid file type. Please select a JSON backup file.'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File is too large. Maximum size is 5MB.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          reject(new Error('Backup file is empty.'));
          return;
        }
        const backup = JSON.parse(content);
        resolve(backup);
      } catch (error) {
        if (error instanceof SyntaxError) {
          reject(new Error('Invalid JSON format. This may not be a valid backup file.'));
        } else {
          reject(new Error('Failed to parse backup file. File may be corrupted.'));
        }
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read backup file. Please try again.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Read CSV file as text
 */
export const readCsvFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
      reject(new Error('Invalid file type. Please select a CSV file.'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File is too large. Maximum size is 5MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        reject(new Error('CSV file is empty.'));
        return;
      }
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read CSV file. Please try again.'));
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
    // Silently fail - backup timestamp is optional
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
    // Silently fail - return null
    return null;
  }
};
