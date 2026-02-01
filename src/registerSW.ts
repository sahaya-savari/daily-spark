import { Capacitor } from '@capacitor/core';

export function registerSW() {
  if (Capacitor.isNativePlatform()) {
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
}
