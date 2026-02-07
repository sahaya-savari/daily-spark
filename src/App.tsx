import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, Component, ReactNode } from "react";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { ModalProvider } from "@/contexts/ModalContext";
import { RecoveryAlertProvider } from "@/contexts/RecoveryAlertContext";
import { StreaksProvider, useStreaksContext } from "@/contexts/StreaksContext";
import { RecoveryAlertDialog } from "@/components/RecoveryAlertDialog";
import { AddStreakDialog } from "@/components/AddStreakDialog";
import { useModal } from "@/contexts/ModalContext";
import { Reminder } from "@/types/reminder";
import { initializeAllReminders } from "@/services/reminderService";
import { initializeNotificationChannels } from "@/services/notificationService";
import Index from "./pages/Index";
import Streaks from "./pages/Streaks";
import StreakDetail from "./pages/StreakDetail";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Error Boundary to catch React rendering errors
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('❌ [ErrorBoundary] Caught error:', error.message);
    console.error('❌ [ErrorBoundary] Stack:', error.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('❌ [ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h1>App Error</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Apply system theme on load
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Track viewport height for mobile keyboard handling
  useViewportHeight();
  
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const savedTheme = localStorage.getItem('theme') || 'system';
      
      root.classList.remove('light', 'dark');
      
      if (savedTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? 'dark' 
          : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(savedTheme);
      }

      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        try {
          if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
            root.classList.remove('light', 'dark');
            root.classList.add(e.matches ? 'dark' : 'light');
          }
        } catch (e) {
          console.error('[ThemeProvider] Error handling theme change:', e);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      console.error('[ThemeProvider] Error initializing theme:', error);
    }
  }, []);

  // Service worker cleanup: unregister old workers, clear outdated caches
  useEffect(() => {
    const cleanupServiceWorkers = async () => {
      try {
        if (!('serviceWorker' in navigator)) return;

        try {
          // Get all service worker registrations
          const registrations = await navigator.serviceWorker.getRegistrations();
          
          for (const registration of registrations) {
            try {
              // Unregister all workers (PWA will re-register automatically)
              await registration.unregister();
            } catch (e) {
              console.warn('[ThemeProvider] Failed to unregister service worker:', e);
            }
          }
        } catch (e) {
          console.warn('[ThemeProvider] Failed to get service worker registrations:', e);
        }

        // Clear old caches that might have stale assets
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            const oldCaches = cacheNames.filter(name => 
              name.includes('workbox') || 
              name.includes('old') || 
              name.includes('v1') ||
              name.includes('precache')
            );
            
            for (const cacheName of oldCaches) {
              try {
                await caches.delete(cacheName);
              } catch (e) {
                console.warn('[ThemeProvider] Failed to delete cache:', cacheName, e);
              }
            }
          } catch (e) {
            console.warn('[ThemeProvider] Failed to clear caches:', e);
          }
        }
      } catch (error) {
        console.error('[ThemeProvider] Error during service worker cleanup:', error);
        // Ignore cleanup failures to avoid blocking app boot
      }
    };

    // Run cleanup on first mount only
    cleanupServiceWorkers();
  }, []);

  // Force layout reflow after initial render to fix desktop bottom bar visibility
  useEffect(() => {
    try {
      requestAnimationFrame(() => {
        try {
          window.dispatchEvent(new Event('resize'));
        } catch (e) {
          console.warn('[ThemeProvider] Failed to dispatch resize event:', e);
        }
      });
    } catch (error) {
      console.error('[ThemeProvider] Error in layout reflow:', error);
    }
  }, []);

  return <>{children}</>;
};

const AppRouter = ({ children }: { children: React.ReactNode }) => {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
};

const AppContent = () => {
  const { isAddStreakOpen, closeAddStreak } = useModal();
  const { streaks, addStreak } = useStreaksContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('[AppContent] Initializing reminders for', streaks.length, 'streaks');
    try {
      initializeAllReminders(streaks, () => {});
      console.log('[AppContent] ✓ Reminders initialized');
    } catch (error) {
      console.error('[AppContent] ✗ Failed to initialize reminders:', error);
    }
  }, [streaks]);

  // CRITICAL: Initialize notification channels at app startup
  // Must run ONCE at startup, NEVER during render or Settings screen load
  // Async-safe: wrapped in useEffect with proper cleanup
  useEffect(() => {
    const initNotifications = async () => {
      try {
        console.log('[AppContent] Initializing notification channels...');
        await initializeNotificationChannels();
        console.log('[AppContent] ✓ Notification channels initialized');
      } catch (error) {
        console.error('[AppContent] ✗ Failed to initialize notifications:', error);
        // Fail silently - don't crash the app
      }
    };

    // Defer to next tick to avoid blocking initial render
    const timeoutId = window.setTimeout(() => {
      void initNotifications();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  // Handle Android hardware back button
  useEffect(() => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.log('[AppContent] Not native platform, skipping back button handler');
        return;
      }

      const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        console.log('[AppContent] Back button pressed, canGoBack:', canGoBack, 'location:', location.pathname);
        
        // Home page or main tabs - exit app
        if (location.pathname === '/' || 
            location.pathname === '/streaks' || 
            location.pathname === '/calendar' ||
            location.pathname === '/insights' ||
            location.pathname === '/settings') {
          console.log('[AppContent] On main tab, exiting app');
          CapacitorApp.exitApp();
        } else if (canGoBack) {
          // Detail pages - navigate back in history
          console.log('[AppContent] On detail page, navigating back');
          navigate(-1);
        } else {
          // No history, go to home
          console.log('[AppContent] No history, going to home');
          navigate('/');
        }
      });

      console.log('[AppContent] ✓ Android back button handler registered');

      return () => {
        try {
          backButtonListener.remove();
          console.log('[AppContent] Android back button handler removed');
        } catch (e) {
          console.error('[AppContent] Error removing back button listener:', e);
        }
      };
    } catch (error) {
      console.error('[AppContent] Error setting up back button handler:', error);
      return undefined;
    }
  }, [navigate, location.pathname]);

  const handleAddStreak = (name: string, emoji: string, reminder?: Reminder, color?: string, description?: string, listId?: string) => {
    try {
      console.log('[AppContent] Adding streak:', name);
      addStreak(name, emoji, reminder, color, description, listId);
      closeAddStreak();
      console.log('[AppContent] ✓ Streak added');
    } catch (error) {
      console.error('[AppContent] ✗ Error adding streak:', error);
      throw error;
    }
  };

  console.log('[AppContent] Rendering with', streaks.length, 'streaks');

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/streaks" element={<Streaks />} />
        <Route path="/streak/:id" element={<StreakDetail />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <AddStreakDialog
        isOpen={isAddStreakOpen}
        onClose={closeAddStreak}
        onAdd={handleAddStreak}
        existingStreakNames={streaks.map(s => s.name)}
      />
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RecoveryAlertProvider>
          <ModalProvider>
            <StreaksProvider>
              <RecoveryAlertDialog />
              <AppRouter>
                <AppContent />
              </AppRouter>
            </StreaksProvider>
          </ModalProvider>
        </RecoveryAlertProvider>
      </TooltipProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
