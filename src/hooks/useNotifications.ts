import { useState, useEffect, useCallback } from 'react';
import { Streak } from '@/types/streak';
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  scheduleNotificationCheck,
  onStreakCompleted,
  getNotificationStatus,
} from '@/services/notificationService';

export const useNotifications = (streaks: Streak[]) => {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permissionStatus, setPermissionStatus] = useState(getNotificationStatus);

  // Request permission
  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermissionStatus(getNotificationStatus());
    if (granted) {
      updateSettings({ ...settings, enabled: true });
    }
    return granted;
  }, [settings]);

  // Update settings
  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  }, []);

  // Handle streak completion
  const handleStreakCompleted = useCallback((streakId: string) => {
    onStreakCompleted(streakId);
  }, []);

  // Set up notification scheduler
  useEffect(() => {
    if (!settings.enabled || permissionStatus.permission !== 'granted') {
      return;
    }

    const cleanup = scheduleNotificationCheck(streaks, settings);
    return cleanup;
  }, [streaks, settings, permissionStatus.permission]);

  // Listen for visibility changes to re-check notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-check notification status when app becomes visible
        setPermissionStatus(getNotificationStatus());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return {
    settings,
    updateSettings,
    requestPermission,
    permissionStatus,
    handleStreakCompleted,
    isEnabled: settings.enabled && permissionStatus.permission === 'granted',
  };
};
