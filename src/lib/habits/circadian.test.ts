import { describe, it, expect } from "vitest";
import { calculateCircadianCurve, calculateHabitStacking } from "./circadian";
import type { Habit } from "./types";

describe("Circadian & Habit Stacking Intelligence", () => {
  it("calculates 24-hour Gaussian smoothed density curve", () => {
    const habits: Habit[] = [
      {
        id: "h1",
        name: "Morning Run",
        emoji: "🏃",
        createdAt: "2026-01-01",
        currentStreak: 5,
        bestStreak: 5,
        lastCompletedDate: "2026-03-31",
        completedDates: ["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31"],
        completionTimes: {
          "2026-03-27": "07:30",
          "2026-03-28": "08:00",
          "2026-03-29": "07:45",
          "2026-03-30": "08:15",
          "2026-03-31": "08:00",
        },
      },
    ];

    const curve = calculateCircadianCurve(habits);
    expect(curve.length).toBe(24);

    // Peak should be around 7 or 8 AM
    const peakBin = curve.reduce((max, bin) => (bin.smoothedDensity > max.smoothedDensity ? bin : max), curve[0]);
    expect([7, 8]).toContain(peakBin.hour);

    // Mid-day / Midnight should have lower density than morning peak
    const midnightBin = curve.find((b) => b.hour === 0)!;
    expect(midnightBin.smoothedDensity).toBeLessThan(peakBin.smoothedDensity);
  });

  it("calculates conditional habit stacking probability P(B|A)", () => {
    const datesA = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05"];
    const datesB = ["2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04"]; // 4 out of 5 co-occur (80%)

    const habits: Habit[] = [
      {
        id: "hA",
        name: "Morning Stretch",
        emoji: "🧘",
        createdAt: "2026-01-01",
        currentStreak: 5,
        bestStreak: 5,
        lastCompletedDate: "2026-03-05",
        completedDates: datesA,
      },
      {
        id: "hB",
        name: "Drink Water",
        emoji: "💧",
        createdAt: "2026-01-01",
        currentStreak: 4,
        bestStreak: 4,
        lastCompletedDate: "2026-03-04",
        completedDates: datesB,
      },
    ];

    const correlations = calculateHabitStacking(habits, 3);
    expect(correlations.length).toBeGreaterThan(0);

    const match = correlations.find((c) => c.triggerHabitId === "hA" && c.targetHabitId === "hB");
    expect(match).toBeDefined();
    expect(match?.confidence).toBe(80);
    expect(match?.insightText).toContain('When you complete "Morning Stretch", you also complete "Drink Water" 80% of the time.');
  });
});

