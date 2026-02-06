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

import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getTodayDate, getDaysAgo, formatLocalDate } from '@/lib/dateUtils';
import { Streak } from '@/types/streak';
import {
  validateBackupData,
  formatValidationMessage,
  logValidationReport,
} from '@/lib/dataValidator';

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
    console.log('[Backup] Starting JSON export:', filename);
    const result = await downloadTextFile(filename, json, 'application/json', 'Daily Spark backup');
    console.log('[Backup] JSON export result:', result);
    return result;
  } catch (error) {
    console.error('[Backup] Export failed:', error);
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
    console.log('[Backup] Starting CSV export:', filename);
    const result = await downloadTextFile(filename, csv, 'text/csv', 'Daily Spark CSV export');
    console.log('[Backup] CSV export result:', result);
    return result;
  } catch (error) {
    console.error('[Backup] CSV export failed:', error);
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

/**
 * Simple CSV format for importing streaks from other apps
 * Format: title,start_date,current_count
 * Example: Duolingo,2025-12-10,56
 */
export interface SimpleStreakImportRow {
  title: string;
  startDate: string;
  currentCount: number;
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

  // Detect format: simple (title,start_date,current_count) or complex (with full streak fields)
  const isSimpleFormat = 
    headerMap.has('title') && 
    headerMap.has('start_date') && 
    headerMap.has('current_count') &&
    headerCells.length === 3;

  if (isSimpleFormat) {
    return parseSimpleStreaksCsv(lines, errors);
  }

  // Complex format detection (existing logic)
  if (!headerMap.has('name')) {
    return { rows: [], errors: ['CSV must include a "name" column (or use simple format: title,start_date,current_count).'] };
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
 * Parse simple CSV format: title,start_date,current_count
 * Converts to complex CsvStreakImportRow format for consistency
 */
const parseSimpleStreaksCsv = (lines: string[], errors: string[]): { rows: CsvStreakImportRow[]; errors: string[] } => {
  const rows: CsvStreakImportRow[] = [];
  
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = parseCsvLine(line);
    if (cells.length < 3) {
      errors.push(`Row ${i + 1}: incomplete data (need title, start_date, current_count).`);
      continue;
    }

    const title = cells[0]?.trim();
    const startDateStr = cells[1]?.trim();
    const currentCountStr = cells[2]?.trim();

    if (!title) {
      errors.push(`Row ${i + 1}: missing title.`);
      continue;
    }

    if (!startDateStr) {
      errors.push(`Row ${i + 1}: missing start_date (format: YYYY-MM-DD).`);
      continue;
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
      errors.push(`Row ${i + 1}: invalid date format "${startDateStr}" (use YYYY-MM-DD).`);
      continue;
    }

    const currentCount = parseInt(currentCountStr || '0', 10);
    if (Number.isNaN(currentCount) || currentCount < 0) {
      errors.push(`Row ${i + 1}: current_count must be a non-negative number.`);
      continue;
    }

    // Generate completed dates from start_date to today
    const completedDates: string[] = [];
    const startDate = new Date(startDateStr);
    const today = new Date();

    // Make sure date strings are parsed correctly
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (currentCount > 0) {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        completedDates.push(formatLocalDate(d));
        if (completedDates.length >= currentCount) break;
      }
    }

    rows.push({
      name: title,
      emoji: '🔥',
      color: undefined,
      description: undefined,
      notes: undefined,
      reminderEnabled: undefined,
      reminderTime: undefined,
      scheduledDate: undefined,
      scheduledTime: undefined,
      isStarred: false,
    });

    // Store metadata for use in Settings.tsx
    (rows[rows.length - 1] as any)._completedDates = completedDates;
    (rows[rows.length - 1] as any)._startDate = startDateStr;
  }

  return { rows, errors };
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
 * Enhanced validation specifically for streaks import
 * Returns validated streaks and a detailed report
 */
export const validateAndCleanStreaks = (data: unknown): {
  streaks: Streak[];
  userMessage: string;
  hasErrors: boolean;
  hasWarnings: boolean;
} => {
  const result = validateBackupData(data);
  const userMessage = formatValidationMessage(result);
  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  // Log full report in dev tools
  logValidationReport(result);

  return {
    streaks: result.streaks,
    userMessage,
    hasErrors,
    hasWarnings,
  };
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
 * Restore streaks from JSON with strict validation
 * Safe - never crashes or partially restores silently
 * 
 * @param data - Raw JSON data (array or backup object)
 * @param onlyValid - If true, only restore valid streaks (skip invalid ones). If false, abort on any error.
 * @returns { success, streaks, message }
 */
export const restoreStreaksFromJson = (
  data: unknown,
  onlyValid = true
): {
  success: boolean;
  streaks: Streak[];
  message: string;
  recovered: { total: number; valid: number; invalid: number };
} => {
  try {
    const validation = validateAndCleanStreaks(data);

    // If we have errors and strict mode is enabled, fail
    if (validation.hasErrors && !onlyValid) {
      return {
        success: false,
        streaks: [],
        message: `Cannot restore: ${validation.userMessage}`,
        recovered: { total: 0, valid: 0, invalid: 0 },
      };
    }

    // If no valid streaks and we have errors, show warning
    if (validation.streaks.length === 0 && validation.hasErrors) {
      return {
        success: false,
        streaks: [],
        message: `No valid streaks to restore.\n\n${validation.userMessage}`,
        recovered: { total: 0, valid: 0, invalid: 0 },
      };
    }

    // Save valid streaks
    if (validation.streaks.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(validation.streaks));
      } catch (storageError) {
        return {
          success: false,
          streaks: [],
          message: 'Failed to write streaks to storage. Device storage may be full.',
          recovered: { total: 0, valid: 0, invalid: 0 },
        };
      }
    }

    return {
      success: true,
      streaks: validation.streaks,
      message: validation.userMessage,
      recovered: {
        total: validation.streaks.length,
        valid: validation.streaks.length,
        invalid: 0,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      streaks: [],
      message: `Import failed: ${errorMessage}`,
      recovered: { total: 0, valid: 0, invalid: 0 },
    };
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
