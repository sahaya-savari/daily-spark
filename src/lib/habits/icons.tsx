import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { COLOR_SWATCH, type Habit } from "./types";
import {
  Flame,
  Dumbbell,
  Footprints,
  Bike,
  Waves,
  Brain,
  Wind,
  Droplet,
  Salad,
  Apple,
  Moon,
  Sunrise,
  BookOpen,
  PenTool,
  BookMarked,
  GraduationCap,
  Languages,
  Code2,
  Laptop,
  Target,
  Timer,
  Lightbulb,
  Palette,
  Music,
  Sprout,
  Leaf,
  Heart,
  HeartHandshake,
  Smile,
  Star,
  Pill,
  Coins,
  Coffee,
} from "lucide-react";

export interface HabitIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export type HabitIconComponent = ComponentType<HabitIconProps>;

function wrapLucide(
  IconComponent: ComponentType<{
    className?: string;
    size?: number | string;
    strokeWidth?: number;
  }>
) {
  return function WrappedHabitIcon({ className, size = 20, ...props }: HabitIconProps) {
    return (
      <IconComponent
        className={cn("inline-block shrink-0", className)}
        size={size}
        strokeWidth={2}
        {...(props as Record<string, unknown>)}
      />
    );
  };
}

/**
 * Habit icon set using modern, crisp, open-source Lucide React icons (ISC License).
 * `emoji` is kept only so backups stay readable by the original Daily Spark Android app.
 */
export const HABIT_ICONS: { key: string; label: string; Icon: HabitIconComponent; emoji: string }[] = [
  { key: "flame", label: "Spark", Icon: wrapLucide(Flame), emoji: "🔥" },
  { key: "dumbbell", label: "Strength", Icon: wrapLucide(Dumbbell), emoji: "💪" },
  { key: "run", label: "Run", Icon: wrapLucide(Footprints), emoji: "🏃" },
  { key: "bike", label: "Cycle", Icon: wrapLucide(Bike), emoji: "🚴" },
  { key: "swim", label: "Swim", Icon: wrapLucide(Waves), emoji: "🏊" },
  { key: "mindful", label: "Meditate", Icon: wrapLucide(Brain), emoji: "🧘" },
  { key: "breathe", label: "Breathe", Icon: wrapLucide(Wind), emoji: "🌬️" },
  { key: "water", label: "Water", Icon: wrapLucide(Droplet), emoji: "💧" },
  { key: "food", label: "Eat well", Icon: wrapLucide(Salad), emoji: "🥗" },
  { key: "fruit", label: "Fruit", Icon: wrapLucide(Apple), emoji: "🍎" },
  { key: "sleep", label: "Sleep", Icon: wrapLucide(Moon), emoji: "💤" },
  { key: "morning", label: "Morning", Icon: wrapLucide(Sunrise), emoji: "☀️" },
  { key: "read", label: "Read", Icon: wrapLucide(BookOpen), emoji: "📚" },
  { key: "write", label: "Write", Icon: wrapLucide(PenTool), emoji: "✍️" },
  { key: "journal", label: "Journal", Icon: wrapLucide(BookMarked), emoji: "📝" },
  { key: "learn", label: "Learn", Icon: wrapLucide(GraduationCap), emoji: "🧠" },
  { key: "language", label: "Language", Icon: wrapLucide(Languages), emoji: "🗣️" },
  { key: "code", label: "Code", Icon: wrapLucide(Code2), emoji: "💻" },
  { key: "work", label: "Deep work", Icon: wrapLucide(Laptop), emoji: "🖥️" },
  { key: "focus", label: "Focus", Icon: wrapLucide(Target), emoji: "🎯" },
  { key: "timer", label: "Timer", Icon: wrapLucide(Timer), emoji: "⏱️" },
  { key: "idea", label: "Ideas", Icon: wrapLucide(Lightbulb), emoji: "💡" },
  { key: "art", label: "Art", Icon: wrapLucide(Palette), emoji: "🎨" },
  { key: "music", label: "Music", Icon: wrapLucide(Music), emoji: "🎵" },
  { key: "grow", label: "Grow", Icon: wrapLucide(Sprout), emoji: "🌱" },
  { key: "nature", label: "Nature", Icon: wrapLucide(Leaf), emoji: "🍃" },
  { key: "heart", label: "Care", Icon: wrapLucide(Heart), emoji: "❤️" },
  { key: "gratitude", label: "Gratitude", Icon: wrapLucide(HeartHandshake), emoji: "🙏" },
  { key: "mood", label: "Mood", Icon: wrapLucide(Smile), emoji: "🙂" },
  { key: "star", label: "Goal", Icon: wrapLucide(Star), emoji: "🌟" },
  { key: "meds", label: "Meds", Icon: wrapLucide(Pill), emoji: "💊" },
  { key: "money", label: "Money", Icon: wrapLucide(Coins), emoji: "💰" },
  { key: "coffee", label: "Less coffee", Icon: wrapLucide(Coffee), emoji: "☕" },
];

const BY_KEY = new Map(HABIT_ICONS.map((i) => [i.key, i]));
const EXTRA_EMOJI: Record<string, string> = { "🏋️": "dumbbell", "⭐": "star", "🌞": "morning" };
const bare = (e: string) => e.replace(/\uFE0F/g, "");
const BY_EMOJI = new Map<string, string>(
  [...HABIT_ICONS.map((i) => [i.emoji, i.key] as [string, string]), ...Object.entries(EXTRA_EMOJI)].map(
    ([e, k]) => [bare(e), k] as [string, string],
  ),
);

const DefaultFallbackIcon = wrapLucide(Flame);

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
  return BY_KEY.get(key)?.Icon ?? DefaultFallbackIcon;
}

/** Rounded tile with the habit's icon, tinted by its color tag. */
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
      className={cn("habit-icon grid shrink-0 place-items-center border border-border bg-surface-2", box, className)}
      style={{ color: tint }}
    >
      <Icon className={ic} />
    </span>
  );
}
