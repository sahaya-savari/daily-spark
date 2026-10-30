import React, { useState } from "react";
import {
  Upload,
  FileCode,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { detectAndParseImport, type ImportResult } from "@/lib/habits/importer";
import { todayKey } from "@/lib/habits/dates";
import type { Habit } from "@/lib/habits/types";

interface UniversalImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportHabits: (habits: Habit[]) => void;
}

export const UniversalImportDialog: React.FC<UniversalImportDialogProps> = ({
  open,
  onOpenChange,
  onImportHabits,
}) => {
  const [inputText, setInputText] = useState("");
  const [parsedResult, setParsedResult] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleTextChange = (text: string) => {
    setInputText(text);
    setErrorMessage(null);

    if (!text.trim()) {
      setParsedResult(null);
      return;
    }

    try {
      const res = detectAndParseImport(text, todayKey());
      if (res.habits.length > 0) {
        setParsedResult(res);
      } else {
        setParsedResult(null);
      }
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : "Could not parse format");
      setParsedResult(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleTextChange(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!parsedResult || parsedResult.habits.length === 0) return;
    onImportHabits(parsedResult.habits);
    onOpenChange(false);
    setInputText("");
    setParsedResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-surface border-border/40 text-foreground backdrop-blur-2xl p-6 rounded-3xl shadow-2xl">
        <DialogHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ember-soft border border-ember/20 flex items-center justify-center text-ember">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground tracking-wide">
                Universal Multi-Format Importer
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Loop Habit Tracker, HabitKit, Habitica, HabitBull, or CSV
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* File input dropzone */}
          <div className="relative border-2 border-dashed border-border/40 hover:border-border/70 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-surface-2/40">
            <input
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Upload habit data file"
            />
            <FileCode className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground/90">Click to upload or drag & drop</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Supports CSV and JSON exports</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">Or paste raw export data</label>
              {parsedResult && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {parsedResult.formatLabel} detected
                </span>
              )}
            </div>
            <Textarea
              value={inputText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Paste Loop CSV, HabitKit JSON, or matrix data here..."
              className="h-28 bg-surface-2 border-border/40 text-xs font-mono text-foreground placeholder:text-muted-foreground rounded-xl"
              aria-label="Raw export text"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {parsedResult && parsedResult.habits.length > 0 && (
            <div className="p-3 rounded-2xl bg-surface-2/60 border border-border/40 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium">Found {parsedResult.totalImported} habits</span>
                <span className="text-faint">Ready to merge</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {parsedResult.habits.slice(0, 5).map((h, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-surface border border-border/30 text-xs text-foreground"
                  >
                    <span className="truncate">{h.emoji} {h.name}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {h.completedDates.length} days
                    </span>
                  </div>
                ))}
                {parsedResult.habits.length > 5 && (
                  <p className="text-[11px] text-faint text-center pt-1">
                    +{parsedResult.habits.length - 5} more habits
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-border/40 bg-surface-2 hover:bg-surface-2/80 text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmImport}
            disabled={!parsedResult || parsedResult.habits.length === 0}
            className="flex-1 rounded-xl bg-ember hover:bg-ember/90 text-white font-bold disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Import ({parsedResult?.totalImported || 0})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
