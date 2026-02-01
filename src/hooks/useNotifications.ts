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

export const useNotifications = (streaks: Streak[]) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>({
    supported: true,
    permission: 'prompt',
    platform: 'web',
  });
  const [isBusy, setIsBusy] = useState(false);

  // Update settings
  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  }, []);

  // Initial permission check on mount
  useEffect(() => {
    let isMounted = true;
    const hydratePermission = async () => {
      const status = await checkNotificationPermission();
      if (!isMounted) {
        return;
      }
      setPermissionStatus(status);
      // Sync settings with actual permission state
      if (status.permission !== 'granted' && settings.enabled) {
        updateSettings({ ...settings, enabled: false });
      }
    };

    hydratePermission();
    return () => {
      isMounted = false;
    };
  }, [settings, updateSettings]);

  const enableNotifications = useCallback(async () => {
    if (isBusy) {
      return false;
    }
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
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, settings, streaks, updateSettings]);

  const disableNotifications = useCallback(async () => {
    if (isBusy) {
      return;
    }
    setIsBusy(true);
    try {
      await disableNotificationsService();
      updateSettings({ ...settings, enabled: false });
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, settings, updateSettings]);

  // When time or enabled state changes, reschedule
  useEffect(() => {
    let isMounted = true;

    const reschedule = async () => {
      if (!isMounted || !settings.enabled || permissionStatus.permission !== 'granted') {
        return;
      }
      // Reschedule with updated settings
      await scheduleNotifications(streaks, settings);
    };

    reschedule();

    return () => {
      isMounted = false;
    };
  }, [streaks, settings, permissionStatus.permission]);

  // Listen for visibility changes to re-check permissions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void (async () => {
          const status = await checkNotificationPermission();
          setPermissionStatus(status);
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
