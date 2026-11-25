import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { HABIT_ICONS } from "@/lib/habits/icons";
import { NewHabitScreen } from "./DemoPhone";

it("shows only real habit icons and selects a valid sample icon", () => {
  const { container } = render(<NewHabitScreen />);
  const iconButtons = Array.from(container.querySelectorAll<HTMLButtonElement>("button[aria-label]"));
  const labels = new Set(iconButtons.map((button) => button.getAttribute("aria-label")));

  for (const { label } of HABIT_ICONS) {
    expect(labels.has(label)).toBe(true);
  }
  expect(iconButtons.find((button) => button.getAttribute("aria-label") === "Run")).toHaveAttribute("aria-pressed", "true");
});
