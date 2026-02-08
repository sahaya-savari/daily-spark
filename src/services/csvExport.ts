import { shareTextFile } from './shareExport';
import { toast } from '../hooks/use-toast';

export function createStreaksCsv(streaks: any[]): string {
  const header = 'title,start_date,current_count\n';

  const rows = streaks.map(s =>
    `"${(s.title || '').replace(/"/g, '""')}",${s.startDate || ''},${s.currentCount || 0}`
  );

  return header + rows.join('\n');
}

export async function exportCsvBackup(streaks: any[]) {
  try {
      const csv = createStreaksCsv(streaks);
      await shareTextFile('daily_spark_backup.csv', csv, 'text/csv');
      localStorage.setItem('streakflame_last_backup', new Date().toISOString());
      toast({
        title: 'CSV Export',
        description: 'CSV shared successfully',
      });
  } catch (e: any) {
    console.error(e);
    toast({
      title: 'CSV export failed',
      description: e.message,
      variant: 'destructive',
    });
    throw e;
  }
}
