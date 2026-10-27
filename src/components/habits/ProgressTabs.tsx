import { Link } from "@tanstack/react-router";

/** Overview / Calendar switch shared by the two Progress pages. */
export function ProgressTabs() {
  const cls =
    "flex-1 rounded-full px-3 py-2 text-center text-[13px] font-bold text-faint transition-colors hover:text-muted-foreground data-[status=active]:bg-surface-2 data-[status=active]:text-foreground";
  return (
    <div className="mb-5 flex rounded-full border-0 bg-surface p-1">
      <Link to="/app/insights" className={cls}>
        Overview
      </Link>
      <Link to="/app/calendar" className={cls}>
        Calendar
      </Link>
    </div>
  );
}
