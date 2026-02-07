import { useState, useCallback } from 'react';
import { X, Clock } from 'lucide-react';
import { SnoozeOption } from '@/types/reminder';
import { calculateSnoozeTime } from '@/services/snoozeService';
import { cn } from '@/lib/utils';

interface SnoozeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSnooze: (until: number) => void;
  streakName: string;
}

export const SnoozeDialog = ({ isOpen, onClose, onSnooze, streakName }: SnoozeDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<SnoozeOption>('1hour');
  const [customHours, setCustomHours] = useState(2);

  const handleSnooze = useCallback(() => {
    const until = calculateSnoozeTime(selectedOption, customHours * 60);
    onSnooze(until);
    onClose();
  }, [selectedOption, customHours, onSnooze, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-2xl border border-border m-4">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Snooze Reminder</h2>
              <p className="text-sm text-muted-foreground mt-1">{streakName}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close snooze dialog"
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedOption('30min')}
                className={cn(
                  "h-16 rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-1",
                  selectedOption === '30min'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Clock className="w-4 h-4" />
                30 minutes
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedOption('1hour')}
                className={cn(
                  "h-16 rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-1",
                  selectedOption === '1hour'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Clock className="w-4 h-4" />
                1 hour
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedOption('tomorrow')}
                className={cn(
                  "h-16 rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-1",
                  selectedOption === 'tomorrow'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Clock className="w-4 h-4" />
                Tomorrow 9AM
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedOption('custom')}
                className={cn(
                  "h-16 rounded-xl text-sm font-medium transition-all flex flex-col items-center justify-center gap-1",
                  selectedOption === 'custom'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Clock className="w-4 h-4" />
                Custom
              </button>
            </div>

            {selectedOption === 'custom' && (
              <div className="pt-2">
                <label htmlFor="custom-hours" className="text-sm font-medium text-muted-foreground mb-2 block">
                  Snooze for (hours)
                </label>
                <input
                  id="custom-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={customHours}
                  onChange={(e) => setCustomHours(parseInt(e.target.value) || 1)}
                  aria-label="Custom snooze hours"
                  className="w-full h-12 px-4 rounded-xl bg-muted border border-border text-foreground"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSnooze}
              className="flex-1 h-12 rounded-xl fire-gradient text-white font-medium hover:shadow-lg transition-all"
            >
              Snooze
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
