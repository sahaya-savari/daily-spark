import { useEffect } from "react";
import { todayKey } from "@/lib/habits/dates";
import { useHabitStore } from "@/lib/habits/store";
import { isArchived } from "@/lib/habits/logic";

const SENT_KEY = "dailyspark_reminders_sent";

/**
 * Fires gentle reminders while Daily Spark is open (tab or installed window).
 * Only for habits with a reminder that aren't done yet today.
 */
export function ReminderRunner() {
  const { loaded, habits, settings } = useHabitStore();

  useEffect(() => {
    if (!loaded || !settings.enabled || typeof Notification === "undefined") return;

    const tick = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const today = todayKey(now);
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      let sent: Record<string, string> = {};
      try {
        sent = JSON.parse(localStorage.getItem(SENT_KEY) || "{}");
      } catch {
        /* ignore */
      }
      for (const h of habits) {
        if (isArchived(h) || !h.reminderEnabled || !h.reminderTime) continue;
        if (h.completedDates.includes(today) || sent[h.id] === today) continue;
        if (h.reminderTime > hm) continue;
        // Only notify within 30 minutes of the chosen time, never hours later.
        const [rh = 0, rm = 0] = h.reminderTime.split(":").map(Number);
        const minsLate = now.getHours() * 60 + now.getMinutes() - (rh * 60 + rm);
        if (minsLate > 30) continue;
        try {
          new Notification(h.name, {
            body: "A gentle nudge - whenever you're ready.",
            icon: "/icon-192.png",
            tag: `ds-${h.id}`,
          });
        } catch {
          /* some browsers only allow notifications from a service worker */
        }
        sent[h.id] = today;
      }
      localStorage.setItem(SENT_KEY, JSON.stringify(sent));
    };

    tick();
    const t = window.setInterval(tick, 30_000);
    return () => window.clearInterval(t);
  }, [loaded, habits, settings.enabled]);

  return null;
}
