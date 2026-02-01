import { X, Shield, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GraceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUseWeekly: () => void;
  onUseMonthly: () => void;
  weeklyAvailable: boolean;
  monthlyAvailable: boolean;
  streakName: string;
}

export const GraceDialog = ({ 
  isOpen, 
  onClose, 
  onUseWeekly, 
  onUseMonthly, 
  weeklyAvailable, 
  monthlyAvailable, 
  streakName 
}: GraceDialogProps) => {
  if (!isOpen) return null;

  const hasAnyGrace = weeklyAvailable || monthlyAvailable;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-2xl border border-border m-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Grace Period
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{streakName}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close grace dialog"
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {!hasAnyGrace && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">No Grace Available</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    You've already used your grace periods. Try again next week or next month.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={onUseWeekly}
                disabled={!weeklyAvailable}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  weeklyAvailable
                    ? "border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer"
                    : "border-border bg-muted opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly Grace</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 missed day forgiven per week
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    weeklyAvailable 
                      ? "bg-success text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {weeklyAvailable ? 'Available' : 'Used'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={onUseMonthly}
                disabled={!monthlyAvailable}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all",
                  monthlyAvailable
                    ? "border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer"
                    : "border-border bg-muted opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">Monthly Grace</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      1 full restore per month
                    </p>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    monthlyAvailable 
                      ? "bg-success text-white" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {monthlyAvailable ? 'Available' : 'Used'}
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground">
              <p>💡 Grace periods help you maintain streaks during unexpected circumstances.</p>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
