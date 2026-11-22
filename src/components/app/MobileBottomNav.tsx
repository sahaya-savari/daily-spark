import React from "react";
import {
  CalendarCheck2,
  CheckSquare,
  Plus,
  BarChart3,
  Settings,
} from "lucide-react";
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
    <nav
      aria-label="Mobile navigation"
      className={cn(
        !embedded && "lg:hidden",
        "z-30 flex items-center justify-between rounded-full border border-border/40 bg-surface/90 px-3 backdrop-blur-xl shadow-lg",
        embedded
          ? "absolute inset-x-3.5 bottom-3.5 h-[72px]"
          : "fixed left-1/2 -translate-x-1/2 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] h-[72px] w-[calc(100%-2rem)] max-w-lg"
      )}
    >
      {/* 1. Today */}
      <Button
        variant="ghost"
        onClick={() => onTabChange(0)}
        aria-label="Today"
        aria-current={activeTab === 0 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] min-w-[48px] h-full flex-col items-center justify-center gap-0.5 rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 0 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 0 && "bg-ember-soft")}>
          <CalendarCheck2 className="size-4" strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-bold">Today</span>
      </Button>

      {/* 2. Habits */}
      <Button
        variant="ghost"
        onClick={() => onTabChange(1)}
        aria-label="Habits"
        aria-current={activeTab === 1 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] min-w-[48px] h-full flex-col items-center justify-center gap-0.5 rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 1 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 1 && "bg-ember-soft")}>
          <CheckSquare className="size-4" strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-bold">Habits</span>
      </Button>

      {/* 3. Center Add (+) Button */}
      <Button
        variant="fab"
        size="fab"
        onClick={onAddClick}
        style={{ boxShadow: "0 4px 22px var(--ember-glow)" }}
        className="size-12 min-h-[48px] min-w-[48px] shrink-0 rounded-full bg-gradient-to-tr from-ember to-heat-4 text-white border border-ember/30 hover:brightness-110 active:scale-95 flex items-center justify-center p-0 mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer"
        aria-label="Add new habit"
      >
        <Plus className="size-6 text-white" strokeWidth={2.5} />
      </Button>

      {/* 4. Progress */}
      <Button
        variant="ghost"
        onClick={() => onTabChange(2)}
        aria-label="Progress"
        aria-current={activeTab === 2 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] min-w-[48px] h-full flex-col items-center justify-center gap-0.5 rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 2 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 2 && "bg-ember-soft")}>
          <BarChart3 className="size-4" strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-bold">Progress</span>
      </Button>

      {/* 5. Settings */}
      <Button
        variant="ghost"
        onClick={() => onTabChange(3)}
        aria-label="Settings"
        aria-current={activeTab === 3 ? "page" : undefined}
        className={cn(
          "flex flex-1 min-h-[48px] min-w-[48px] h-full flex-col items-center justify-center gap-0.5 rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
          activeTab === 3 ? "text-ember font-bold" : "text-faint hover:text-foreground"
        )}
      >
        <span className={cn("grid h-7 w-12 place-items-center rounded-full", activeTab === 3 && "bg-ember-soft")}>
          <Settings className="size-4" strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-bold">Settings</span>
      </Button>
    </nav>
  );
}
