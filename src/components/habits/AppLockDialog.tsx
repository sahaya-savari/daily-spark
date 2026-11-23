import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  lockActions,
  isValidPinFormat,
  useAppLockStore,
  TIMEOUT_OPTIONS,
} from "@/lib/habits/lock";
import { Lock, Unlock, ShieldCheck, KeyRound, AlertCircle, Timer, Fingerprint } from "lucide-react";

interface AppLockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppLockDialog({ open, onOpenChange }: AppLockDialogProps) {
  const { isPinSet, isEnabled, isLocked, isBiometricEnabled, timeoutMinutes } = useAppLockStore();
  const [pin, setPin] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  useEffect(() => {
    if (!open) {
      setPin("");
      setCurrentPin("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-prompt biometrics when opening lock screen
  useEffect(() => {
    if (open && isLocked && isBiometricEnabled) {
      const timer = setTimeout(() => {
        lockActions.authenticateBiometric().then((ok) => {
          if (ok) {
            setPin("");
            onOpenChange(false);
          }
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open, isLocked, isBiometricEnabled, onOpenChange]);

  const verifyExistingPin = async () => {
    if (!isPinSet || await lockActions.verifyPin(currentPin)) return true;
    setError("Enter your current PIN to change protection.");
    return false;
  };

  const handleSetOrUpdatePin = async () => {
    setError(null);
    setSuccess(null);
    if (!isValidPinFormat(pin)) {
      setError("PIN must be exactly 4 digits (0-9).");
      return;
    }

    if (!(await verifyExistingPin())) return;
    const ok = await lockActions.setPin(pin);
    if (ok) {
      setCurrentPin("");
      setSuccess("PIN saved.");
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

  const handleBiometricUnlock = async () => {
    setError(null);
    const ok = await lockActions.authenticateBiometric();
    if (ok) {
      setPin("");
      onOpenChange(false);
    } else {
      setError("Biometrics not recognized or cancelled. Please enter your 4-digit PIN.");
    }
  };

  const handleRemovePin = async () => {
    if (!(await verifyExistingPin())) return;
    lockActions.removePin();
    setCurrentPin("");
    setPin("");
    setError(null);
    setSuccess("App lock disabled.");
  };

  const handleToggleEnabled = async () => {
    if (!(await verifyExistingPin())) return;
    setCurrentPin("");
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
        className="max-w-sm bg-card text-foreground border-border [&_button]:min-h-11 [&_button]:min-w-11"
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
              ? "Authenticate with biometrics or enter your 4-digit PIN."
              : "Protect habits and private notes with biometrics and 4-digit PIN."}
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
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleBiometricUnlock}
                className="w-full gap-2 bg-ember hover:bg-ember/90 text-white font-semibold py-2.5 rounded-xl shadow-md cursor-pointer transition-all"
              >
                <Fingerprint className="h-5 w-5" /> Unlock with Biometrics
              </Button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border/40"></div>
                <span className="flex-shrink mx-2 text-[11px] text-muted-foreground uppercase font-mono tracking-wider">
                  or 4-digit PIN
                </span>
                <div className="flex-grow border-t border-border/40"></div>
              </div>

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
                <Unlock className="h-4 w-4" /> Unlock with PIN
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

              {isPinSet && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-1 border border-border">
                  <div className="flex items-center gap-2.5">
                    <Fingerprint className="h-4 w-4 text-ember" />
                    <div>
                      <span className="font-semibold block text-xs">Unlock with Biometrics (Fingerprint / Face ID)</span>
                      <span className="text-muted-foreground text-xs">
                        {isBiometricEnabled ? "Prompts automatically when locked" : "Fast fingerprint or facial unlock"}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={isBiometricEnabled}
                    onCheckedChange={async (checked) => {
                      if (!(await verifyExistingPin())) return;
                      setCurrentPin("");
                      if (checked) {
                        const ok = await lockActions.registerBiometrics();
                        if (ok) {
                          setSuccess("Biometric unlock enabled!");
                        } else {
                          setError("Biometric setup was not completed. Your PIN remains available.");
                        }
                      } else {
                        lockActions.setBiometricEnabled(false);
                        setSuccess("Biometric unlock disabled.");
                      }
                    }}
                  />
                </div>
              )}

              {isPinSet && (
                <label className="block space-y-1 text-xs font-semibold">
                  Current PIN
                  <Input type="password" inputMode="numeric" maxLength={4} value={currentPin}
                    onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, "").slice(0, 4))} />
                </label>
              )}
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
                    <span>Lock after leaving the app</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Choose how long the app stays unlocked in the background.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {TIMEOUT_OPTIONS.map((mins) => {
                      const isSelected = timeoutMinutes === mins;
                      const label = mins === 0 ? "Instant" : mins === 0.5 ? "30 sec" : `${mins} min`;
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={async () => { if (await verifyExistingPin()) lockActions.setTimeoutMinutes(mins); }}
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
