import { describe, expect, it } from "vitest";
import { createHabit } from "./logic";
import { buildReminderSchedule, subtractReminderOffset } from "./reminders";

describe("habit reminder scheduling", () => {
  it("subtracts offsets within the same day", () => {
    expect(subtractReminderOffset(20, 30, 15)).toEqual({ hour: 20, minute: 15 });
  });

  it("rolls pre-task reminders backward across midnight", () => {
    expect(subtractReminderOffset(0, 10, 15)).toEqual({ hour: 23, minute: 55 });
  });

  it("caps oversized offsets", () => {
    expect(subtractReminderOffset(12, 0, 500)).toEqual({ hour: 10, minute: 0 });
  });
});

describe("dated reminders", () => {
  const now = new Date(2026, 10, 23, 15);
  const settings = { enabled: true, defaultTime: "20:00", muteCompletedReminders: true };
  const habit = createHabit({ name: "Walk", emoji: "W", frequencyType: "specific_days", customDays: [1] }, "2026-11-23");

  it("silences a completed due day and restores it when the completion is undone", () => {
    const completed = { ...habit, completedDates: ["2026-11-23"] };
    expect(buildReminderSchedule([completed], settings, now).map((item) => item.extra.day)).toEqual(["2026-11-30"]);
    expect(buildReminderSchedule([habit], settings, now).map((item) => item.extra.day)).toEqual(["2026-11-23", "2026-11-30"]);
  });

  it("respects quiet hours crossing midnight and the logical date for early reminders", () => {
    const evening = new Date(2026, 10, 23, 23);
    const options = { ...settings, defaultTime: "01:00", rolloverHour: 3 };
    expect(buildReminderSchedule([habit], options, evening)[0].extra.day).toBe("2026-11-23");
    expect(buildReminderSchedule([habit], { ...options, quietHoursEnabled: true }, evening)).toEqual([]);
  });
});
