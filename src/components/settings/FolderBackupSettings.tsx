import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { folderBackup, isAndroid, type BackupCadence, type FolderBackupStatus } from "@/lib/habits/folderBackup";
import { buildBackup } from "@/lib/habits/logic";
import { useNotesStore } from "@/lib/habits/notes";
import { useHabitStore } from "@/lib/habits/store";

export function FolderBackupSettings() {
  const { habits, settings, collections } = useHabitStore();
  const { notes } = useNotesStore();
  const [status, setStatus] = useState<FolderBackupStatus>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAndroid()) void folderBackup.status().then(setStatus).catch(() => setError("Folder backup is unavailable on this build."));
  }, []);

  if (!isAndroid()) return null;
  const stage = () => folderBackup.stage({
    json: JSON.stringify(buildBackup(habits, settings, new Date(), notes, collections)),
  });
  async function run(action: () => Promise<FolderBackupStatus>) {
    setBusy(true);
    setError("");
    try { setStatus(await action()); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Folder backup failed."); }
    finally { setBusy(false); }
  }

  return (
    <section className="min-w-0 space-y-3 rounded-2xl border border-border bg-surface-2 p-3">
      <div>
        <h3 className="text-sm font-semibold">Portable folder backups</h3>
        <p className="text-xs text-muted-foreground">Save readable copies of your data to a folder you control.</p>
      </div>
      <Button variant="outline" disabled={busy || !status} onClick={() => void run(async () => {
        const selected = await folderBackup.chooseFolder();
        if (selected.writable) await stage();
        return selected;
      })}>{status?.configured ? "Change folder" : "Choose folder"}</Button>
      <label className="flex flex-wrap items-center justify-between gap-2 text-sm">
        Schedule
        <select className="min-h-11 rounded-xl border border-border bg-surface px-3" disabled={busy || !status?.writable}
          value={status?.cadence ?? "off"} onChange={(event) => {
            const cadence = event.target.value as BackupCadence;
            void run(async () => {
              if (cadence !== "off") await stage();
              return folderBackup.configure({ cadence });
            });
          }}>
          <option value="off">Off</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </label>
      <Button variant="outline" disabled={busy || !status?.writable} onClick={() => void run(async () => {
        await stage();
        return folderBackup.backupNow();
      })}>Back up now</Button>
      {status?.configured && (
        <Button variant="ghost" disabled={busy} onClick={() => void run(() => folderBackup.disconnect())}>
          Disconnect folder
        </Button>
      )}
      <p className="text-xs text-muted-foreground" role="status">
        {busy ? "Working…" : status?.lastSuccess ? `Last saved ${new Date(status.lastSuccess).toLocaleString()}` : "No folder backup saved yet."}
      </p>
      {(error || status?.error) && <p role="alert" className="text-xs text-destructive">{error || status?.error}</p>}
    </section>
  );
}
