import { ArrowLeft, Bell, Shield, Moon, Sun, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useStreaks, getStreakStatus } from '@/hooks/useStreaks';
import { useNotifications } from '@/hooks/useNotifications';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { streaks } = useStreaks();
  const {
    settings,
    updateSettings,
    requestPermission,
    permissionStatus,
    isEnabled,
  } = useNotifications(streaks);

  const handleToggleNotifications = async () => {
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
          <div className="flex items-center justify-between px-4 py-4 touch-target">
            <div>
              <p className="font-medium text-foreground">Daily Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded to complete streaks</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={permissionStatus.permission === 'denied'}
            />
          </div>

          {/* Reminder Time */}
          {isEnabled && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border touch-target">
              <div>
                <p className="font-medium text-foreground">Reminder Time</p>
                <p className="text-sm text-muted-foreground">When to send reminders</p>
              </div>
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
          )}

          {permissionStatus.permission === 'denied' && (
            <div className="px-4 py-3 bg-destructive/10 text-sm text-destructive">
              Notifications are blocked. Enable them in your browser settings.
            </div>
          )}
        </section>

        {/* Widgets Section */}
        <section className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Widgets
            </h2>
          </div>

          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Add Daily Spark widgets to your home screen:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-foreground">iOS:</span>
                <span>Long-press home screen → Add Widget → Daily Spark</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground">Android:</span>
                <span>Long-press home screen → Widgets → Daily Spark</span>
              </li>
            </ul>
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
            100% free forever. No ads, no subscriptions, no in-app purchases. 
            Your data belongs to you.
          </p>
          <p className="text-xs text-muted-foreground mt-2">Version 1.0.0</p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
