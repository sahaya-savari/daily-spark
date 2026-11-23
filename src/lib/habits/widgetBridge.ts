import { Capacitor, registerPlugin } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { todayKey, addDays } from "./dates";
import { overallStreak, isDoneOn } from "./logic";
import type { Habit, HabitSettings } from "./types";

interface WidgetRefreshPlugin {
  refresh(): Promise<{ refreshed: boolean }>;
}

const WidgetRefresh = registerPlugin<WidgetRefreshPlugin>("WidgetRefresh");

/**
 * Shared Storage Bridge for Android Home-Screen Widgets.
 * Updates context.filesDir/widget_habits.json via Capacitor Filesystem bridge.
 * 100% offline-first, $0 server cost.
 */
export async function syncWidgetData(habits: Habit[], settings?: HabitSettings): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const today = todayKey();
    const streak = overallStreak(habits, today);

    // Top pending habits for TodayWidget (max 3)
    const pendingHabits = habits
      .filter((h) => !h.archivedAt && !h.isPaused && !isDoneOn(h, today))
      .slice(0, 3)
      .map((h) => ({
        id: h.id,
        name: h.name,
        emoji: h.emoji || "⚡",
      }));

    // 70-day consistency grid (10 columns x 7 days) for HeatmapWidget
    const recentHeatLevels: number[] = [];
    const activeHabits = habits.filter((h) => !h.archivedAt);
    const totalActive = Math.max(1, activeHabits.length);

    for (let i = 69; i >= 0; i--) {
      const d = addDays(today, -i);
      let doneCount = 0;
      for (const h of activeHabits) {
        if (isDoneOn(h, d)) {
          doneCount++;
        }
      }
      const ratio = doneCount / totalActive;
      let level = 0;
      if (doneCount > 0) {
        if (ratio >= 1.0) level = 4;
        else if (ratio >= 0.65) level = 3;
        else if (ratio >= 0.35) level = 2;
        else level = 1;
      }
      recentHeatLevels.push(level);
    }

    const payload = JSON.stringify({
      overallStreak: streak,
      themeMode: settings?.themeMode || "classic",
      pendingHabits,
      recentHeatLevels,
    });

    await Filesystem.writeFile({
      path: "widget_habits.json",
      data: payload,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    await WidgetRefresh.refresh();
  } catch (err) {
    // Graceful fallback for environments where filesystem isn't accessible
    console.debug("[widgetBridge] syncWidgetData skipped", err);
  }
}
