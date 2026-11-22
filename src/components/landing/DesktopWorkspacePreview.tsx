import { useState } from "react";
import {
  CalendarCheck2,
  CheckSquare,
  BarChart3,
  Calendar,
  Settings,
  Plus,
  Search,
  Flame,
  Check,
  ShieldCheck,
  FolderOpen,
  BookOpen,
  Droplets,
  Footprints,
  Sparkles,
} from "lucide-react";
import { SparkMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

interface HabitItem {
  id: string;
  name: string;
  category: string;
  icon: typeof BookOpen;
  streak: number;
  done: boolean;
  notes?: string;
  color: string;
}

const INITIAL_HABITS: HabitItem[] = [
  {
    id: "1",
    name: "Read 20 minutes",
    category: "Study",
    icon: BookOpen,
    streak: 12,
    done: true,
    notes: "Chapter 3: How small habits compound over 1 year.",
    color: "#EC894C",
  },
  {
    id: "2",
    name: "Drink 2.5L Water",
    category: "Health",
    icon: Droplets,
    streak: 31,
    done: true,
    notes: "Target reached with morning hydration boost.",
    color: "#60A5FA",
  },
  {
    id: "3",
    name: "Evening walk",
    category: "Health",
    icon: Footprints,
    streak: 4,
    done: false,
    notes: "Calm 30-min walk after dinner.",
    color: "#34D399",
  },
  {
    id: "4",
    name: "Meditate & breathe",
    category: "Mindfulness",
    icon: Sparkles,
    streak: 8,
    done: false,
    notes: "Gentle breathwork before sleep.",
    color: "#A78BFA",
  },
];

export function DesktopWorkspacePreview({ className }: { className?: string }) {
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);
  const [activeTab, setActiveTab] = useState<"Today" | "Habits" | "Progress" | "Calendar" | "Settings">("Today");
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Starred">("All");

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextDone = !h.done;
          return {
            ...h,
            done: nextDone,
            streak: nextDone ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const doneCount = habits.filter((h) => h.done).length;

  return (
    <div
      className={cn(
        "relative w-full max-w-[960px] overflow-hidden rounded-2xl border border-[#363B48] bg-[#0E0F12] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.9),0_12px_30px_-12px_rgba(0,0,0,0.6)] select-none text-left",
        className
      )}
    >
      {/* Window Title Bar */}
      <div className="flex h-11 items-center justify-between border-b border-[#262A34] bg-[#14161D] px-4">
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
          <span className="size-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <span className="size-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
          <span className="ml-3 hidden sm:inline-flex items-center gap-1.5 font-mono text-xs text-[#8A92A3]">
            <SparkMark className="size-3.5 text-ember" />
            <span>Daily Spark</span>
            <span className="text-[#555A68]">/</span>
            <span className="text-[#A0A6B4]">Desktop Workspace</span>
          </span>
        </div>

        {/* Global Search Pill Bar */}
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-[#262A34] bg-[#090A0D] px-3 py-1 text-xs text-[#737B8C] w-64">
          <Search className="size-3.5" />
          <span className="truncate">Search habits or jump...</span>
          <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-1 py-0.2 font-mono text-[10px] text-[#A0A6B4]">
            Ctrl K
          </kbd>
        </div>

        {/* Status Environment Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1A1D26] px-2.5 py-1 text-[11px] font-mono text-[#A0A6B4]">
            <ShieldCheck className="size-3 text-emerald-400" />
            <span>100% Offline</span>
          </span>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid */}
      <div className="flex min-h-[440px]">
        {/* Left Sidebar Nav Rail */}
        <aside className="hidden sm:flex w-[190px] shrink-0 flex-col border-r border-[#262A34] bg-[#111318] p-3 text-xs">
          {/* Quick Action Button */}
          <button
            type="button"
            className="mb-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#EC894C] to-[#D96B27] py-2 px-3 font-semibold text-[#090A0D] shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="size-3.5 stroke-[2.5]" />
            <span>New habit</span>
          </button>

          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-[#737B8C]">
              Navigation
            </span>
            {([
              { id: "Today", icon: CalendarCheck2, count: `${doneCount}/4` },
              { id: "Habits", icon: CheckSquare, count: "4" },
              { id: "Progress", icon: BarChart3, count: undefined },
              { id: "Calendar", icon: Calendar, count: undefined },
              { id: "Settings", icon: Settings, count: undefined },
            ] as const).map(({ id, icon: Icon, count }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-[#1E222B] text-white border border-[#363B48] shadow-sm"
                      : "text-[#A0A6B4] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn("size-3.5", active ? "text-ember" : "text-[#737B8C]")} />
                    <span>{id}</span>
                  </span>
                  {count && (
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.2 font-mono text-[10px]",
                        active ? "bg-ember/20 text-ember" : "bg-white/5 text-[#737B8C]"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Collections Section */}
          <div className="mt-5 space-y-1 border-t border-[#262A34] pt-4">
            <span className="px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-[#737B8C]">
              Collections
            </span>
            {[
              { name: "Morning Routine", dot: "#EC894C", count: 2 },
              { name: "Health & Water", dot: "#60A5FA", count: 1 },
              { name: "Deep Study", dot: "#34D399", count: 1 },
            ].map(({ name, dot, count }) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-[#8A92A3] hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  <span className="truncate">{name}</span>
                </span>
                <span className="font-mono text-[10px] text-[#555A68]">{count}</span>
              </div>
            ))}
          </div>

          {/* Storage Safe Footer */}
          <div className="mt-auto rounded-lg border border-white/5 bg-[#090A0D]/60 p-2.5 text-[11px] text-[#737B8C]">
            <p className="font-medium text-[#A0A6B4]">Local-first storage</p>
            <p className="mt-0.5 text-[10px] leading-tight">No server sync · No accounts</p>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-5 overflow-hidden flex flex-col justify-between">
          {/* Top Filter Chips & Momentum Header */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#262A34]">
              <div className="flex items-center gap-1.5">
                {(["All", "Active", "Starred"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                      activeFilter === filter
                        ? "bg-[#1E222B] text-white border border-[#363B48]"
                        : "text-[#8A92A3] hover:text-white hover:bg-white/5"
                    )}
                  >
                    {filter} {filter === "All" && `(${habits.length})`}
                  </button>
                ))}
              </div>

              {/* Day Goal Ring Progress */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#8A92A3]">Today's Goal:</span>
                <span className="font-mono font-bold text-white">
                  {doneCount} of {habits.length} done
                </span>
                <span className="inline-flex items-center gap-1 text-ember font-mono font-bold">
                  <Flame className="size-3.5 fill-ember" />
                  <span>31d best</span>
                </span>
              </div>
            </div>

            {/* Interactive Habit Cards */}
            <div className="mt-3.5 space-y-2.5">
              {habits.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleHabit(item.id)}
                    className={cn(
                      "group flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer",
                      item.done
                        ? "border-[#262A34] bg-[#14161D]/70 opacity-95"
                        : "border-[#363B48] bg-[#171A21] hover:border-ember/40 hover:bg-[#1E222B]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox Trigger */}
                      <button
                        type="button"
                        aria-label={`Toggle ${item.name}`}
                        className={cn(
                          "grid size-7 place-items-center rounded-lg border transition-all shrink-0",
                          item.done
                            ? "border-ember bg-ember text-[#090A0D]"
                            : "border-white/20 bg-white/5 text-transparent group-hover:border-ember/60"
                        )}
                      >
                        <Check className="size-4 stroke-[2.5]" />
                      </button>

                      {/* Icon + Title */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <p
                            className={cn(
                              "text-sm font-semibold truncate",
                              item.done ? "text-[#8A92A3] line-through" : "text-white"
                            )}
                          >
                            {item.name}
                          </p>
                          <span className="hidden sm:inline-block rounded bg-white/5 px-1.5 py-0.2 font-mono text-[10px] text-[#737B8C]">
                            {item.category}
                          </span>
                        </div>
                        {item.notes && (
                          <p className="mt-0.5 text-xs text-[#737B8C] truncate max-w-[320px]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Streak Count Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#A0A6B4]">
                        <Flame
                          className={cn(
                            "size-3.5",
                            item.done ? "text-ember fill-ember" : "text-[#737B8C]"
                          )}
                        />
                        <span>{item.streak}d</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Dither Heatmap Preview & Stats */}
          <div className="mt-4 rounded-xl border border-[#262A34] bg-[#090A0D]/75 p-3">
            <div className="flex items-center justify-between text-xs text-[#8A92A3] mb-2">
              <span className="font-mono text-[11px] font-medium">Activity & Consistency Matrix</span>
              <span className="font-mono text-[11px] text-ember font-semibold">18 perfect days</span>
            </div>

            {/* Micro Heatmap Grid */}
            <div className="grid grid-flow-col grid-rows-4 gap-1 overflow-hidden py-0.5">
              {Array.from({ length: 48 }).map((_, i) => {
                const level =
                  i % 7 === 0
                    ? "bg-[#BF7245]"
                    : i % 5 === 0
                    ? "bg-[#8F4E2B]"
                    : i % 3 === 0
                    ? "bg-[#5A3320]"
                    : i % 2 === 0
                    ? "bg-[#2E1B13]"
                    : "bg-white/[0.04]";
                return (
                  <div
                    key={i}
                    className={cn("size-2 rounded-[2px] transition-colors", level)}
                    title={`Day ${i + 1}`}
                  />
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[#555A68]">
              <span>24-week history</span>
              <div className="flex items-center gap-1">
                <span>Less</span>
                <span className="size-1.5 rounded-[1px] bg-white/[0.04]" />
                <span className="size-1.5 rounded-[1px] bg-[#2E1B13]" />
                <span className="size-1.5 rounded-[1px] bg-[#5A3320]" />
                <span className="size-1.5 rounded-[1px] bg-[#BF7245]" />
                <span>More</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
