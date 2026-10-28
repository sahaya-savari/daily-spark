import { describe, it, expect } from "vitest";
import {
  detectDayOfWeekBottlenecks,
  detectTimeOfDayBottlenecks,
} from "./bottleneckDetector";
import { createHabit } from "./logic";
import { addDays } from "./dates";

describe("bottleneckDetector.ts", () => {
  const refDate = "2026-10-28"; // Wednesday

  it("detects high dropoff on specific weekdays", () => {
    // Generate dates where Monday-Saturday are completed, but Thursdays (day 4) are consistently skipped
    const completedDates: string[] = [];
    for (let i = 0; i < 56; i++) {
      const d = addDays(refDate, -i);
      const day = new Date(d + "T12:00:00Z").getDay();
      if (day !== 4) { // skip Thursdays
        completedDates.push(d);
      }
    }

    const habit = {
      ...createHabit({
        id: "reading",
        name: "Reading",
        emoji: "📖",
      }, refDate),
      completedDates,
    };

    const bottlenecks = detectDayOfWeekBottlenecks([habit], refDate);
    expect(bottlenecks.length).toBeGreaterThan(0);
    const thurs = bottlenecks.find((b) => b.title.includes("Thursday"));
    expect(thurs).toBeDefined();
    expect(thurs?.detail).toContain("failure rate on Thursdays");
  });

  it("detects late schedule friction", () => {
    const habit = {
      ...createHabit({
        id: "meditate",
        name: "Meditation",
        emoji: "🧘",
      }, refDate),
      reminderTime: "22:30",
      completedDates: ["2026-10-01", "2026-10-05", "2026-10-10", "2026-10-15", "2026-10-20"],
      currentStreak: 1,
    };

    const bottlenecks = detectTimeOfDayBottlenecks([habit]);
    expect(bottlenecks.length).toBe(1);
    expect(bottlenecks[0].title).toContain("Late schedule");
  });
});
