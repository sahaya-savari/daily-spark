import {
  Apple, Bike, BookOpen, Brain, Code, Coffee, Droplet, Dumbbell, Flame, Flower2, Footprints,
  HandHeart, Heart, Languages, Laptop, Leaf, Lightbulb, Moon, Music, NotebookPen, Palette,
  PenLine, Pill, Salad, Smile, Sprout, Star, Sun, Target, Timer, Wallet, Waves, Wind,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_SWATCH, type Habit } from "./types";

/**
 * Line-icon set for habits. `emoji` is kept only so backups stay readable
 * by the original Daily Spark Android app; it is never rendered.
 */
export const HABIT_ICONS: { key: string; label: string; Icon: LucideIcon; emoji: string }[] = [
  { key: "flame", label: "Spark", Icon: Flame, emoji: "🔥" },
  { key: "dumbbell", label: "Strength", Icon: Dumbbell, emoji: "💪" },
  { key: "run", label: "Run", Icon: Footprints, emoji: "🏃" },
  { key: "bike", label: "Cycle", Icon: Bike, emoji: "🚴" },
  { key: "swim", label: "Swim", Icon: Waves, emoji: "🏊" },
  { key: "mindful", label: "Meditate", Icon: Flower2, emoji: "🧘" },
  { key: "breathe", label: "Breathe", Icon: Wind, emoji: "🌬️" },
  { key: "water", label: "Water", Icon: Droplet, emoji: "💧" },
  { key: "food", label: "Eat well", Icon: Salad, emoji: "🥗" },
  { key: "fruit", label: "Fruit", Icon: Apple, emoji: "🍎" },
  { key: "sleep", label: "Sleep", Icon: Moon, emoji: "💤" },
  { key: "morning", label: "Morning", Icon: Sun, emoji: "☀️" },
  { key: "read", label: "Read", Icon: BookOpen, emoji: "📚" },
  { key: "write", label: "Write", Icon: PenLine, emoji: "✍️" },
  { key: "journal", label: "Journal", Icon: NotebookPen, emoji: "📝" },
  { key: "learn", label: "Learn", Icon: Brain, emoji: "🧠" },
  { key: "language", label: "Language", Icon: Languages, emoji: "🗣️" },
  { key: "code", label: "Code", Icon: Code, emoji: "💻" },
  { key: "work", label: "Deep work", Icon: Laptop, emoji: "🖥️" },
  { key: "focus", label: "Focus", Icon: Target, emoji: "🎯" },
  { key: "timer", label: "Timer", Icon: Timer, emoji: "⏱️" },
  { key: "idea", label: "Ideas", Icon: Lightbulb, emoji: "💡" },
  { key: "art", label: "Art", Icon: Palette, emoji: "🎨" },
  { key: "music", label: "Music", Icon: Music, emoji: "🎵" },
  { key: "grow", label: "Grow", Icon: Sprout, emoji: "🌱" },
  { key: "nature", label: "Nature", Icon: Leaf, emoji: "🍃" },
  { key: "heart", label: "Care", Icon: Heart, emoji: "❤️" },
  { key: "gratitude", label: "Gratitude", Icon: HandHeart, emoji: "🙏" },
  { key: "mood", label: "Mood", Icon: Smile, emoji: "🙂" },
  { key: "star", label: "Goal", Icon: Star, emoji: "🌟" },
  { key: "meds", label: "Meds", Icon: Pill, emoji: "💊" },
  { key: "money", label: "Money", Icon: Wallet, emoji: "💰" },
  { key: "coffee", label: "Less coffee", Icon: Coffee, emoji: "☕" },
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

export function getIcon(key: string): LucideIcon {
  return BY_KEY.get(key)?.Icon ?? Flame;
}

/** Rounded tile with the habit's line icon, tinted by its color tag. */
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
      <Icon className={ic} strokeWidth={1.9} />
    </span>
  );
}
