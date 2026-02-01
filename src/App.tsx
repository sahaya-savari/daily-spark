import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { ModalProvider } from "@/contexts/ModalContext";
import { StreaksProvider, useStreaksContext } from "@/contexts/StreaksContext";
import { AddStreakDialog } from "@/components/AddStreakDialog";
import { useModal } from "@/contexts/ModalContext";
import { Reminder } from "@/types/reminder";
import { initializeAllReminders } from "@/services/reminderService";
import Index from "./pages/Index";
import Streaks from "./pages/Streaks";
import StreakDetail from "./pages/StreakDetail";
import Calendar from "./pages/Calendar";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Apply system theme on load
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Track viewport height for mobile keyboard handling
  useViewportHeight();
  
  useEffect(() => {
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
      if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Service worker cleanup: unregister old workers, clear outdated caches
  useEffect(() => {
    const cleanupServiceWorkers = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        // Get all service worker registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        
        for (const registration of registrations) {
          // Unregister all workers (PWA will re-register automatically)
          await registration.unregister();
        }

        // Clear old caches that might have stale assets
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          const oldCaches = cacheNames.filter(name => 
            name.includes('workbox') || 
            name.includes('old') || 
            name.includes('v1') ||
            name.includes('precache')
          );
          
          for (const cacheName of oldCaches) {
            await caches.delete(cacheName);
          }
        }
      } catch (error) {
      }
    };

    // Run cleanup on first mount only
    cleanupServiceWorkers();
  }, []);

  // Force layout reflow after initial render to fix desktop bottom bar visibility
  useEffect(() => {
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
  }, []);

  return <>{children}</>;
};

const AppContent = () => {
  const { isAddStreakOpen, closeAddStreak } = useModal();
  const { streaks, addStreak } = useStreaksContext();

  useEffect(() => {
    initializeAllReminders(streaks, () => {});
  }, [streaks]);

  const handleAddStreak = (name: string, emoji: string, reminder?: Reminder, color?: string, description?: string, listId?: string) => {
    addStreak(name, emoji, reminder, color, description, listId);
    closeAddStreak();
  };

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/streaks" element={<Streaks />} />
          <Route path="/streak/:id" element={<StreakDetail />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>

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
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ModalProvider>
          <StreaksProvider>
            <AppContent />
          </StreaksProvider>
        </ModalProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
