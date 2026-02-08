import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef, Component, ReactNode } from "react";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Dialog } from "@capacitor/dialog";

import { useViewportHeight } from "@/hooks/useViewportHeight";
import { ModalProvider, useModal } from "@/contexts/ModalContext";
import { RecoveryAlertProvider } from "@/contexts/RecoveryAlertContext";
import {
  StreaksProvider,
  useStreaksContext,
} from "@/contexts/StreaksContext";

import { RecoveryAlertDialog } from "@/components/RecoveryAlertDialog";
import { AddStreakDialog } from "@/components/AddStreakDialog";

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

/* ===================== ERROR BOUNDARY ===================== */

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("❌ ErrorBoundary:", error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center", color: "red" }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ===================== THEME PROVIDER ===================== */

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useViewportHeight();

  useEffect(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme") || "system";
    root.classList.remove("light", "dark");

    if (savedTheme === "system") {
      root.classList.add(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      root.classList.add(savedTheme);
    }
  }, []);

  return <>{children}</>;
};

/* ===================== ROUTER ===================== */

const AppRouter = ({ children }: { children: ReactNode }) => {
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;
  return <Router>{children}</Router>;
};

/* ===================== APP CONTENT ===================== */

const AppContent = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { streaks, addStreak } = useStreaksContext();
  const { isAddStreakOpen, closeAddStreak } = useModal();

  useEffect(() => {
    initializeAllReminders(streaks, () => {});
  }, [streaks]);

  useEffect(() => {
    setTimeout(() => {
      initializeNotificationChannels().catch(() => {});
    }, 0);
  }, []);

  // FINAL ANDROID BACK HANDLER (guaranteed, no duplicates)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handler = async () => {
      const path = location.pathname;
      if (
        path === "/" ||
        path === "/streaks" ||
        path === "/calendar" ||
        path === "/insights" ||
        path === "/settings"
      ) {
        const { value } = await Dialog.confirm({
          title: "Exit Daily Spark?",
          message: "Do you really want to close the app?",
          okButtonTitle: "Exit",
          cancelButtonTitle: "Cancel",
        });
        if (value) {
          CapacitorApp.exitApp();
        }
      } else {
        navigate(-1);
      }
    };
    window.addEventListener("capacitorBackButton", handler);
    return () => window.removeEventListener("capacitorBackButton", handler);
  }, [navigate, location.pathname]);

  /* ===================== ADD STREAK ===================== */

  const handleAddStreak = (
    name: string,
    emoji: string,
    reminder?: Reminder,
    color?: string,
    description?: string,
    listId?: string
  ) => {
    addStreak(name, emoji, reminder, color, description, listId);
    closeAddStreak();
  };

  /* ===================== ROUTES ===================== */

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
        existingStreakNames={streaks.map((s) => s.name)}
      />
    </>
  );
};

/* ===================== ROOT APP ===================== */

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