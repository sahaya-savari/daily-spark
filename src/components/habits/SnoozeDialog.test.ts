import { describe, expect, it } from "vitest";
import { calculateSnoozeTimestamp } from "./SnoozeDialog";

describe("Snooze calculation logic", () => {
  it("calculates 30 minutes snooze offset", () => {
    const now = 1000000000000;
    const target = calculateSnoozeTimestamp("30min", 2, now);
    expect(target).toBe(now + 30 * 60 * 1000);
  });

  it("calculates 1 hour snooze offset", () => {
    const now = 1000000000000;
    const target = calculateSnoozeTimestamp("1hour", 2, now);
    expect(target).toBe(now + 60 * 60 * 1000);
  });

  it("calculates custom hours snooze offset", () => {
    const now = 1000000000000;
    const target = calculateSnoozeTimestamp("custom", 4, now);
    expect(target).toBe(now + 4 * 60 * 60 * 1000);
  });

  it("calculates tomorrow 9 AM snooze timestamp", () => {
    const now = new Date("2026-10-28T14:30:00Z").getTime();
    const target = calculateSnoozeTimestamp("tomorrow", 2, now);
    const targetDate = new Date(target);
    expect(targetDate.getHours()).toBe(9);
    expect(targetDate.getMinutes()).toBe(0);
    expect(targetDate.getSeconds()).toBe(0);
  });
});
