import { Capacitor } from '@capacitor/core';

const isDev = import.meta.env.DEV;

/**
 * Open external URL properly based on platform
 * - On native Android/iOS: Uses default browser via OS intent
 * - On web: Uses window.open
 */
export const openExternalUrl = async (url: string): Promise<void> => {
  try {
    if (!Capacitor.isNativePlatform()) {
      // Web platform - use standard window.open
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Native platform - for now use window.open which will trigger system browser
    // This works reliably on Android/iOS with Capacitor
    window.open(url, '_system');
    
    if (isDev) {
      console.log('[ExternalLink] Opened URL:', url);
    }
  } catch (error) {
    console.error('[ExternalLink] Failed to open URL:', url, error);
    // Fallback: try standard window.open
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (fallbackError) {
      console.error('[ExternalLink] Fallback also failed:', fallbackError);
    }
  }
};
