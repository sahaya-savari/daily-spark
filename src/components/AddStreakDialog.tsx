import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EMOJI_OPTIONS } from '@/types/streak';
import { cn } from '@/lib/utils';

interface AddStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string) => void;
}

export const AddStreakDialog = ({ isOpen, onClose, onAdd }: AddStreakDialogProps) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        onAdd(name.trim(), selectedEmoji);
        // Reset form state
        setName('');
        setSelectedEmoji('🔥');
        setShowEmojiPicker(false);
        onClose();
      } catch (error) {
        console.error('Error adding streak:', error);
      }
    }
  }, [name, selectedEmoji, onAdd, onClose]);

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
      {/* Backdrop - dismisses modal */}
      <div
        className="fixed inset-0 bg-black/50 z-40 modal-backdrop"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Dialog Container - responsive: full width mobile, centered desktop */}
      <div 
        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 p-0 md:p-4" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Modal Card - 3-part structure (header, scrollable body, sticky footer) */}
        <div className="bg-card rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[520px] md:max-w-[90vw] h-screen md:h-auto max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden">
          
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
            
            {/* Modal Body - Scrollable overflow-y-auto */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
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
                          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-3 z-50 max-h-52 overflow-y-auto"
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
                                aria-selected={selectedEmoji === emoji}
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
                    className="h-14 rounded-xl bg-muted border-0 text-base px-4"
                    autoFocus
                    aria-label="Streak name"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-2">{name.length}/50</p>
                </div>
                
              </div>
            </div>

            {/* Part 3: Modal Footer - Sticky at bottom, always visible */}
            <div className="sticky bottom-0 flex-shrink-0 px-6 py-5 border-t border-border bg-card backdrop-blur-sm rounded-b-t-2xl md:rounded-b-2xl">
              <Button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-14 rounded-xl fire-gradient text-white font-semibold text-base disabled:opacity-50 shadow-lg hover:shadow-xl transition-shadow"
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
