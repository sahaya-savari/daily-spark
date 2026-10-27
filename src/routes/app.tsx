import { useCallback, useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ChartColumn, House, ListChecks, Plus, Settings2, type LucideIcon } from "lucide-react";
import { SparkMark } from "@/components/brand/Logo";
import { ReminderRunner } from "@/components/habits/ReminderRunner";
import { HabitDialog } from "@/components/habits/HabitDialog";
import { AddHabitContext } from "@/components/habits/add-habit-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Today — Daily Spark" },
      { name: "description", content: "Your Daily Spark habits. Check in once a day, keep your streaks, all stored on this device." },
      { property: "og:title", content: "Daily Spark app" },
      { property: "og:description", content: "Calm, offline-first habit tracking in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppLayout,
});

type NavItem = { to: "/app" | "/app/habits" | "/app/insights" | "/app/settings"; label: string; Icon: LucideIcon; match: (p: string) => boolean };

const LEFT: NavItem[] = [
  { to: "/app", label: "Today", Icon: House, match: (p) => p === "/app" || p === "/app/" },
  { to: "/app/habits", label: "Habits", Icon: ListChecks, match: (p) => p.startsWith("/app/habits") },
];
const RIGHT: NavItem[] = [
  { to: "/app/insights", label: "Progress", Icon: ChartColumn, match: (p) => p.startsWith("/app/insights") || p.startsWith("/app/calendar") },
  { to: "/app/settings", label: "Settings", Icon: Settings2, match: (p) => p.startsWith("/app/settings") },
];

function AppLayout() {
  const [adding, setAdding] = useState(false);
  const open = useCallback(() => setAdding(true), []);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AddHabitContext.Provider value={open}>
      <div className="bg-dots min-h-dvh font-app">
        <ReminderRunner />
        <header className="mx-auto flex w-full max-w-xl items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
          <Link to="/" aria-label="Daily Spark website" className="flex items-center gap-2.5">
            <SparkMark className="size-8" />
            <span className="font-display text-[17px] font-bold normal-case tracking-[0.03em]">Daily Spark</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
            Website
          </Link>
        </header>

        <main className="mx-auto w-full max-w-xl px-5 pb-36 pt-6">
          <Outlet />
        </main>

        <nav
          aria-label="App"
          className="pb-safe fixed inset-x-0 bottom-0 z-40 px-4 pb-4"
        >
          <div className="nav-float mx-auto flex h-[88px] max-w-md items-center justify-between gap-1 rounded-full border-0 bg-surface/90 px-3 backdrop-blur-xl">
            {LEFT.map((n) => (
              <NavButton key={n.to} item={n} active={n.match(path)} />
            ))}
            <Button
              variant="fab"
              size="fab"
              type="button"
              onClick={open}
              aria-label="Add habit"
              className="shrink-0 transition-transform"
            >
              <Plus className="size-6" strokeWidth={2.6} />
            </Button>
            {RIGHT.map((n) => (
              <NavButton key={n.to} item={n} active={n.match(path)} />
            ))}
          </div>
        </nav>

        <HabitDialog open={adding} onOpenChange={setAdding} />
      </div>
    </AddHabitContext.Provider>
  );
}

function NavButton({ item, active }: { item: NavItem; active: boolean }) {
  const { Icon } = item;
  return (
    <Link
      to={item.to}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-[60px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full transition-colors",
        active ? "text-ember" : "text-faint hover:text-muted-foreground",
      )}
    >
      <span className={cn("grid h-8 w-12 place-items-center rounded-full transition-colors", active && "bg-ember-soft")}>
        <Icon className="size-[19px]" strokeWidth={active ? 2.3 : 2} />
      </span>
      <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
    </Link>
  );
}
