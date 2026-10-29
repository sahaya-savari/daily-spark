import type { ComponentType } from "react";
import {
  PixelBolt,
  PixelBook,
  PixelClock,
  PixelCode,
  PixelFire,
  PixelHeart,
  PixelIconProps,
  PixelLightbulb,
  PixelMoon,
  PixelMusic,
  PixelNotebook,
  PixelPen,
  PixelSparkles,
  PixelStar,
  PixelSun,
  PixelTrophy,
} from "@/components/ui/pixel-icon";
import { cn } from "@/lib/utils";
import { COLOR_SWATCH, type Habit } from "./types";

export type HabitIconComponent = ComponentType<PixelIconProps>;

/**
 * Pixel-icon set for habits strictly derived from D:\SOURCES.
 * `emoji` is kept only so backups stay readable by the original Daily Spark Android app.
 */
export const HABIT_ICONS: { key: string; label: string; Icon: HabitIconComponent; emoji: string }[] = [
  { key: "flame", label: "Spark", Icon: PixelFire, emoji: "🔥" },
  { key: "dumbbell", label: "Strength", Icon: PixelBolt, emoji: "💪" },
  { key: "run", label: "Run", Icon: PixelFire, emoji: "🏃" },
  { key: "bike", label: "Cycle", Icon: PixelBolt, emoji: "🚴" },
  { key: "swim", label: "Swim", Icon: PixelSparkles, emoji: "🏊" },
  { key: "mindful", label: "Meditate", Icon: PixelSun, emoji: "🧘" },
  { key: "breathe", label: "Breathe", Icon: PixelSparkles, emoji: "🌬️" },
  { key: "water", label: "Water", Icon: PixelSparkles, emoji: "💧" },
  { key: "food", label: "Eat well", Icon: PixelSun, emoji: "🥗" },
  { key: "fruit", label: "Fruit", Icon: PixelHeart, emoji: "🍎" },
  { key: "sleep", label: "Sleep", Icon: PixelMoon, emoji: "💤" },
  { key: "morning", label: "Morning", Icon: PixelSun, emoji: "☀️" },
  { key: "read", label: "Read", Icon: PixelBook, emoji: "📚" },
  { key: "write", label: "Write", Icon: PixelPen, emoji: "✍️" },
  { key: "journal", label: "Journal", Icon: PixelNotebook, emoji: "📝" },
  { key: "learn", label: "Learn", Icon: PixelLightbulb, emoji: "🧠" },
  { key: "language", label: "Language", Icon: PixelBook, emoji: "🗣️" },
  { key: "code", label: "Code", Icon: PixelCode, emoji: "💻" },
  { key: "work", label: "Deep work", Icon: PixelCode, emoji: "🖥️" },
  { key: "focus", label: "Focus", Icon: PixelTrophy, emoji: "🎯" },
  { key: "timer", label: "Timer", Icon: PixelClock, emoji: "⏱️" },
  { key: "idea", label: "Ideas", Icon: PixelLightbulb, emoji: "💡" },
  { key: "art", label: "Art", Icon: PixelSparkles, emoji: "🎨" },
  { key: "music", label: "Music", Icon: PixelMusic, emoji: "🎵" },
  { key: "grow", label: "Grow", Icon: PixelSun, emoji: "🌱" },
  { key: "nature", label: "Nature", Icon: PixelSun, emoji: "🍃" },
  { key: "heart", label: "Care", Icon: PixelHeart, emoji: "❤️" },
  { key: "gratitude", label: "Gratitude", Icon: PixelHeart, emoji: "🙏" },
  { key: "mood", label: "Mood", Icon: PixelStar, emoji: "🙂" },
  { key: "star", label: "Goal", Icon: PixelStar, emoji: "🌟" },
  { key: "meds", label: "Meds", Icon: PixelHeart, emoji: "💊" },
  { key: "money", label: "Money", Icon: PixelTrophy, emoji: "💰" },
  { key: "coffee", label: "Less coffee", Icon: PixelSun, emoji: "☕" },
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
  return BY_KEY.get(key)?.Icon ?? PixelFire;
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
