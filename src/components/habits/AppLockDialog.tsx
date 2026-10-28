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
import { Input } from "@/components/ui/input";
import {
  lockActions,
  isValidPinFormat,
  useAppLockStore,
  TIMEOUT_OPTIONS,
} from "@/lib/habits/lock";
import { Lock, Unlock, ShieldCheck, KeyRound, AlertCircle, Timer } from "lucide-react";

interface AppLockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppLockDialog({ open, onOpenChange }: AppLockDialogProps) {
  const { isPinSet, isEnabled, isLocked, timeoutMinutes } = useAppLockStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSetOrUpdatePin = async () => {
    setError(null);
    setSuccess(null);
    if (!isValidPinFormat(pin)) {
      setError("PIN must be exactly 4 digits (0-9).");
      return;
    }

    const ok = await lockActions.setPin(pin);
    if (ok) {
      setSuccess("4-digit PIN successfully saved and enabled!");
      setPin("");
    } else {
      setError("Failed to save PIN. Please try again.");
    }
  };

  const handleUnlock = async () => {
    setError(null);
    const ok = await lockActions.unlock(pin);
    if (ok) {
      setPin("");
      onOpenChange(false);
    } else {
      setError("Incorrect PIN. Please try again.");
    }
  };

  const handleRemovePin = () => {
    lockActions.removePin();
    setPin("");
    setError(null);
    setSuccess("App lock disabled.");
  };

  const handleToggleEnabled = () => {
    lockActions.setEnabled(!isEnabled);
    setError(null);
    setSuccess(isEnabled ? "App lock paused." : "App lock active.");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isLocked && !next) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-sm bg-card text-foreground border-border"
        onEscapeKeyDown={(e) => {
          if (isLocked) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLocked) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Lock className="h-5 w-5 text-ember" />
            {isLocked ? "Daily Spark Locked" : "App Lock & Privacy"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isLocked
              ? "Enter your 4-digit PIN to access your habits and private notes."
              : "Protect habits and private notes from prying eyes on shared devices."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          {error && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isLocked ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="••••"
                  className="w-36 text-center text-2xl tracking-[0.5em] font-mono bg-surface-1 border-border"
                />
              </div>
              <Button onClick={handleUnlock} className="w-full gap-2">
                <Unlock className="h-4 w-4" /> Unlock
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="h-4 w-4 text-ember" />
                  <div>
                    <span className="font-semibold block text-xs">PIN Status</span>
                    <span className="text-muted-foreground text-xs">
                      {isPinSet ? (isEnabled ? "Protected" : "Paused") : "Not Configured"}
                    </span>
                  </div>
                </div>
                {isPinSet && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleEnabled}
                    className="text-xs h-7 px-2.5"
                  >
                    {isEnabled ? "Disable" : "Enable"}
                  </Button>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  {isPinSet ? "Update 4-Digit PIN" : "Choose 4-Digit PIN"}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="••••"
                    className="text-center font-mono tracking-[0.3em] bg-surface-1 border-border"
                  />
                  <Button onClick={handleSetOrUpdatePin} size="sm" className="shrink-0">
                    Save PIN
                  </Button>
                </div>
              </div>

              {isPinSet && (
                <div className="space-y-1.5 p-3 rounded-lg bg-surface-1 border border-border">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Timer className="h-4 w-4 text-ember" />
                    <span>Auto-Lock Inactivity Timer</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Automatically lock after inactive period or switching apps:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {TIMEOUT_OPTIONS.map((mins) => {
                      const isSelected = timeoutMinutes === mins;
                      const label = mins === 0 ? "Instant" : `${mins} min`;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => lockActions.setTimeoutMinutes(mins)}
                          className={`px-2.5 py-1 text-xs rounded-md font-medium border transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-surface-2 text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isPinSet && (
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => lockActions.lock()}
                    className="text-xs text-ember gap-1"
                  >
                    <Lock className="h-3.5 w-3.5" /> Test Lock Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePin}
                    className="text-xs text-destructive"
                  >
                    Remove PIN
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {!isLocked && (
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

