import { describe, expect, it } from "vitest";
import { subtractReminderOffset } from "./reminders";

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
