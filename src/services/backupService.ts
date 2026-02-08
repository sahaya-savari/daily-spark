import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const BACKUP_VERSION = '1';

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
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  } catch {}
}

export function createBackup(data: any): BackupData {
  return {
    version: BACKUP_VERSION,
    exportDate: new Date().toISOString(),
    data,
  };
}

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

async function shareViaCache(
  filename: string,
  content: string
): Promise<void> {
  const result = await Filesystem.writeFile({
    path: filename,
    data: content,
    directory: Directory.Cache,
    encoding: 'utf8',
  });

  await Share.share({
    title: filename,
    text: 'Daily Spark backup',
    url: result.uri,
  });
}

export async function exportCsvBackup(streaks: any[]): Promise<void> {
  if (Capacitor.getPlatform() === 'web') return;

  const csv = createStreaksCsv(streaks);
  const filename = `daily_spark_backup_${getBackupTimestamp()}.csv`;
  await shareViaCache(filename, csv);
}

export async function exportJsonBackup(data: any): Promise<void> {
  if (Capacitor.getPlatform() === 'web') return;

  const json = JSON.stringify(createBackup(data), null, 2);
  const filename = `daily_spark_backup_${getBackupTimestamp()}.json`;
  await shareViaCache(filename, json);
}

export async function readBackupFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Invalid file content'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

function getBackupTimestamp(): string {
  const d = new Date();

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}_${hh}-${min}`;
}