import { describe, it, expect } from "vitest";
import {
  formatCueAnchor,
  getHabitsTriggeredBy,
  getHabitChain,
  generateContextualPrompt,
} from "./cueAnchor";
import { createHabit } from "./logic";

describe("cueAnchor.ts", () => {
  const today = "2026-10-28";
  const h1 = createHabit({ id: "coffee", name: "Morning Coffee", emoji: "☕" }, today);
  const h2 = createHabit({
    id: "read",
    name: "Read 10 Pages",
    emoji: "📖",
    afterHabitId: "coffee",
  }, today);
  const h3 = createHabit({
    id: "journal",
    name: "Write Journal",
    emoji: "✍️",
    afterHabitId: "read",
  }, today);
  const h4 = createHabit({
    id: "walk",
    name: "Evening Walk",
    emoji: "🚶",
    cueText: "I finish dinner",
  }, today);

  const habits = [h1, h2, h3, h4];

  it("formats cue anchor based on parent habit or custom cue text", () => {
    expect(formatCueAnchor(h2, habits)).toBe("After Morning Coffee → Read 10 Pages");
    expect(formatCueAnchor(h4, habits)).toBe("After I finish dinner → Evening Walk");
    expect(formatCueAnchor(h1, habits)).toBeNull();
  });

  it("finds habits directly triggered by another habit", () => {
    const triggered = getHabitsTriggeredBy("coffee", habits);
    expect(triggered.length).toBe(1);
    expect(triggered[0].id).toBe("read");
  });

  it("resolves multi-step habit chain with loop avoidance", () => {
    const chain = getHabitChain("coffee", habits);
    expect(chain.map((h) => h.id)).toEqual(["read", "journal"]);
  });

  it("generates contextual notification prompt", () => {
    expect(generateContextualPrompt(h2, habits)).toBe("Momentum Anchor: After Morning Coffee → Read 10 Pages");
    expect(generateContextualPrompt(h1, habits)).toBe("Time for your daily spark: Morning Coffee!");
  });
});
