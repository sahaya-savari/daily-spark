import { useState, useEffect, useCallback } from 'react';
import { Streak } from '@/types/streak';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  checkNotificationPermission,
  enableNotifications as enableNotificationsService,
  disableNotifications as disableNotificationsService,
  scheduleNotifications,
  type NotificationPermissionStatus,
} from '@/services/notificationService';

/**
 * ASYNC-SAFE Notifications Hook
 * NEVER calls native APIs during render
 * All operations wrapped in try-catch
 * Fails silently to prevent app crashes
 */
export const useNotifications = (streaks: Streak[]) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>({
    supported: true,
    permission: 'prompt',
    platform: 'web',
  });
  const [isBusy, setIsBusy] = useState(false);

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    try {
      setSettings(newSettings);
      saveNotificationSettings(newSettings);
    } catch (error) {
      console.error('[useNotifications] Failed to update settings:', error);
      // Fail silently - don't crash the app
    }
  }, []);

  // SAFE: Check permission on mount (deferred to avoid blocking render)
  useEffect(() => {
    let isMounted = true;
    
    const hydratePermission = async () => {
      try {
        const status = await checkNotificationPermission();
        if (!isMounted) return;
        
        setPermissionStatus(status);
        
        // If permission was revoked, disable notifications
        if (status.permission !== 'granted' && settings.enabled) {
          updateSettings({ ...settings, enabled: false });
        }
      } catch (error) {
        console.error('[useNotifications] Permission check failed:', error);
        // Fail silently - set safe defaults
        if (isMounted) {
          setPermissionStatus({
            supported: false,
            permission: 'denied',
            platform: 'web',
          });
        }
      }
    };

    // Defer to next tick to avoid blocking initial render
    const timeoutId = window.setTimeout(() => {
      void hydratePermission();
    }, 0);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [settings, updateSettings]);

  const enableNotifications = useCallback(async () => {
    if (isBusy) return false;
    
    setIsBusy(true);
    try {
      const granted = await enableNotificationsService(streaks, settings);
      const status = await checkNotificationPermission();
      setPermissionStatus(status);
      
      if (granted) {
        updateSettings({ ...settings, enabled: true });
      } else {
        updateSettings({ ...settings, enabled: false });
      }
      
      return granted;
    } catch (error) {
      console.error('[useNotifications] Enable failed:', error);
      // Fail silently - return false
      return false;
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, settings, streaks, updateSettings]);

  const disableNotifications = useCallback(async () => {
    if (isBusy) return;
    
    setIsBusy(true);
    try {
      await disableNotificationsService();
      updateSettings({ ...settings, enabled: false });
    } catch (error) {
      console.error('[useNotifications] Disable failed:', error);
      // Fail silently - don't crash
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, settings, updateSettings]);

  // SAFE: Reschedule notifications when settings or streaks change
  useEffect(() => {
    let isMounted = true;

    const reschedule = async () => {
      if (!isMounted || !settings.enabled || permissionStatus.permission !== 'granted') {
        return;
      }
      
      try {
        await scheduleNotifications(streaks, settings);
      } catch (error) {
        console.error('[useNotifications] Reschedule failed:', error);
        // Fail silently - don't crash
      }
    };

    void reschedule();

    return () => {
      isMounted = false;
    };
  }, [streaks, settings, permissionStatus.permission]);

  // SAFE: Re-check permission when app comes back to foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void (async () => {
          try {
            const status = await checkNotificationPermission();
            setPermissionStatus(status);
          } catch (error) {
            console.error('[useNotifications] Visibility check failed:', error);
            // Fail silently - don't crash
          }
        })();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    settings,
    updateSettings,
    permissionStatus,
    isEnabled: settings.enabled && permissionStatus.permission === 'granted',
    enableNotifications,
    disableNotifications,
    isBusy,
  };
};
