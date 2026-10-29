import type { ComponentType } from "react";
import {
  MaterialBolt,
  MaterialBook,
  MaterialClock,
  MaterialCode,
  MaterialFlame,
  MaterialHeart,
  MaterialIconProps,
  MaterialLightbulb,
  MaterialMoon,
  MaterialMusic,
  MaterialPen,
  MaterialSparkles,
  MaterialStar,
  MaterialSun,
  MaterialTrophy,
} from "@/components/ui/material-icon";
import { cn } from "@/lib/utils";
import { COLOR_SWATCH, type Habit } from "./types";

export type HabitIconComponent = ComponentType<MaterialIconProps>;

/**
 * Habit icon set using official Google Material Design Icons (Apache 2.0).
 * `emoji` is kept only so backups stay readable by the original Daily Spark Android app.
 */
export const HABIT_ICONS: { key: string; label: string; Icon: HabitIconComponent; emoji: string }[] = [
  { key: "flame", label: "Spark", Icon: MaterialFlame, emoji: "🔥" },
  { key: "dumbbell", label: "Strength", Icon: MaterialBolt, emoji: "💪" },
  { key: "run", label: "Run", Icon: MaterialFlame, emoji: "🏃" },
  { key: "bike", label: "Cycle", Icon: MaterialBolt, emoji: "🚴" },
  { key: "swim", label: "Swim", Icon: MaterialSparkles, emoji: "🏊" },
  { key: "mindful", label: "Meditate", Icon: MaterialSun, emoji: "🧘" },
  { key: "breathe", label: "Breathe", Icon: MaterialSparkles, emoji: "🌬️" },
  { key: "water", label: "Water", Icon: MaterialSparkles, emoji: "💧" },
  { key: "food", label: "Eat well", Icon: MaterialSun, emoji: "🥗" },
  { key: "fruit", label: "Fruit", Icon: MaterialHeart, emoji: "🍎" },
  { key: "sleep", label: "Sleep", Icon: MaterialMoon, emoji: "💤" },
  { key: "morning", label: "Morning", Icon: MaterialSun, emoji: "☀️" },
  { key: "read", label: "Read", Icon: MaterialBook, emoji: "📚" },
  { key: "write", label: "Write", Icon: MaterialPen, emoji: "✍️" },
  { key: "journal", label: "Journal", Icon: MaterialPen, emoji: "📝" },
  { key: "learn", label: "Learn", Icon: MaterialLightbulb, emoji: "🧠" },
  { key: "language", label: "Language", Icon: MaterialBook, emoji: "🗣️" },
  { key: "code", label: "Code", Icon: MaterialCode, emoji: "💻" },
  { key: "work", label: "Deep work", Icon: MaterialCode, emoji: "🖥️" },
  { key: "focus", label: "Focus", Icon: MaterialTrophy, emoji: "🎯" },
  { key: "timer", label: "Timer", Icon: MaterialClock, emoji: "⏱️" },
  { key: "idea", label: "Ideas", Icon: MaterialLightbulb, emoji: "💡" },
  { key: "art", label: "Art", Icon: MaterialSparkles, emoji: "🎨" },
  { key: "music", label: "Music", Icon: MaterialMusic, emoji: "🎵" },
  { key: "grow", label: "Grow", Icon: MaterialSun, emoji: "🌱" },
  { key: "nature", label: "Nature", Icon: MaterialSun, emoji: "🍃" },
  { key: "heart", label: "Care", Icon: MaterialHeart, emoji: "❤️" },
  { key: "gratitude", label: "Gratitude", Icon: MaterialHeart, emoji: "🙏" },
  { key: "mood", label: "Mood", Icon: MaterialStar, emoji: "🙂" },
  { key: "star", label: "Goal", Icon: MaterialStar, emoji: "🌟" },
  { key: "meds", label: "Meds", Icon: MaterialHeart, emoji: "💊" },
  { key: "money", label: "Money", Icon: MaterialTrophy, emoji: "💰" },
  { key: "coffee", label: "Less coffee", Icon: MaterialSun, emoji: "☕" },
];

const BY_KEY = new Map(HABIT_ICONS.map((i) => [i.key, i]));
const EXTRA_EMOJI: Record<string, string> = { "🏋️": "dumbbell", "⭐": "star", "🌞": "morning" };
const bare = (e: string) => e.replace(/\uFE0F/g, "");
const BY_EMOJI = new Map<string, string>(
  [...HABIT_ICONS.map((i) => [i.emoji, i.key] as [string, string]), ...Object.entries(EXTRA_EMOJI)].map(
    ([e, k]) => [bare(e), k] as [string, string],
  ),
);

/** Resolve a habit's icon key: explicit `icon`, else mapped from its legacy emoji. */
export function iconKeyFor(h: Pick<Habit, "icon" | "emoji">): string {
  if (h.icon && BY_KEY.has(h.icon)) return h.icon;
  const fromEmoji = h.emoji ? BY_EMOJI.get(bare(h.emoji)) : undefined;
  return fromEmoji ?? "flame";
}

export function emojiForIcon(key: string): string {
  return BY_KEY.get(key)?.emoji ?? "🔥";
}

export function getIcon(key: string): HabitIconComponent {
  return BY_KEY.get(key)?.Icon ?? MaterialFlame;
}

/** Rounded tile with the habit's pixel icon, tinted by its color tag. */
export function HabitIcon({
  habit,
  size = "md",
  className,
}: {
  habit: Pick<Habit, "icon" | "emoji" | "color">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = getIcon(iconKeyFor(habit));
  const tint = COLOR_SWATCH[habit.color ?? "fire"] ?? COLOR_SWATCH["fire"];
  const box = { sm: "size-8 rounded-[10px]", md: "size-11 rounded-[13px]", lg: "size-16 rounded-[20px]" }[size];
  const ic = { sm: "size-4", md: "size-5", lg: "size-7" }[size];
  return (
    <span
      className={cn("grid shrink-0 place-items-center border border-border bg-surface-2", box, className)}
      style={{ color: tint }}
    >
      <Icon className={ic} />
    </span>
  );
}
