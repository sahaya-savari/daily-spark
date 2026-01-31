import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EMOJI_OPTIONS } from '@/types/streak';
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

interface AddStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string) => void;
  existingStreakNames: string[]; // For duplicate validation
}

export const AddStreakDialog = ({ isOpen, onClose, onAdd, existingStreakNames }: AddStreakDialogProps) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);

  // Validate for duplicate names (case-insensitive, trimmed)
  useEffect(() => {
    const trimmedName = name.trim().toLowerCase();
    if (trimmedName && existingStreakNames.some(existingName => 
      existingName.toLowerCase() === trimmedName
    )) {
      setIsDuplicate(true);
    } else {
      setIsDuplicate(false);
    }
  }, [name, existingStreakNames]);

  // Close emoji picker when clicking outside (UX improvement)
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmojiPicker]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSelectedEmoji('🔥');
      setShowEmojiPicker(false);
      setIsDuplicate(false);
    }
  }, [isOpen]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    // Prevent submission if invalid
    if (!trimmedName || isDuplicate || trimmedName.length > 50) {
      return;
    }
    
    onAdd(trimmedName, selectedEmoji);
    onClose();
  }, [name, selectedEmoji, isDuplicate, onAdd, onClose]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleEmojiPickerToggle = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

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
        aria-labelledby="dialog-title"
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
            <h2 id="dialog-title" className="text-xl font-bold text-foreground">New Streak</h2>
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

          {/* Part 2: Form with scrollable body + sticky footer */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            
            {/* Modal Body - MANDATORY: flex-1, overflow-y-auto */}
            <div className="modal-body px-6 py-6">
              <div className="space-y-6">
                
                {/* Emoji selector - contained within scrollable body */}
                <div>
                  <label htmlFor="emoji-button" className="text-sm font-medium text-muted-foreground mb-3 block">
                    Choose an icon
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Current emoji display - fixed size */}
                    <div className="w-16 h-16 rounded-xl fire-gradient flex items-center justify-center text-4xl flex-shrink-0" aria-live="polite" aria-label={`Selected emoji: ${selectedEmoji}`}>
                      {selectedEmoji}
                    </div>
                    
                    {/* Emoji picker container - relative positioning keeps picker inside scrollable body */}
                    <div className="relative flex-1 min-w-0" ref={emojiPickerRef}>
                      <Button
                        id="emoji-button"
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl justify-start text-base"
                        onClick={handleEmojiPickerToggle}
                        aria-expanded={showEmojiPicker}
                        aria-controls="emoji-grid"
                      >
                        <Smile className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="truncate">Choose emoji</span>
                      </Button>
                      
                      {/* Emoji grid popover - contained with max-height and internal scroll */}
                      {showEmojiPicker && (
                        <div 
                          id="emoji-grid"
                          ref={emojiGridRef}
                          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-3 z-[60] max-h-48 overflow-y-auto"
                          role="listbox"
                          aria-label="Emoji selection"
                        >
                          <div className="grid grid-cols-6 gap-2">
                            {EMOJI_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary",
                                  selectedEmoji === emoji
                                    ? "bg-primary/20 ring-2 ring-primary"
                                    : "hover:bg-muted active:scale-95"
                                )}
                                onClick={() => handleEmojiSelect(emoji)}
                                role="option"
                                aria-selected={selectedEmoji === emoji ? "true" : "false"}
                                aria-label={`Select ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name input - inside scrollable body */}
                <div>
                  <label htmlFor="streak-name" className="text-sm font-medium text-muted-foreground mb-3 block">
                    Streak name
                  </label>
                  <Input
                    id="streak-name"
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
                    aria-describedby={isDuplicate ? "name-error" : "name-counter"}
                    maxLength={50}
                  />
                  {isDuplicate ? (
                    <p id="name-error" className="text-xs text-destructive mt-2 font-medium">
                      A streak with this name already exists
                    </p>
                  ) : (
                    <p id="name-counter" className="text-xs text-muted-foreground mt-2">{name.length}/50</p>
                  )}
                </div>
                
              </div>
            </div>

            {/* Part 3: Modal Footer - MANDATORY: sticky, bottom-0, solid background, always visible */}
            <div className="modal-footer px-6 py-4 md:py-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
              <Button
                type="submit"
                disabled={!name.trim() || isDuplicate || name.length > 50}
                className="w-full h-12 md:h-14 rounded-xl fire-gradient text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow touch-manipulation"
                aria-label={isDuplicate ? "Cannot create streak - duplicate name" : "Create streak"}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Streak
              </Button>
            </div>
            
          </form>
        </div>
      </div>
    </>
  );
};
