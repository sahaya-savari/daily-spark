import { useState, useRef } from 'react';
import { ArrowLeft, Bell, Shield, Download, Upload, AlertTriangle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { BottomNav } from '@/components/BottomNav';
import { useStreaksContext } from '@/contexts/StreaksContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APP_VERSION, APP_NAME, APP_DESCRIPTION } from '@/lib/constants';
import { 
  downloadBackup, 
  downloadStreaksCsv,
  readBackupFile, 
  readCsvFile,
  parseStreaksCsv,
  validateBackup, 
  restoreBackup,
  getBackupStats,
  getLastBackupDate,
  type BackupData 
} from '@/services/backupService';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Settings = () => {
  const { streaks, addStreak, editStreak } = useStreaksContext();
  const isNative = Capacitor.isNativePlatform();
  const {
    permissionStatus,
    isEnabled,
    enableNotifications,
    disableNotifications,
    isBusy,
  } = useNotifications(streaks);
  const { toast } = useToast();
  
  // Today Focus Mode state
  const [todayFocusEnabled, setTodayFocusEnabled] = useState(() => {
    const stored = localStorage.getItem('streakflame_todayFocus');
    return stored ? JSON.parse(stored) : false;
  });
  
  // Backup/Restore state
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [backupToImport, setBackupToImport] = useState<BackupData | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleToggleTodayFocus = (checked: boolean) => {
    setTodayFocusEnabled(checked);
    localStorage.setItem('streakflame_todayFocus', JSON.stringify(checked));
    toast({
      title: checked ? 'Today Focus Enabled' : 'Today Focus Disabled',
      description: checked ? 'Showing only today\'s tasks' : 'Showing all tasks',
    });
  };
  
  // Load last backup date on mount
  useState(() => {
    setLastBackupDate(getLastBackupDate());
  });

  const handleToggleNotifications = async () => {
    if (isBusy) {
      return;
    }

    if (isEnabled) {
      await disableNotifications();
      toast({
        title: 'Notifications off',
        description: 'Daily reminders have been disabled. To fully disable notifications, turn them off in Android system settings.',
      });
      return;
    }

    const granted = await enableNotifications();
    if (!granted) {
      toast({
        title: 'Notifications disabled',
        description: 'Notifications are disabled. Please enable them in Android Settings → Apps → Daily Spark → Notifications.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Notifications on',
      description: 'Daily reminders are enabled.',
    });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ ...settings, defaultTime: e.target.value });
  };
  
  // Export backup
  const handleExport = async () => {
    try {
      const result = await downloadBackup();
      // Update last backup date immediately
      setLastBackupDate(getLastBackupDate());
      const description = isNative
        ? result.shared
          ? 'Backup saved and share sheet opened.'
          : 'Backup saved to Documents/DailySpark.'
        : 'Your data has been exported successfully.';
      toast({
        title: 'Backup created',
        description,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to create backup',
        variant: 'destructive',
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      const result = await downloadStreaksCsv();
      setLastBackupDate(getLastBackupDate());
      const description = isNative
        ? result.shared
          ? 'CSV saved and share sheet opened.'
          : 'CSV saved to Documents/DailySpark.'
        : 'Your CSV has been exported successfully.';
      toast({
        title: 'CSV exported',
        description,
      });
    } catch (error) {
      toast({
        title: 'CSV export failed',
        description: error instanceof Error ? error.message : 'Failed to create CSV',
        variant: 'destructive',
      });
    }
  };
  
  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    const isCsv = file.type.includes('csv') || file.name.toLowerCase().endsWith('.csv');
    
    try {
      if (isCsv) {
        const csvText = await readCsvFile(file);
        const { rows, errors } = parseStreaksCsv(csvText);
        
        if (rows.length === 0) {
          toast({
            title: 'No streaks found',
            description: errors[0] || 'CSV did not contain any valid rows.',
            variant: 'destructive',
          });
          return;
        }

        rows.forEach((row) => {
          const reminder = row.reminderEnabled && row.reminderTime
            ? {
                enabled: true,
                time: row.reminderTime,
                repeatType: 'daily' as const,
                repeatDays: [true, true, true, true, true, true, true],
                description: row.description || '',
              }
            : undefined;

          const created = addStreak(
            row.name,
            row.emoji || '🔥',
            reminder,
            row.color,
            row.description
          );

          editStreak(created.id, {
            notes: row.notes,
            scheduledDate: row.scheduledDate,
            scheduledTime: row.scheduledTime,
            isStarred: row.isStarred,
          });
        });

        toast({
          title: 'CSV imported',
          description: `Added ${rows.length} streak${rows.length === 1 ? '' : 's'}.`,
        });

        if (errors.length > 0) {
          toast({
            title: 'Some rows were skipped',
            description: errors[0],
          });
        }

        return;
      }

      // Read and parse file
      const backup = await readBackupFile(file);
      
      // Validate
      const validation = validateBackup(backup);
      
      if (!validation.valid) {
        toast({
          title: 'Invalid backup file',
          description: validation.error,
          variant: 'destructive',
        });
        return;
      }
      
      // Show warnings if any
      if (validation.warnings && validation.warnings.length > 0) {
        // Backup loaded with warnings - they are displayed in the UI
      }
      
      // Store backup and show confirmation dialog
      setBackupToImport(backup);
      setImportDialogOpen(true);
      
    } catch (error) {
      toast({
        title: 'Failed to read file',
        description: error instanceof Error ? error.message : 'Could not read backup file',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Confirm and restore backup
  const handleConfirmImport = () => {
    if (!backupToImport) return;
    
    try {
      restoreBackup(backupToImport);
      
      toast({
        title: 'Backup restored',
        description: 'Your data has been imported. Reloading app...',
      });
      
      // Reload app after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to restore backup',
        variant: 'destructive',
      });
    } finally {
      setImportDialogOpen(false);
      setBackupToImport(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="content-width px-4 py-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 -ml-2 rounded-xl active:bg-muted touch-target">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">Settings</h1>
          </div>
        </div>
      </header>

      <main className="content-width px-4 py-4 space-y-4">
        {/* Notifications Section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Reminders
            </h2>
          </div>

          {/* Enable Notifications */}
          <div className="flex items-center justify-between px-4 py-4 touch-target border-b border-border">
            <div>
              <p className="font-medium text-foreground">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded to complete streaks</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={isBusy}
            />
          </div>

          {/* Today Focus Mode */}
          <div className="flex items-center justify-between px-4 py-4 touch-target">
            <div>
              <p className="font-medium text-foreground flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Today Focus Mode
              </p>
              <p className="text-sm text-muted-foreground">Show only today's tasks</p>
            </div>
            <Switch
              checked={todayFocusEnabled}
              onCheckedChange={handleToggleTodayFocus}
            />
          </div>

          {permissionStatus.permission === 'unsupported' && (
            <div className="px-4 py-3 bg-muted text-sm text-muted-foreground">
              Notifications are not available on this device.
            </div>
          )}

          {permissionStatus.permission === 'denied' && (
            <div className="px-4 py-3 bg-destructive/10 text-sm text-destructive">
              Notifications are disabled. Please enable them in Android Settings → Apps → Daily Spark → Notifications.
            </div>
          )}
        </section>

        {!isNative && (
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                App Install
              </h2>
            </div>

            <div className="px-4 py-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Install Daily Spark for quick access and offline support.
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Open from your home screen like any app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Works offline after install</span>
                </li>
              </ul>
            </div>
          </section>
        )}

        {/* Backup & Restore Section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Download className="w-4 h-4" />
                Backup & Restore
              </h2>
              {lastBackupDate && (
                <span className="text-xs text-muted-foreground">
                  Last backup: {lastBackupDate}
                </span>
              )}
              {!lastBackupDate && (
                <span className="text-xs text-muted-foreground">
                  Last backup: Never
                </span>
              )}
            </div>
          </div>

          <div className="px-4 py-4 space-y-4">
            {/* Warning message */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Keep your backup file safe.</span> It contains your complete streak history and settings.
              </p>
            </div>

            {/* Export button */}
            <div className="space-y-2">
              <Button
                onClick={handleExport}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={handleExportCsv}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JSON is a full backup. CSV exports streak basics for spreadsheets.
              </p>
            </div>

            {/* Import button */}
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Import backup file"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Reading file...' : 'Import JSON/CSV'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                JSON restores all data. CSV adds new streaks only.
              </p>
            </div>

            {/* Info */}
            <div className="pt-2 border-t border-border space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                💡 Backups keep your streaks safe across devices
              </p>
              <p className="text-xs text-muted-foreground">
                Your data is stored locally on this device. Export regularly to keep a backup.
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </h2>
          </div>

          <div className="divide-y divide-border">
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your Data is Private</p>
                <p className="text-sm text-muted-foreground">
                  Only you can see your streaks. No data shared with third parties.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 px-4 py-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🔒</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Encrypted Storage</p>
                <p className="text-sm text-muted-foreground">
                  Data encrypted in transit and at rest.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 px-4 py-4">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm">📍</span>
              </div>
              <div>
                <p className="font-medium text-foreground">No Tracking</p>
                <p className="text-sm text-muted-foreground">
                  We don't track location or browsing habits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-card border border-border rounded-xl p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">About Daily Spark</h2>
          <p className="text-sm text-muted-foreground">
            Build consistency, one day at a time. Track your habits with visual streaks. 
            100% free forever - no ads, no subscriptions, no purchases.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Version {APP_VERSION}</p>
        </section>
      </main>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Backup?</AlertDialogTitle>
            <AlertDialogDescription>
              {backupToImport && (
                <div className="space-y-3">
                  <p>
                    This will replace all your current data with the backup.
                  </p>
                  
                  <div className="bg-muted rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium text-foreground">Backup contains:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {getBackupStats(backupToImport).streakCount} streaks</li>
                      <li>• Exported on {getBackupStats(backupToImport).exportDate}</li>
                    </ul>
                  </div>
                  
                  <p className="text-destructive font-medium">
                    ⚠️ This action cannot be undone!
                  </p>
                  
                  <p className="text-sm">
                    Consider exporting your current data first as a safety backup.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              Import and Replace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* App Version Footer */}
      <div className="mt-12 py-6 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>{APP_NAME} v{APP_VERSION}</p>
        <p className="text-xs mt-1">© 2026 Daily Spark</p>
      </div>

      {/* About Section */}
      <section className="mt-8 px-4 pb-4 space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl fire-gradient flex items-center justify-center">
              <span className="text-3xl">🔥</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">{APP_NAME}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {APP_DESCRIPTION}
            </p>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Track multiple streaks simultaneously</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>View calendar with habit history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Works offline - no internet required</span>
              </li>
              {!isNative && (
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Installable like a native app</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Customizable reminders and themes</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="font-semibold text-foreground">Built With</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">Frontend</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Vite</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">UI</p>
                <ul className="text-muted-foreground space-y-0.5">
                  <li>Tailwind CSS</li>
                  <li>shadcn/ui</li>
                  {!isNative && <li>Vite PWA</li>}
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Made with ❤️ by{' '}
              <a
                href="https://github.com/sahaya-savari"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sahaya Savari
              </a>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Open source under{' '}
              <a
                href="https://github.com/sahaya-savari/daily-spark/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                MIT License
              </a>
            </p>
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default Settings;
