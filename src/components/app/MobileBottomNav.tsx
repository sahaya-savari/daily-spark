import React from "react";
import { BarChart3, CheckSquare2, Home, Plus, Settings } from "lucide-react";
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
        "z-30 flex items-center justify-around border-t border-border/60 bg-surface/95 px-2 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl",
        embedded
          ? "absolute inset-x-0 bottom-0 h-[64px]"
          : "fixed inset-x-0 bottom-0 h-[calc(64px+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)]"
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
          <Home className="size-5" strokeWidth={2} />
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
          <CheckSquare2 className="size-5" strokeWidth={2} />
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
          <BarChart3 className="size-5" strokeWidth={2} />
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
          <Settings className="size-5" strokeWidth={2} />
        </span>
        Settings
      </Button>
    </nav>

    {/* Ergonomic Floating Action Button (FAB) in Bottom-Right Corner for 1-Thumb Creation */}
    <Button
      variant="fab"
      size="fab"
      onClick={onAddClick}
      style={{ boxShadow: "0 8px 28px var(--ember-glow)" }}
      className={cn(
        !embedded && "lg:hidden",
        "size-14 min-h-[48px] min-w-[48px] rounded-2xl bg-ember text-[var(--ember-foreground,#FFFFFF)] border border-ember/40 active:opacity-80 transition-opacity flex items-center justify-center p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember cursor-pointer",
        embedded
          ? "absolute right-4 bottom-[76px] z-30"
          : "fixed right-4 sm:right-6 bottom-[calc(76px+env(safe-area-inset-bottom,0px))] z-40"
      )}
      aria-label="Add new habit"
    >
      <Plus className="size-6 text-[var(--ember-foreground,#FFFFFF)]" strokeWidth={2.25} />
    </Button>
  </>
  );
}
