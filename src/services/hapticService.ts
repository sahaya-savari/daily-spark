import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

const isNativePlatform = () => Capacitor.getPlatform() !== 'web';
const isDev = import.meta.env.DEV;

export const triggerHapticLight = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (error) {
    if (isDev) {
      console.debug('[Haptics] Light impact failed:', error);
    }
  }
};

export const triggerHapticMedium = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } catch (error) {
    if (isDev) {
      console.debug('[Haptics] Medium impact failed:', error);
    }
  }
};

export const triggerHapticSelection = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch (error) {
    if (isDev) {
      console.debug('[Haptics] Selection failed:', error);
    }
  }
};

export const triggerHapticSuccess = async (): Promise<void> => {
  if (!isNativePlatform()) return;
  
  try {
    await Haptics.notification({ type: 'SUCCESS' });
  } catch (error) {
    if (isDev) {
      console.debug('[Haptics] Success notification failed:', error);
    }
  }
};
