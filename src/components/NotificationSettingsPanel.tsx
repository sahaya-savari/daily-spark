import { useEffect, useState } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';
import { Streak } from '@/types/streak';
import { Reminder } from '@/types/reminder';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { scheduleNotifications } from '@/services/notificationService';

interface NotificationSettingsPanelProps {
  streaks: Streak[];
  onRemindersUpdated?: () => void;
}

const REMINDERS_KEY = 'streakflame_reminders';

const getReminders = (): Record<string, Reminder> => {
  try {
    const stored = localStorage.getItem(REMINDERS_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

const getActiveReminders = (streaks: Streak[]): Reminder[] => {
  const reminders = getReminders();
  const active: Reminder[] = [];
  streaks.forEach(streak => {
    const reminder = reminders[streak.id];
    if (reminder && reminder.enabled) {
      active.push(reminder);
    }
  });
  return active;
};

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const NotificationSettingsPanel = ({ streaks, onRemindersUpdated }: NotificationSettingsPanelProps) => {
  const {
    settings,
    updateSettings,
    permissionStatus,
    isEnabled,
    enableNotifications,
    disableNotifications,
    isBusy,
  } = useNotifications(streaks);
  const { toast } = useToast();
  const [activeReminders, setActiveReminders] = useState<Reminder[]>(getActiveReminders(streaks));

  // Update active reminders when streaks change
  useEffect(() => {
    setActiveReminders(getActiveReminders(streaks));
  }, [streaks]);

  const handleEnableNotifications = async () => {
    if (isBusy) {
      return;
    }

    if (isEnabled) {
      await disableNotifications();
      toast({
        title: 'Notifications off',
        description: 'Daily reminders have been disabled.',
      });
      return;
    }

    const granted = await enableNotifications();
    if (!granted) {
      toast({
        title: 'Notifications disabled',
        description: 'Please enable notifications in Android Settings → Apps → Daily Spark → Notifications.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Notifications on',
      description: 'Daily reminders are enabled.',
    });
  };

  const handleTimeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTime = e.target.value;
    updateSettings({ ...settings, defaultTime: newTime });
    
    // Reschedule immediately with new time
    if (isEnabled) {
      await scheduleNotifications(streaks, { ...settings, defaultTime: newTime });
      onRemindersUpdated?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* Permission Status - Denied */}
      {permissionStatus.permission === 'denied' && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3">
            <BellOff className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">Notifications Blocked</p>
              <p className="text-xs text-muted-foreground">
                Please enable them in Android Settings → Apps → Daily Spark → Notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permission Status - Unsupported */}
      {permissionStatus.permission === 'unsupported' && (
        <div className="p-3 rounded-xl bg-muted border border-border">
          <div className="flex items-center gap-3">
            <BellOff className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">Notifications Unavailable</p>
              <p className="text-xs text-muted-foreground">
                Notifications are not available on this device.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Enable Toggle */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between touch-target">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              isEnabled ? "bg-primary/20" : "bg-muted"
            )}>
              {isEnabled ? (
                <Bell className="w-4 h-4 text-primary" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">Daily Reminders</p>
              <p className="text-xs text-muted-foreground">
                Get reminded to complete streaks
              </p>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleEnableNotifications}
            disabled={isBusy}
          />
        </div>
      </div>

      {/* Reminder Time */}
      {isEnabled && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between touch-target">
            <p className="font-medium text-foreground">Default Reminder Time</p>
            <select
              value={settings.defaultTime}
              onChange={handleTimeChange}
              className="bg-muted border-0 rounded-lg px-3 py-2 text-foreground text-sm font-medium"
              aria-label="Default reminder time"
            >
              <option value="09:00">9:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="18:00">6:00 PM</option>
              <option value="20:00">8:00 PM</option>
              <option value="21:00">9:00 PM</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Reminders Summary */}
      {isEnabled && activeReminders.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-medium text-foreground mb-3 text-sm">Active Reminders</h3>
          <div className="space-y-3">
            {activeReminders.map((reminder, idx) => (
              <div key={idx} className="flex flex-col gap-2 pb-3 border-b border-border last:pb-0 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{reminder.time}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                    {reminder.repeatType === 'daily' ? 'Every day' : 'Custom'}
                  </span>
                </div>
                {reminder.repeatType === 'custom' && (
                  <div className="flex flex-wrap gap-1">
                    {reminder.repeatDays.map((isEnabled, dayIdx) => (
                      <span
                        key={dayIdx}
                        className={cn(
                          'text-xs px-2 py-1 rounded-full transition-colors',
                          isEnabled
                            ? 'bg-primary/20 text-primary font-medium'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {WEEKDAY_LABELS[dayIdx].slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Reminder Rules */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 text-sm">Smart Reminder Rules</h3>
        
        <div className="space-y-2">
          {[
            "Only remind if streak not completed today",
            "Skip paused streaks automatically",
            "Maximum 1 reminder per streak per day",
            "Respects individual streak schedules",
          ].map((rule) => (
            <div key={rule} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-success" />
              </div>
              <p className="text-xs text-muted-foreground">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
