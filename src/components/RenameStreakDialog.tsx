import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const modalStyles = `
  .modal-container {
    position: fixed;
    inset: 0;
    height: 100dvh;
    display: flex;
    align-items: flex-end;
    z-index: 50;
  }
  
  @media (min-width: 768px) {
    .modal-container {
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
  }
  
  .modal-card {
    display: flex;
    flex-direction: column;
    max-height: 100dvh;
    overflow: visible;
  }
  
  @media (min-width: 768px) {
    .modal-card {
      max-height: 85vh;
      overflow: visible;
    }
  }
  
  .modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
  }
  
  .modal-footer {
    flex-shrink: 0;
    position: sticky;
    bottom: 0;
    border-top: 1px solid var(--border-color);
    background-color: var(--card-background);
    z-index: 10;
  }
`;

interface RenameStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  currentName: string;
  existingStreakNames: string[]; // All streak names except current
}

export const RenameStreakDialog = ({
  isOpen,
  onClose,
  onRename,
  currentName,
  existingStreakNames,
}: RenameStreakDialogProps) => {
  const [name, setName] = useState(currentName);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Validate for duplicate names (case-insensitive, trimmed)
  // Exclude the current name from duplicate check
  useEffect(() => {
    const trimmedName = name.trim().toLowerCase();
    const trimmedCurrent = currentName.trim().toLowerCase();
    
    if (trimmedName && trimmedName !== trimmedCurrent && existingStreakNames.some(existingName => 
      existingName.toLowerCase() === trimmedName
    )) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  }, [name, currentName, existingStreakNames]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setIsDuplicate(false);
    }
  }, [isOpen, currentName]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    // Prevent submission if invalid
    if (!trimmedName || isDuplicate || trimmedName.length > 50) {
      return;
    }
    
    onRename(trimmedName);
    onClose();
  }, [name, isDuplicate, onRename, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <style>{modalStyles}</style>
      
      {/* Backdrop - dismisses modal */}
      <div
        className="fixed inset-0 bg-black/50 z-40 modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Dialog Container - MANDATORY: fixed, inset-0, 100dvh */}
      <div 
        className="modal-container md:p-4 p-0"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-dialog-title"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        {/* Modal Card - 3-part structure: header (fixed), body (scrollable), footer (sticky) */}
        <div className="modal-card bg-card rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[520px] md:max-w-[90vw] flex flex-col">
          
          {/* Part 1: Modal Header - Fixed, non-scrollable */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0 border-b border-border/50">
            <h2 id="rename-dialog-title" className="text-xl font-bold text-foreground">Rename Streak</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full -mr-2"
              onClick={onClose}
              aria-label="Close dialog"
              type="button"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Part 2: Form Body */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Modal Body - MANDATORY: flex-1, overflow-y-auto */}
            <div className="modal-body px-6 py-6">
              <div className="space-y-6">
                
                {/* Name input */}
                <div>
                  <label htmlFor="rename-streak-name" className="text-sm font-medium text-muted-foreground mb-3 block">
                    Streak name
                  </label>
                  <Input
                    id="rename-streak-name"
                    type="text"
                    placeholder="e.g., Morning workout"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn(
                      "h-14 rounded-xl bg-muted border-0 text-base px-4",
                      isDuplicate && "border-2 border-destructive bg-destructive/5"
                    )}
                    autoFocus
                    aria-label="Streak name"
                    aria-invalid={isDuplicate}
                    aria-describedby={isDuplicate ? "rename-error" : "rename-counter"}
                    maxLength={50}
                  />
                  {isDuplicate ? (
                    <p id="rename-error" className="text-xs text-destructive mt-2 font-medium">
                      A streak with this name already exists
                    </p>
                  ) : (
                    <p id="rename-counter" className="text-xs text-muted-foreground mt-2">{name.length}/50</p>
                  )}
                </div>
                
              </div>
            </div>

            {/* Part 3: Modal Footer - MANDATORY: sticky, bottom-0, solid background, always visible */}
            <div className="modal-footer px-6 py-4 md:py-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
              <Button
                type="submit"
                disabled={!name.trim() || isDuplicate || name.length > 50 || name.trim() === currentName.trim()}
                className="w-full h-12 md:h-14 rounded-xl fire-gradient text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow touch-manipulation"
                aria-label="Save new streak name"
              >
                Save
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
};
