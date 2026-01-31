import { useState, useEffect, useRef } from 'react';
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

  // Close emoji picker when clicking outside (UX improvement)
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), selectedEmoji);
      // Reset form state
      setName('');
      setSelectedEmoji('🔥');
      setShowEmojiPicker(false);
      onClose();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog - responsive: full width mobile, centered desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50" onClick={(e) => e.stopPropagation()}>
        <div className="bg-card rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:w-[520px] md:max-w-[90vw] max-h-[90vh] md:max-h-[85vh] flex flex-col">
          
          {/* Modal Header - Fixed */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
            <h2 className="text-xl font-bold text-foreground">New Streak</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full -mr-2"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form with scrollable body + sticky footer */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-6 pb-4">
                
                {/* Emoji selector */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Choose an icon
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Current emoji display */}
                    <div className="w-16 h-16 rounded-xl fire-gradient flex items-center justify-center text-4xl flex-shrink-0">
                      {selectedEmoji}
                    </div>
                    
                    {/* Emoji picker button */}
                    <div className="relative flex-1" ref={emojiPickerRef}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 rounded-xl justify-start text-base"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-5 h-5 mr-2" />
                        Choose emoji
                      </Button>
                      
                      {/* Emoji picker popover - absolute positioned, stays in body */}
                      {showEmojiPicker && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl p-4 z-50 max-h-56 overflow-y-auto">
                          <div className="grid grid-cols-6 gap-2">
                            {EMOJI_OPTIONS.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className={cn(
                                  "w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all hover:scale-110",
                                  selectedEmoji === emoji
                                    ? "bg-primary/20 ring-2 ring-primary"
                                    : "hover:bg-muted"
                                )}
                                onClick={() => handleEmojiSelect(emoji)}
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

                {/* Name input */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Streak name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Morning workout"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 rounded-xl bg-muted border-0 text-base px-4"
                    autoFocus
                  />
                </div>
                
              </div>
            </div>

            {/* Modal Footer - Sticky, always visible */}
            <div className="sticky bottom-0 flex-shrink-0 px-6 py-5 border-t border-border bg-card backdrop-blur-sm rounded-b-2xl">
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
