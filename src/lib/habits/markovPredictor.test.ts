import { describe, it, expect } from "vitest";
import { buildMarkovTransitions, predictNextHabit } from "./markovPredictor";
import { createHabit } from "./logic";

describe("markovPredictor.ts", () => {
  const today = "2026-10-28";

  it("builds transition matrix and predicts next habit based on completion sequences", () => {
    const dates = ["2026-10-20", "2026-10-21", "2026-10-22"];

    const hA = {
      ...createHabit({
        id: "workout",
        name: "Morning Workout",
        emoji: "🏋️",
      }, today),
      completedDates: dates,
      completionTimes: {
        "2026-10-20": "07:00",
        "2026-10-21": "07:15",
        "2026-10-22": "07:10",
      },
    };

    const hB = {
      ...createHabit({
        id: "water",
        name: "Drink 500ml Water",
        emoji: "💧",
      }, today),
      completedDates: dates,
      completionTimes: {
        "2026-10-20": "07:30",
        "2026-10-21": "07:45",
        "2026-10-22": "07:35",
      },
    };

    const transitions = buildMarkovTransitions([hA, hB]);
    expect(transitions.get("workout")?.get("water")).toBe(3);

    const prediction = predictNextHabit("workout", [hA, hB], "2026-10-28");
    expect(prediction).not.toBeNull();
    expect(prediction?.habitId).toBe("water");
    expect(prediction?.confidencePercent).toBe(100);
  });
});
