import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { getRouter } from './router';
import { Capacitor } from '@capacitor/core';
import { DailySparkApp } from './components/app/DailySparkApp';
import { Toaster } from './components/ui/sonner';
import './styles.css';

class NativeStartupBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="font-display text-xl font-semibold">Daily Spark could not open</h1>
          <p className="text-sm text-muted-foreground">Try opening the app again. Your saved data will stay on this device.</p>
          <button type="button" className="min-h-11 rounded-xl bg-primary px-4 text-primary-foreground"
            onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const native = Capacitor.isNativePlatform();
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {native ? (
        <NativeStartupBoundary>
          <DailySparkApp />
          <Toaster theme="dark" position="top-center" />
        </NativeStartupBoundary>
      ) : <RouterProvider router={getRouter()} />}
    </React.StrictMode>
  );
}
