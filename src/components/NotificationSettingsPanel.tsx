import { Bell, BellOff, Check } from 'lucide-react';
import { Streak } from '@/types/streak';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface NotificationSettingsPanelProps {
  streaks: Streak[];
}

export const NotificationSettingsPanel = ({ streaks }: NotificationSettingsPanelProps) => {
  const {
    settings,
    updateSettings,
    requestPermission,
    permissionStatus,
    isEnabled,
  } = useNotifications(streaks);

  const handleEnableNotifications = async () => {
    if (permissionStatus.permission !== 'granted') {
      await requestPermission();
    } else {
      updateSettings({ ...settings, enabled: !settings.enabled });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ ...settings, defaultTime: e.target.value });
  };

  return (
    <div className="space-y-4">
      {/* Permission Status */}
      {permissionStatus.permission === 'denied' && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-3">
            <BellOff className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              <p className="font-medium text-destructive text-sm">Notifications Blocked</p>
              <p className="text-xs text-muted-foreground">
                Enable notifications in your browser settings.
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
            disabled={permissionStatus.permission === 'denied'}
          />
        </div>
      </div>

      {/* Reminder Time */}
      {isEnabled && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between touch-target">
            <p className="font-medium text-foreground">Reminder Time</p>
            <select
              value={settings.defaultTime}
              onChange={handleTimeChange}
              className="bg-muted border-0 rounded-lg px-3 py-2 text-foreground text-sm"
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

      {/* Smart Reminder Rules */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-medium text-foreground mb-3 text-sm">Smart Reminder Rules</h3>
        
        <div className="space-y-2">
          {[
            "Only remind if streak not completed today",
            "Skip paused streaks automatically",
            "Maximum 1 reminder per streak per day",
            "Cancel reminder when streak completed",
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
