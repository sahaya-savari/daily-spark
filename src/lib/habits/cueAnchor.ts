import type { Habit } from "./types";

/**
 * Returns a human-friendly sentence describing the habit's cue trigger.
 * e.g. "After I pour my morning coffee [CUE] → Drink water [ROUTINE]"
 */
export function formatCueAnchor(habit: Habit, allHabits: Habit[]): string | null {
  if (habit.cueText && habit.cueText.trim()) {
    return `After ${habit.cueText.trim()} → ${habit.name}`;
  }

  if (habit.afterHabitId) {
    const parent = allHabits.find((h) => h.id === habit.afterHabitId);
    if (parent) {
      return `After ${parent.name} → ${habit.name}`;
    }
  }

  return null;
}

/**
 * Finds all habits directly anchored to (triggered after) the given habit ID.
 */
export function getHabitsTriggeredBy(triggerHabitId: string, allHabits: Habit[]): Habit[] {
  return allHabits.filter((h) => !h.archivedAt && h.afterHabitId === triggerHabitId);
}

/**
 * Resolves the forward execution chain starting from an initial habit ID,
 * preventing infinite cycles with cycle detection.
 */
export function getHabitChain(startHabitId: string, allHabits: Habit[]): Habit[] {
  const chain: Habit[] = [];
  const visited = new Set<string>();

  let currentId: string | undefined = startHabitId;

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const triggered = getHabitsTriggeredBy(currentId, allHabits);
    if (triggered.length === 0) break;
    const next = triggered[0];
    chain.push(next);
    currentId = next.id;
  }

  return chain;
}

/**
 * Generates an encouraging contextual notification or prompt for a habit.
 */
export function generateContextualPrompt(habit: Habit, allHabits: Habit[]): string {
  const cue = formatCueAnchor(habit, allHabits);
  if (cue) {
    return `Momentum Anchor: ${cue}`;
  }
  return `Time for your daily spark: ${habit.name}!`;
}
