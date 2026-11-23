import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type BackupInspection } from "@/lib/habits/logic";
import { AlertTriangle, Archive, CheckCircle2, Flame, FileText } from "lucide-react";

interface BackupPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inspection: BackupInspection | null;
  onConfirmRestore: (inspection: BackupInspection, mode: "merge" | "replace") => void;
  allowMerge?: boolean;
}

export function BackupPreviewDialog({
  open,
  onOpenChange,
  inspection,
  onConfirmRestore,
  allowMerge = false,
}: BackupPreviewDialogProps) {
  const [error, setError] = useState("");
  if (!inspection) return null;
  const restore = (mode: "merge" | "replace") => {
    setError("");
    try {
      onConfirmRestore(inspection, mode);
      onOpenChange(false);
    } catch {
      setError("Restore could not be saved. Check available storage and try again.");
    }
  };

  const { preview } = inspection;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Inspect Backup Before Restore
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Review the contents of your Daily Spark backup archive before applying it to your device.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-surface-2/60 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium block">Version & Date</span>
              <span className="font-semibold text-foreground">v{preview.version}</span>
              <span className="text-xs text-muted-foreground block truncate">
                {preview.exportDate ?? "Unknown date"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-surface-2/60 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium block">Total Check-Ins</span>
              <span className="font-semibold text-foreground">{preview.totalCompletions}</span>
              <span className="text-xs text-muted-foreground block">Historical entries</span>
            </div>
          </div>

          {/* Breakdown counts */}
          <div className="space-y-2 rounded-lg bg-surface-1 border border-border p-3.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-foreground font-medium">
                <Flame className="h-4 w-4 text-accent" /> Active Habits
              </span>
              <span className="font-semibold text-foreground">{preview.activeCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Archive className="h-4 w-4 text-muted-foreground" /> Archived Habits
              </span>
              <span className="font-medium text-muted-foreground">{preview.archivedCount}</span>
            </div>
            {preview.notesCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-medium">
                  <FileText className="h-4 w-4 text-primary" /> Standalone Notes
                </span>
                <span className="font-semibold text-foreground">{preview.notesCount}</span>
              </div>
            )}
          </div>

          {/* Warning banner */}
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed font-medium">
              Replace applies the backup over your current data. {allowMerge ? "Merge adds new records and keeps your existing records and settings. A recovery snapshot is saved first." : "Make a backup before replacing your data."}
            </p>
          </div>
        </div>

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {allowMerge && <Button onClick={() => restore("merge")}>Merge</Button>}
          <Button variant="destructive" onClick={() => restore("replace")}>Replace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
