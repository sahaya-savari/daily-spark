export const BACKUP_VERSION = "1";
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

/**
 * Backup data structure (TOP-LEVEL ONLY)
 */
export interface BackupData {
  version: string;
  exportDate: string;
  data: any;
}

const LAST_BACKUP_KEY = 'streakflame_last_backup';

export function getLastBackupDate(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

export function setLastBackupDate(): void {
  try {
    localStorage.setItem(
      LAST_BACKUP_KEY,
      new Date().toISOString()
    );
  } catch {
    // silent fail (offline-safe)
  }
}

/**
 * Create full JSON backup (LOGIC UNCHANGED)
 */
export function createBackup(data: any): BackupData {
  return {
    version: '1',
    exportDate: new Date().toISOString(),
    data,
  };
}

/**
 * Convert streaks to CSV (LOGIC UNCHANGED)
 */
export function createStreaksCsv(streaks: any[]): string {
  const headers = ['id', 'name', 'createdAt', 'archived'];

  const rows = streaks.map((s) =>
    [
      s.id ?? '',
      `"${s.name ?? ''}"`,
      s.createdAt ?? '',
      s.archived ? 'true' : 'false',
    ].join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Share helper (ANDROID SAFE)
 * NO Filesystem
 * NO browser download
 */
// Revert: Remove Filesystem import and restore share-only logic

export async function shareFile(
  filename: string,
  content: string,
  mimeType: string
): Promise<boolean> {
  const blob = new Blob([content], { type: mimeType });
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onloadend = () =>
      resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(blob);
  });
  try {
    await Share.share({
      title: filename,
      text: 'Daily Spark backup',
      files: [
        {
          name: filename,
          data: base64,
          mimeType,
        },
      ],
    });
    // ✅ ALWAYS treat as success
    return true;
  } catch {
    // ❌ Only real failure (rare)
    return false;
  }
}

/**
 * Export CSV (ANDROID → SHARE SHEET)
 */
export async function exportJsonBackup(data: any): Promise<void> {
  const csv = createStreaksCsv(streaks);
  if (Capacitor.getPlatform() === 'web') {
    // Web logic already exists elsewhere
    return;
    return;
  await shareFile('daily_spark_backup.csv', csv, 'text/csv');
  await shareFile('daily_spark_backup.json', json, 'application/json');

/**
 * Export JSON (ANDROID → SHARE SHEET)
 */
export async function exportJsonBackup(data: any): Promise<void> {
  const backup = createBackup(data);
  const json = JSON.stringify(backup, null, 2);
  if (Capacitor.getPlatform() === 'web') {
    // Web logic already exists elsewhere
    return true;
  }
  return await shareFile('daily_spark_backup.json', json, 'application/json');
}
