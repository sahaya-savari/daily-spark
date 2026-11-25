import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isAndroid } from "@/lib/habits/folderBackup";
import { WidgetRefresh, syncWidgetData, type WidgetKind } from "@/lib/habits/widgetBridge";
import { useHabitStore } from "@/lib/habits/store";

const widgets: { kind: WidgetKind; name: string; detail: string }[] = [
  { kind: "today", name: "Today", detail: "Upcoming habits and your current streak" },
  { kind: "streak", name: "Streak", detail: "Your current streak at a glance" },
  { kind: "heatmap", name: "Heatmap", detail: "Recent activity in your theme colors" },
];

export function WidgetSettings() {
  const { habits, settings } = useHabitStore();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  if (!isAndroid()) return null;

  async function run(kind?: WidgetKind) {
    setBusy(true);
    setStatus("");
    try {
      if (!(await syncWidgetData(habits, settings))) {
        setStatus("Widgets could not refresh. Try again.");
        return;
      }
      if (!kind) {
        setStatus("Widgets refreshed.");
        return;
      }
      const { requested } = await WidgetRefresh.requestPin({ kind });
      setStatus(requested ? "Confirm the widget on your home screen." : "Open your launcher’s widget picker and choose Daily Spark.");
    } catch {
      setStatus("Open your launcher’s widget picker and choose Daily Spark.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Home screen widgets" className="space-y-2 rounded-2xl border border-border bg-surface-2 p-3">
      <h3 className="font-semibold">Home screen widgets</h3>
      {widgets.map(({ kind, name, detail }) => (
        <div key={kind} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </div>
          <Button variant="outline" aria-label={`Add ${name} widget`} disabled={busy} onClick={() => void run(kind)}>Add</Button>
        </div>
      ))}
      <Button variant="ghost" disabled={busy} onClick={() => void run()}>Refresh widgets</Button>
      {status && <p role="status" className="text-sm text-muted-foreground">{status}</p>}
    </section>
  );
}
