import React from "react";
import {
  PixelHome,
  PixelCheckList,
  PixelPlus,
  PixelChart,
  PixelSettings,
} from "@/components/ui/pixel-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MobileBottomNavProps {
  activeTab: number;
  onTabChange: (tab: number) => void;
  onAddClick: () => void;
  embedded?: boolean;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  onAddClick,
  embedded = false,
}: MobileBottomNavProps) {
  return (
    <>
      <nav
      aria-label="Mobile navigation"
      className={cn(
        !embedded && "lg:hidden",
        "z-30 flex items-center justify-around rounded-full border border-border/40 bg-surface/90 px-2 backdrop-blur-xl shadow-lg",
        embedded
          ? "absolute inset-x-3 bottom-3 h-[64px]"
          : "fixed left-1/2 -translate-x-1/2 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] h-[68px] w-[calc(100%-2rem)] max-w-lg"
      )}
    >
      <Button
        variant="ghost"
        onClick={() => onTabChange(0)}
        aria-label="Today"
        aria-current={activeTab === 0 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] h-full min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 0 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 0 && "bg-ember-soft")}>
          <PixelHome className="size-4" />
        </span>
        Today
      </Button>

      <Button
        variant="ghost"
        onClick={() => onTabChange(1)}
        aria-label="Habits"
        aria-current={activeTab === 1 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] h-full min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 1 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 1 && "bg-ember-soft")}>
          <PixelCheckList className="size-4" />
        </span>
        Habits
      </Button>

      <Button
        variant="ghost"
        onClick={() => onTabChange(2)}
        aria-label="Progress"
        aria-current={activeTab === 2 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] h-full min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 2 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 2 && "bg-ember-soft")}>
          <PixelChart className="size-4" />
        </span>
        Progress
      </Button>

      <Button
        variant="ghost"
        onClick={() => onTabChange(3)}
        aria-label="Settings"
        aria-current={activeTab === 3 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] h-full min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-full p-0 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 3 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 3 && "bg-ember-soft")}>
          <PixelSettings className="size-4" />
        </span>
        Settings
      </Button>
    </nav>

    {/* Ergonomic Floating Action Button (FAB) in Bottom-Right Corner for 1-Thumb Creation */}
    <Button
      variant="fab"
      size="fab"
      onClick={onAddClick}
      className={cn(
        !embedded && "lg:hidden",
        "size-13 min-h-[48px] min-w-[48px] rounded-full bg-gradient-to-tr from-ember to-heat-4 text-[var(--ember-foreground,#FFFFFF)] shadow-[0_8px_24px_rgba(245,158,11,0.4)] border border-ember/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
        embedded
          ? "absolute right-4 bottom-20 z-30"
          : "fixed right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(6rem+env(safe-area-inset-bottom,0px))] z-40"
      )}
      aria-label="Add new habit"
    >
      <PixelPlus className="size-6 text-[var(--ember-foreground,#FFFFFF)]" />
    </Button>
  </>
  );
}
