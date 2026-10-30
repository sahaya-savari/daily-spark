import React, { useMemo } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  PixelHome,
  PixelCheckList,
  PixelChart,
  PixelSettings,
  PixelCheck,
  PixelPlus,
  PixelFire,
} from "@/components/ui/pixel-icon";
import { Palette } from "lucide-react";
import { type Habit } from "@/lib/habits/types";
import { type ThemeMode, THEME_CONFIGS } from "@/lib/habits/appearance";
import { isDoneOn, isArchived } from "@/lib/habits/logic";
import { todayKey } from "@/lib/habits/dates";
import { cn } from "@/lib/utils";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habits?: Habit[];
  onSelectTab: (tab: number) => void;
  onToggleHabit: (id: string) => void;
  theme: string;
  onToggleTheme: () => void;
  onOpenAddHabit?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  habits = [],
  onSelectTab,
  onToggleHabit,
  theme,
  onToggleTheme,
  onOpenAddHabit,
}: CommandPaletteProps) {
  const today = todayKey();
  const activeHabits = useMemo(
    () => (Array.isArray(habits) ? habits : []).filter((h) => Boolean(h && !isArchived(h))),
    [habits]
  );

  const isMac =
    typeof navigator !== "undefined" &&
    /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Command Palette</DialogTitle>
      <DialogDescription className="sr-only">
        Quick navigation, habit check-in, and appearance settings
      </DialogDescription>
      <CommandInput
        placeholder="Type a command, habit name, or search..."
        className="pr-8"
      />
      <CommandList className="max-h-[380px] p-2">
        <CommandEmpty>No matching habits or commands found.</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          <CommandItem
            value="Today Home Dashboard 1"
            onSelect={() => {
              onSelectTab(0);
              onOpenChange(false);
            }}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-foreground">
                <PixelHome className="size-4" />
              </span>
              <span className="font-semibold text-sm">Today</span>
            </div>
            <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
              {isMac ? "⌘1" : "Alt+1"}
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="Habits Library List 2"
            onSelect={() => {
              onSelectTab(1);
              onOpenChange(false);
            }}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-foreground">
                <PixelCheckList className="size-4" />
              </span>
              <span className="font-semibold text-sm">Habits</span>
            </div>
            <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
              {isMac ? "⌘2" : "Alt+2"}
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="Progress Stats Statistics Momentum Calendar 3"
            onSelect={() => {
              onSelectTab(2);
              onOpenChange(false);
            }}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-foreground">
                <PixelChart className="size-4" />
              </span>
              <span className="font-semibold text-sm">Progress &amp; Stats</span>
            </div>
            <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
              {isMac ? "⌘3" : "Alt+3"}
            </CommandShortcut>
          </CommandItem>

          <CommandItem
            value="Settings Preferences Appearance Backup Privacy 4"
            onSelect={() => {
              onSelectTab(3);
              onOpenChange(false);
            }}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-foreground">
                <PixelSettings className="size-4" />
              </span>
              <span className="font-semibold text-sm">Settings</span>
            </div>
            <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
              {isMac ? "⌘4" : "Alt+4"}
            </CommandShortcut>
          </CommandItem>

          {onOpenAddHabit && (
            <CommandItem
              value="Add New Habit Create Plus"
              onSelect={() => {
                onOpenAddHabit();
                onOpenChange(false);
              }}
              className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-lg bg-ember-soft text-ember">
                  <PixelPlus className="size-4" />
                </span>
                <span className="font-semibold text-sm text-ember">Create New Habit</span>
              </div>
              <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
                N
              </CommandShortcut>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator className="my-2" />

        {/* Habits Group */}
        {activeHabits.length > 0 && (
          <>
            <CommandGroup heading="Habits (Check-in / Toggle)">
              {activeHabits.map((h) => {
                const done = Array.isArray(h.completedDates) ? isDoneOn(h, today) : false;
                return (
                  <CommandItem
                    key={h.id}
                    value={`${h.name || ""} ${h.id} ${h.category || ""} ${h.notes || ""} habit ${done ? "done completed" : "pending checkin"}`}
                    onSelect={() => {
                      onToggleHabit(h.id);
                      onOpenChange(false);
                    }}
                    className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-full text-xs transition-colors",
                          done
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                            : "border border-border/60 bg-surface-2 text-muted-foreground"
                        )}
                      >
                        {done ? <PixelCheck className="size-3.5" /> : null}
                      </span>
                      <span className="text-base select-none">{h.emoji || "✨"}</span>
                      <div className="min-w-0">
                        <p className={cn("text-sm font-semibold truncate", done && "text-muted-foreground line-through")}>
                          {h.name}
                        </p>
                        {h.category && (
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {h.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {h.currentStreak > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-ember-soft px-2 py-0.5 text-[11px] font-bold text-ember">
                          <PixelFire className="size-3" /> {h.currentStreak}d
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-[11px] font-semibold rounded-md px-2 py-0.5",
                          done
                            ? "bg-surface-2 text-muted-foreground"
                            : "bg-ember/15 text-ember"
                        )}
                      >
                        {done ? "Completed" : "Check In"}
                      </span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator className="my-2" />
          </>
        )}

        {/* Theme & Appearance Group */}
        <CommandGroup heading="Appearance">
          <CommandItem
            value="Toggle Theme Switch Mode Appearance Classic Minimal Expressive"
            onSelect={() => {
              onToggleTheme();
              onOpenChange(false);
            }}
            className="flex items-center justify-between cursor-pointer py-2.5 px-3 rounded-xl transition-colors hover:bg-surface-2 aria-selected:bg-surface-2 aria-selected:text-ember"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-ember">
                <Palette className="size-4" />
              </span>
              <div>
                <p className="font-semibold text-sm">Toggle Theme</p>
                <p className="text-[11px] text-muted-foreground">
                  Current: {THEME_CONFIGS[theme as ThemeMode]?.name || theme}
                </p>
              </div>
            </div>
            <CommandShortcut className="text-[11px] font-mono text-muted-foreground">
              Cycle
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>

      {/* Palette Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-border/40 bg-surface/50 px-3.5 py-2 text-[11px] text-muted-foreground select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/60 bg-surface-2 px-1 py-0.5 font-mono text-[9px]">↑</kbd>
            <kbd className="rounded border border-border/60 bg-surface-2 px-1 py-0.5 font-mono text-[9px]">↓</kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border/60 bg-surface-2 px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
            <span>Select</span>
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="rounded border border-border/60 bg-surface-2 px-1 py-0.5 font-mono text-[9px]">esc</kbd>
          <span>Close</span>
        </span>
      </div>
    </CommandDialog>
  );
}
