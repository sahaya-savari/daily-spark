import { describe, it, expect } from "vitest";
import {
  findLongestStreakRun,
  calculateResilienceScore,
  generateArchaeologyReport,
} from "./archaeology";
import { createHabit } from "./logic";

describe("archaeology.ts", () => {
  const today = "2026-10-28";

  it("finds longest continuous run with exact dates", () => {
    const habit = {
      ...createHabit({
        name: "Meditation",
        emoji: "🧘",
      }, today),
      completedDates: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-10", "2026-10-11"],
    };

    const run = findLongestStreakRun(habit);
    expect(run).not.toBeNull();
    expect(run?.length).toBe(3);
    expect(run?.start).toBe("2026-10-01");
    expect(run?.end).toBe("2026-10-03");
  });

  it("calculates resilience comeback score", () => {
    // Completed day 1, missed day 2, completed day 3
    const habit = {
      ...createHabit({
        name: "Workout",
        emoji: "🏋️",
      }, today),
      completedDates: ["2026-10-01", "2026-10-03"],
    };

    const res = calculateResilienceScore([habit]);
    expect(res.recoveries).toBe(1);
    expect(res.score).toBe(100);

    // Now test a habit with 1 recovery (day 1 to 3) and 1 unrecovered multi-day lapse (day 3 to 10)
    const habit2 = {
      ...createHabit({
        name: "Reading",
        emoji: "📚",
      }, today),
      completedDates: ["2026-10-01", "2026-10-03", "2026-10-10"],
    };

    const res2 = calculateResilienceScore([habit2]);
    expect(res2.recoveries).toBe(1);
    expect(res2.singleMisses).toBe(2);
    expect(res2.score).toBe(50);
  });

  it("generates complete archaeology report", () => {
    const h1 = {
      ...createHabit({
        name: "Run",
        emoji: "🏃",
      }, today),
      completedDates: ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04"],
    };

    const report = generateArchaeologyReport([h1]);
    expect(report.totalLifetimeCompletions).toBe(4);
    expect(report.longestRun?.streakLength).toBe(4);
    expect(report.longestRun?.startDate).toBe("2026-10-01");
    expect(report.longestRun?.endDate).toBe("2026-10-04");
  });
});
