import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Download, FileSpreadsheet, Github, ShieldCheck, Smartphone, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { habitActions, useHabitStore } from "@/lib/habits/store";
import { BackupError, buildBackup, habitsToCsv, parseBackup, type ParsedBackup } from "@/lib/habits/logic";
import { todayKey } from "@/lib/habits/dates";
import { PageHeader, Panel, ghostBtn } from "@/components/habits/AppUi";
import { InstallButton } from "@/components/InstallButton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Daily Spark" },
      { name: "description", content: "Reminders, backup and restore, install and app info." },
      { property: "og:title", content: "Settings — Daily Spark" },
      { property: "og:description", content: "Reminders, backup and restore, install and app info." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
}

function SettingsPage() {
  const { loaded, habits, settings } = useHabitStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setLastBackup(habitActions.lastBackup());
    setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission);
  }, []);

  async function toggleReminders(on: boolean) {
    if (on && perm !== "unsupported" && Notification.permission !== "granted") {
      const r = await Notification.requestPermission();
      setPerm(r);
      if (r !== "granted") {
        toast("Notifications are blocked", { description: "Allow them in your browser settings to get reminders." });
        return;
      }
    }
    habitActions.updateSettings({ enabled: on });
  }

  function exportJson() {
    download(`daily_spark_backup_${stamp()}.json`, JSON.stringify(buildBackup(habits, settings), null, 2), "application/json");
    habitActions.markBackedUp();
    setLastBackup(habitActions.lastBackup());
    toast.success("Backup saved", { description: "Keep the file somewhere safe." });
  }

  function exportCsv() {
    download(`daily_spark_${stamp()}.csv`, habitsToCsv(habits), "text/csv");
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 5_000_000) {
      toast.error("That file is too big to be a Daily Spark backup.");
      return;
    }
    try {
      const parsed = parseBackup(await file.text(), todayKey());
      if (parsed.habits.length === 0) {
        toast.error("No habits found in this backup.");
        return;
      }
      setPending(parsed);
    } catch (err) {
      toast.error(err instanceof BackupError ? err.message : "Couldn't read that file.");
    }
  }

  function confirmRestore() {
    if (!pending) return;
    habitActions.replaceAll(pending.habits, pending.settings);
    toast.success(`Restored ${pending.habits.length} habits`, {
      description: pending.skipped ? `${pending.skipped} invalid rows were skipped.` : undefined,
    });
    setPending(null);
  }

  return (
    <>
      <PageHeader eyebrow="Daily Spark" title="Settings" />
      <div className="space-y-8">
        <Section title="Reminders">
          <Panel className="space-y-4">
            <Row
              icon={<Bell className="size-4" />}
              title="Gentle reminders"
              sub={
                perm === "unsupported"
                  ? "This browser doesn't support notifications."
                  : perm === "denied"
                    ? "Blocked in browser settings."
                    : "Sent while Daily Spark is open or installed. Set times per habit."
              }
              control={
                <Switch
                  checked={settings.enabled}
                  disabled={!loaded || perm === "unsupported"}
                  onCheckedChange={toggleReminders}
                  aria-label="Gentle reminders"
                />
              }
            />
            <Row
              title="Default time for new habits"
              control={
                <Input
                  type="time"
                  value={settings.defaultTime}
                  onChange={(e) => habitActions.updateSettings({ defaultTime: e.target.value })}
                  className="h-10 w-28 rounded-2xl border-0 bg-surface-2 font-semibold tabular-nums"
                  aria-label="Default reminder time"
                />
              }
            />
          </Panel>
        </Section>

        <Section title="Your data">
          <Panel className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Everything is stored only in this browser. Export a backup regularly — and before clearing browser
              data or switching devices. Backups from the old Daily Spark app work here too.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="ghost" className={cn(ghostBtn, "border-ember/40")} onClick={exportJson} disabled={!loaded}>
                <Download className="size-4 text-ember" /> Export backup
              </Button>
              <Button variant="ghost" className={ghostBtn} onClick={() => fileRef.current?.click()}>
                <Upload className="size-4 text-ember" /> Restore from file
              </Button>
              <Button variant="ghost" className={ghostBtn} onClick={exportCsv} disabled={!loaded || habits.length === 0}>
                <FileSpreadsheet className="size-4" /> CSV
              </Button>
              <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
            </div>
            <p className="text-xs text-muted-foreground" suppressHydrationWarning>
              {loaded && `${habits.length} habits on this device · `}
              Last backup: {lastBackup ? new Date(lastBackup).toLocaleString() : "never"}
            </p>
          </Panel>
        </Section>

        <Section title="App">
          <Panel className="space-y-4">
            <Row
              icon={<Smartphone className="size-4" />}
              title="Install Daily Spark"
              sub="Add it to your home screen or desktop."
              control={<InstallButton className={cn(ghostBtn, "cursor-pointer")} label="Install" />}
            />
            <Row
              icon={<Download className="size-4" />}
              title={`Android APK ${SITE.apk.version}`}
              sub="The original Android app, from GitHub."
              control={
                <a href={SITE.apk.url} className={ghostBtn}>
                  Download
                </a>
              }
            />
          </Panel>
        </Section>

        <Section title="About">
          <Panel className="space-y-3 text-sm">
            <p>
              <span className="text-[17px] font-extrabold">Daily Spark</span>{" "}
              <span className="text-xs font-semibold text-faint">web {SITE.webVersion}</span>
            </p>
            <p className="text-muted-foreground">Calm, offline-first habit tracking. No login, no ads, no tracking.</p>
            <div className="flex flex-wrap gap-4 pt-1">
              <Link to="/privacy" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <ShieldCheck className="size-4" /> Privacy
              </Link>
              <a href={SITE.repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Github className="size-4" /> Source code
              </a>
              <a href={SITE.issues} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                Report an issue
              </a>
            </div>
          </Panel>
        </Section>

        <Section title="Danger zone">
          <Panel className="border-destructive/30">
            <Row
              icon={<Trash2 className="size-4 text-destructive" />}
              title="Delete all data"
              sub="Removes every habit and check-in from this device."
              control={
                <Button variant="ghost"
                  className={cn(ghostBtn, "border-destructive/40 text-destructive hover:text-destructive")}
                  onClick={() => setConfirmClear(true)}
                  disabled={!loaded || habits.length === 0}
                >
                  Delete
                </Button>
              }
            />
          </Panel>
        </Section>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent className="rounded-3xl bg-surface font-app">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-app text-2xl font-extrabold">Restore this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Found {pending?.habits.length} habits
              {pending?.exportDate ? ` from ${new Date(pending.exportDate).toLocaleString()}` : ""}
              {pending?.skipped ? ` (${pending.skipped} invalid rows will be skipped)` : ""}. This replaces the{" "}
              {habits.length} habits currently on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {habits.length > 0 && (
            <Button variant="ghost" className={cn(ghostBtn, "w-full")} onClick={exportJson}>
              <Download className="size-4" /> Back up current data first
            </Button>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent className="rounded-3xl bg-surface font-app">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-app text-2xl font-extrabold">Delete everything?</AlertDialogTitle>
            <AlertDialogDescription>
              All {habits.length} habits and their history will be removed from this device. This can't be undone
              unless you have a backup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                habitActions.clearAll();
                toast("All data deleted");
              }}
            >
              Delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="kicker mb-2.5 px-1">{title}</h2>
      {children}
    </section>
  );
}

function Row({
  icon,
  title,
  sub,
  control,
}: {
  icon?: React.ReactNode;
  title: string;
  sub?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-ember-soft text-ember">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{title}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
      {control}
    </div>
  );
}
