import { describe, it, expect } from "vitest";
import { detectAndParseImport } from "./importer";

describe("Universal Multi-Format Importer", () => {
  const today = "2026-04-01";

  it("parses HabitKit JSON export", () => {
    const json = JSON.stringify({
      habits: [
        {
          name: "Morning Run",
          iconName: "shoe",
          colorHex: "#FF5722",
          completions: ["2026-03-29", "2026-03-30", "2026-03-31"],
        },
      ],
    });

    const res = detectAndParseImport(json, today);
    expect(res.format).toBe("habitkit");
    expect(res.habits.length).toBe(1);
    expect(res.habits[0].name).toBe("Morning Run");
    expect(res.habits[0].completedDates).toEqual(["2026-03-29", "2026-03-30", "2026-03-31"]);
    expect(res.habits[0].currentStreak).toBe(3);
    expect(res.habits[0].bestStreak).toBe(3);
  });

  it("parses Habitica JSON export", () => {
    const json = JSON.stringify({
      tasks: [
        {
          text: "Read 20 Pages",
          type: "habit",
          history: [
            { date: "2026-03-25T00:00:00.000Z", value: 1 },
            { date: "2026-03-26T00:00:00.000Z", value: 1 },
          ],
        },
      ],
    });

    const res = detectAndParseImport(json, today);
    expect(res.format).toBe("habitica");
    expect(res.habits.length).toBe(1);
    expect(res.habits[0].name).toBe("Read 20 Pages");
    expect(res.habits[0].completedDates).toEqual(["2026-03-25", "2026-03-26"]);
    expect(res.habits[0].bestStreak).toBe(2);
  });

  it("parses Loop Habit Tracker CSV export", () => {
    const loopCsv = [
      "# Habit: Cold Shower",
      "2026-03-28,2",
      "2026-03-29,2",
      "# Habit: Meditate",
      "2026-03-30,2",
    ].join("\n");

    const res = detectAndParseImport(loopCsv, today);
    expect(res.format).toBe("loop");
    expect(res.habits.length).toBe(2);
    const shower = res.habits.find((h) => h.name.includes("Cold Shower"));
    expect(shower?.completedDates).toEqual([
      "2026-03-28",
      "2026-03-29",
    ]);
    expect(shower?.bestStreak).toBe(2);
  });

  it("parses HabitBull CSV export", () => {
    const bullCsv = [
      "HabitName,Category,Description,Date,Status",
      "Floss Teeth,Health,,2026-03-28,1",
      "Floss Teeth,Health,,2026-03-29,Success",
      "Floss Teeth,Health,,2026-03-30,0",
    ].join("\n");

    const res = detectAndParseImport(bullCsv, today);
    expect(res.format).toBe("habitbull");
    expect(res.habits.length).toBe(1);
    expect(res.habits[0].name).toBe("Floss Teeth");
    expect(res.habits[0].completedDates).toEqual(["2026-03-28", "2026-03-29"]);
    expect(res.habits[0].bestStreak).toBe(2);
  });

  it("parses Matrix CSV export", () => {
    const matrixCsv = [
      "Date, Workout, Coding, Reading",
      "2026-03-28, 1, 1, 0",
      "2026-03-29, 0, 1, 1",
    ].join("\n");

    const res = detectAndParseImport(matrixCsv, today);
    expect(res.format).toBe("matrix_csv");
    expect(res.habits.length).toBe(3);
    const coding = res.habits.find((h) => h.name === "Coding");
    expect(coding?.completedDates).toEqual(["2026-03-28", "2026-03-29"]);
    expect(coding?.bestStreak).toBe(2);
  });

  it("parses standard CSV with multiple date columns", () => {
    const stdCsv = [
      "Habit,Date1,Date2,Date3",
      "Hydration, 2026-03-29, 2026-03-30, 2026-03-31",
    ].join("\n");

    const res = detectAndParseImport(stdCsv, today);
    expect(res.format).toBe("standard_csv");
    expect(res.habits.length).toBe(1);
    expect(res.habits[0].name).toBe("Hydration");
    expect(res.habits[0].completedDates).toEqual(["2026-03-29", "2026-03-30", "2026-03-31"]);
    expect(res.habits[0].currentStreak).toBe(3);
  });
});

