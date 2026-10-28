import { describe, it, expect } from "vitest";
import {
  resolveElasticTargets,
  getElasticProgress,
  getAtRiskHabits,
  getMiniRecoveryPrompt,
} from "./elastic";
import { createHabit } from "./logic";

describe("elastic.ts", () => {
  const today = "2026-10-28";

  it("resolves default elastic targets for quantitative habit", () => {
    const habit = {
      ...createHabit({
        name: "Water",
        emoji: "💧",
        kind: "quantitative",
        targetValue: 2000,
        unit: "ml",
      }, today),
      targetValue: 2000,
      kind: "quantitative" as const,
      unit: "ml",
    };

    const targets = resolveElasticTargets(habit);
    expect(targets.mini).toBe(660); // 33% of 2000
    expect(targets.plus).toBe(2000);
    expect(targets.elite).toBe(3000); // 150% of 2000
  });

  it("calculates progress tier (mini, plus, elite)", () => {
    const habit = {
      ...createHabit({
        name: "Pushups",
        emoji: "💪",
        kind: "quantitative",
        targetValue: 30,
        elasticTargets: { mini: 10, plus: 30, elite: 50 },
      }, today),
      kind: "quantitative" as const,
      targetValue: 30,
      quantitativeValues: { [today]: 10 },
      elasticTargets: { mini: 10, plus: 30, elite: 50 },
    };

    const pMini = getElasticProgress(habit, today);
    expect(pMini.tier).toBe("mini");
    expect(pMini.bonusStrength).toBe(5);
    expect(pMini.isStreakSaved).toBe(true);

    habit.quantitativeValues![today] = 30;
    const pPlus = getElasticProgress(habit, today);
    expect(pPlus.tier).toBe("plus");
    expect(pPlus.bonusStrength).toBe(15);

    habit.quantitativeValues![today] = 60;
    const pElite = getElasticProgress(habit, today);
    expect(pElite.tier).toBe("elite");
    expect(pElite.bonusStrength).toBe(30);
  });

  it("detects at-risk habits under the two-day rule", () => {
    const h1 = {
      ...createHabit({
        name: "Reading",
        emoji: "📚",
      }, today),
      completedDates: ["2026-10-26"], // completed 2 days ago, missed yesterday ("2026-10-27")
    };

    const h2 = {
      ...createHabit({
        name: "Meditation",
        emoji: "🧘",
      }, today),
      completedDates: ["2026-10-27"], // completed yesterday
    };

    const h3 = {
      ...createHabit({
        name: "Old Habit",
        emoji: "🏃",
      }, today),
      completedDates: ["2026-09-01"], // Dormant for weeks: should NOT be flagged as missing yesterday
    };

    const atRisk = getAtRiskHabits([h1, h2, h3], today);
    expect(atRisk.length).toBe(1);
    expect(atRisk[0].name).toBe("Reading");

    const prompt = getMiniRecoveryPrompt(h1);
    expect(prompt).toContain("Spend 2 focused minutes");
  });
});
