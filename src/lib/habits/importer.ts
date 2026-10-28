import { createHabit, normalizeDates, refresh } from "./logic";
import { isValidKey } from "./dates";
import type { Habit } from "./types";

export type ImportFormat =
  | "loop"
  | "habitkit"
  | "habitica"
  | "habitbull"
  | "matrix_csv"
  | "standard_csv"
  | "dailyspark_json";

export interface ImportResult {
  format: ImportFormat;
  formatLabel: string;
  habits: Habit[];
  totalImported: number;
}

/**
 * Universal multi-format importer supporting Loop, HabitKit, Habitica, HabitBull, and CSV formats.
 */
export function detectAndParseImport(rawText: string, today: string): ImportResult {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return {
      format: "standard_csv",
      formatLabel: "Empty",
      habits: [],
      totalImported: 0,
    };
  }

  // 1. Try JSON formats (HabitKit, Habitica, DailySpark)
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);

      // HabitKit: { habits: [ { name, completions: [...] } ] }
      if (parsed && typeof parsed === "object" && Array.isArray(parsed.habits)) {
        const first = parsed.habits[0];
        if (first && (Array.isArray(first.completions) || first.colorHex || first.iconName)) {
          const habits = parsed.habits.map((item: {
            name?: string;
            title?: string;
            completions?: string[];
            colorHex?: string;
            iconName?: string;
          }) => {
            const name = item.name || item.title || "Imported Habit";
            const dates = Array.isArray(item.completions) ? normalizeDates(item.completions) : [];
            const habit = createHabit({ name, emoji: "⚡" }, today);
            return refresh({
              ...habit,
              completedDates: dates,
            }, today);
          });

          return {
            format: "habitkit",
            formatLabel: "HabitKit JSON",
            habits,
            totalImported: habits.length,
          };
        }
      }

      // Habitica JSON: { tasks: [ { text, type: "habit", history: [...] } ] } or { data: { habits: [...] } }
      const tasks = parsed?.tasks || parsed?.data?.tasks || (Array.isArray(parsed) ? parsed : null);
      if (Array.isArray(tasks) && tasks.some((t) => t.text || t.type === "habit")) {
        const habits = tasks
          .filter((t) => t && (t.type === "habit" || t.type === "daily" || t.text))
          .map((t: { text?: string; notes?: string; history?: Array<{ date?: number | string; value?: number }> }) => {
            const name = t.text || "Habitica Habit";
            const dates: string[] = [];
            if (Array.isArray(t.history)) {
              for (const entry of t.history) {
                if (entry.date) {
                  const d = typeof entry.date === "number"
                    ? new Date(entry.date).toISOString().slice(0, 10)
                    : String(entry.date).slice(0, 10);
                  if (isValidKey(d) && (entry.value === undefined || entry.value > 0)) {
                    dates.push(d);
                  }
                }
              }
            }
            const habit = createHabit({ name, emoji: "⚔️", notes: t.notes || "" }, today);
            return refresh({
              ...habit,
              completedDates: normalizeDates(dates),
            }, today);
          });

        return {
          format: "habitica",
          formatLabel: "Habitica JSON",
          habits,
          totalImported: habits.length,
        };
      }

      // DailySpark native JSON backup: array or { habits: [...] }
      const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed.habits) ? parsed.habits : [];
      if (list.length > 0 && (list[0].completedDates !== undefined || list[0].currentStreak !== undefined)) {
        const habits = list.map((item: Partial<Habit>) =>
          refresh(
            createHabit(
              {
                name: item.name || "Imported Habit",
                emoji: item.emoji || "🔥",
                completedDates: normalizeDates(item.completedDates),
                ...item,
              },
              today
            ),
            today
          )
        );

        return {
          format: "dailyspark_json",
          formatLabel: "Daily Spark JSON",
          habits,
          totalImported: habits.length,
        };
      }
    } catch {
      // Continue to CSV parsing
    }
  }

  // 2. CSV parsing
  const lines = trimmed
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      format: "standard_csv",
      formatLabel: "Empty",
      habits: [],
      totalImported: 0,
    };
  }

  // Check for HabitBull CSV (HabitName, Category, Description, Date, Status...)
  const headerLine = lines[0].toLowerCase();
  if (headerLine.includes("habitname") && headerLine.includes("status")) {
    const habitMap = new Map<string, Set<string>>();
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvRow(lines[i]);
      if (parts.length >= 4) {
        const name = parts[0];
        const dateRaw = parts[3];
        const status = parts[4]?.toLowerCase();
        const date = dateRaw?.slice(0, 10);

        if (name && isValidKey(date) && (status === "1" || status === "success" || status === "yes" || status === "done")) {
          if (!habitMap.has(name)) habitMap.set(name, new Set());
          habitMap.get(name)!.add(date);
        }
      }
    }

    const habits = Array.from(habitMap.entries()).map(([name, dates]) => {
      const h = createHabit({ name, emoji: "🎯" }, today);
      return refresh({ ...h, completedDates: normalizeDates([...dates]) }, today);
    });

    return {
      format: "habitbull",
      formatLabel: "HabitBull CSV",
      habits,
      totalImported: habits.length,
    };
  }

  // Check for Loop Habit Tracker CSV (either begins with '# ' or header: Date, Habit1, Habit2...)
  const isLoop = lines.some((l) => l.startsWith("# Habit") || l.startsWith("# Checkmarks"));
  if (isLoop) {
    let currentHabitName = "Loop Habit";
    const habitMap = new Map<string, Set<string>>();

    for (const line of lines) {
      if (line.startsWith("#")) {
        const match = line.match(/^#\s*(.+)$/);
        if (match && match[1] && !match[1].toLowerCase().includes("checkmarks")) {
          currentHabitName = match[1].trim();
        }
        continue;
      }

      const parts = parseCsvRow(line);
      if (parts.length >= 2) {
        const date = parts[0].slice(0, 10);
        const val = parts[1];
        if (isValidKey(date) && (val === "1" || val === "2" || Number(val) > 0)) {
          if (!habitMap.has(currentHabitName)) habitMap.set(currentHabitName, new Set());
          habitMap.get(currentHabitName)!.add(date);
        }
      }
    }

    const habits = Array.from(habitMap.entries()).map(([name, dates]) => {
      const h = createHabit({ name, emoji: "🔁" }, today);
      return refresh({ ...h, completedDates: normalizeDates([...dates]) }, today);
    });

    return {
      format: "loop",
      formatLabel: "Loop Habit Tracker CSV",
      habits,
      totalImported: habits.length,
    };
  }

  // Check for Matrix CSV (Date, Habit A, Habit B, Habit C)
  const headerParts = parseCsvRow(lines[0]);
  if (headerParts.length > 2 && (headerParts[0].toLowerCase() === "date" || isValidKey(headerParts[0]))) {
    const habitNames = headerParts.slice(1).map((h) => h.trim());
    const habitDates = habitNames.map(() => new Set<string>());

    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvRow(lines[i]);
      const date = parts[0]?.trim();
      if (!isValidKey(date)) continue;

      for (let c = 1; c < parts.length && c <= habitNames.length; c++) {
        const val = parts[c]?.trim().toLowerCase();
        if (val === "1" || val === "true" || val === "yes" || val === "x" || val === "done") {
          habitDates[c - 1].add(date);
        }
      }
    }

    const habits = habitNames.map((name, idx) => {
      const h = createHabit({ name, emoji: "📊" }, today);
      return refresh({ ...h, completedDates: normalizeDates([...habitDates[idx]]) }, today);
    });

    return {
      format: "matrix_csv",
      formatLabel: "Matrix CSV",
      habits,
      totalImported: habits.length,
    };
  }

  // Standard generic CSV: "Habit,Date" or "Name,Date1,Date2..."
  const habitMap = new Map<string, Set<string>>();
  for (let i = 0; i < lines.length; i++) {
    if (i === 0 && (headerLine.includes("name") || headerLine.includes("habit"))) continue;
    const parts = parseCsvRow(lines[i]);
    if (parts.length >= 2) {
      const name = parts[0].trim();
      if (!name) continue;

      if (!habitMap.has(name)) habitMap.set(name, new Set());
      for (let c = 1; c < parts.length; c++) {
        const item = parts[c].trim();
        if (!item) continue;
        const sub = item.split(/[;,]/).map((d) => d.trim()).filter(isValidKey);
        if (isValidKey(item)) {
          habitMap.get(name)!.add(item);
        } else {
          sub.forEach((d) => habitMap.get(name)!.add(d));
        }
      }
    }
  }

  const habits = Array.from(habitMap.entries()).map(([name, dates]) => {
    const h = createHabit({ name, emoji: "✨" }, today);
    return refresh({ ...h, completedDates: normalizeDates([...dates]) }, today);
  });

  return {
    format: "standard_csv",
    formatLabel: "CSV Format",
    habits,
    totalImported: habits.length,
  };
}

/**
 * Splits a CSV row respecting quotes.
 */
function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

