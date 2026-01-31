import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), selectedEmoji);
      setName('');
      setSelectedEmoji('🔥');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Dialog - positioned at bottom for mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <div className="bg-card rounded-t-2xl p-4 pb-8 shadow-lg max-w-[720px] mx-auto max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">New Streak</h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full touch-target"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Emoji picker - scrollable on small screens */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Choose an icon
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center text-xl touch-target",
                      "transition-colors active:scale-95",
                      selectedEmoji === emoji
                        ? "fire-gradient"
                        : "bg-muted"
                    )}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Streak name
              </label>
              <Input
                type="text"
                placeholder="e.g., Morning workout"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl bg-muted border-0 text-base"
                autoFocus
              />
            </div>

            {/* Submit button - full width, prominent */}
            <Button
              type="submit"
              disabled={!name.trim()}
              className="w-full h-14 rounded-xl fire-gradient text-white font-semibold text-base disabled:opacity-50"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Streak
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
