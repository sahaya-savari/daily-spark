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
