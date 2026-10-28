import { describe, expect, it } from "vitest";
import { filterHabits } from "./HabitSearchFilter";
import { createHabit } from "@/lib/habits/logic";
import { type Habit } from "@/lib/habits/types";

const TODAY = "2026-10-26";

describe("filterHabits utility", () => {
  const habits: Habit[] = [
    {
      ...createHabit({ name: "Drink Water", emoji: "💧" }, TODAY),
      id: "1",
      notes: "Stay hydrated every morning",
      category: "health",
      isStarred: true,
    },
    {
      ...createHabit({ name: "Read Books", emoji: "📚" }, TODAY),
      id: "2",
      notes: "Read chapter 4 of clean code",
      category: "study",
      isStarred: false,
    },
    {
      ...createHabit({ name: "Gym Workout", emoji: "🏋️" }, TODAY),
      id: "3",
      archivedAt: "2026-10-25",
      category: "health",
    },
  ];

  it("filters by status tabs", () => {
    expect(filterHabits(habits, "", "all", null)).toHaveLength(3);
    expect(filterHabits(habits, "", "active", null)).toHaveLength(2);
    expect(filterHabits(habits, "", "starred", null)).toHaveLength(1);
    expect(filterHabits(habits, "", "archived", null)).toHaveLength(1);
  });

  it("filters by category", () => {
    const healthHabits = filterHabits(habits, "", "all", "health");
    expect(healthHabits).toHaveLength(2);
    expect(healthHabits.map((h) => h.name)).toEqual(["Drink Water", "Gym Workout"]);
  });

  it("filters by substring match in name, emoji, or notes", () => {
    // Match name
    expect(filterHabits(habits, "water", "all", null)).toHaveLength(1);
    // Match emoji
    expect(filterHabits(habits, "📚", "all", null)).toHaveLength(1);
    // Match notes
    expect(filterHabits(habits, "clean code", "all", null)).toHaveLength(1);
    expect(filterHabits(habits, "hydrated", "all", null)).toHaveLength(1);
    // No match
    expect(filterHabits(habits, "nonexistent", "all", null)).toHaveLength(0);
  });
});
