import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.santhosh.dailyspark2',
  appName: 'Daily Spark',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    cleartext: true
  }
};

export default config;
