import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, X, Smile, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EMOJI_OPTIONS } from '@/types/streak';
import { Reminder } from '@/types/reminder';
import { saveReminder } from '@/services/reminderService';
import { requestNotificationPermission } from '@/services/notificationService';
import { cn } from '@/lib/utils';

interface AddStreakDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string, reminder?: Reminder, color?: string, description?: string, listId?: string) => void;
  existingStreakNames: string[];
  listId?: string;
}

export const AddStreakDialog = ({ isOpen, onClose, onAdd, existingStreakNames, listId }: AddStreakDialogProps) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [description, setDescription] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [repeatType, setRepeatType] = useState<'daily' | 'custom'>('daily');
  const [repeatDays, setRepeatDays] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiGridRef = useRef<HTMLDivElement>(null);
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSelectedEmoji('🔥');
      setShowEmojiPicker(false);
      setIsDuplicate(false);
      setDescription('');
      setReminderEnabled(false);
      setReminderTime('09:00');
      setRepeatType('daily');
      setRepeatDays([true, true, true, true, true, true, true]);
    }
  }, [isOpen]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName || isDuplicate || trimmedName.length > 50) {
      return;
    }

    const reminder: Reminder = {
      enabled: reminderEnabled,
      time: reminderTime,
      repeatType,
      repeatDays,
      description,
    };

    if (reminderEnabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        setReminderEnabled(false);
        onAdd(trimmedName, selectedEmoji, { ...reminder, enabled: false }, undefined, description, listId);
        return;
      }
    }

    onAdd(trimmedName, selectedEmoji, reminder, undefined, description, listId);
  }, [name, selectedEmoji, isDuplicate, reminderEnabled, reminderTime, repeatType, repeatDays, description, onAdd, listId]);

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
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 z-[100] animate-in fade-in duration-200"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-[101] flex items-end md:items-center md:justify-center p-0 md:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Modal Panel */}
        <div 
          className="bg-card w-full md:w-[520px] md:max-w-[90vw] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 -webkit-overflow-scrolling-touch">
              <div className="space-y-6">
                {/* Emoji selector */}
                <div>
                  <label htmlFor="emoji-button" className="text-sm font-medium text-muted-foreground mb-3 block">
                    Choose an icon
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl fire-gradient flex items-center justify-center text-4xl flex-shrink-0" aria-live="polite" aria-label={`Selected emoji: ${selectedEmoji}`}>
                      {selectedEmoji}
                    </div>
                    
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
                      
                      {showEmojiPicker && (
                        <div 
                          id="emoji-grid"
                          ref={emojiGridRef}
                          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl p-3 z-[102] max-h-48 overflow-y-auto"
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

                {/* Name input */}
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

                {/* Description */}
                <div>
                  <label htmlFor="description" className="text-sm font-medium text-muted-foreground mb-3 block">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    placeholder="e.g., 30 minutes at the gym"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full h-24 rounded-xl bg-muted border-0 text-base px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">{description.length}/200</p>
                </div>

                {/* Reminder Section */}
                <div className="space-y-4 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderEnabled}
                      onChange={(e) => setReminderEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-border bg-muted"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Bell className="w-4 h-4" />
                      Enable reminder
                    </span>
                  </label>

                  {reminderEnabled && (
                    <div className="space-y-4 pl-8 border-l-2 border-border/50">
                      {/* Time Picker */}
                      <div>
                        <label htmlFor="reminder-time" className="text-sm font-medium text-muted-foreground mb-2 block">
                          Reminder time
                        </label>
                        <input
                          id="reminder-time"
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="w-full h-12 rounded-xl bg-muted border-0 text-base px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Repeat Type */}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-3 block">
                          Repeat
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRepeatType('daily');
                              setRepeatDays([true, true, true, true, true, true, true]);
                            }}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                              repeatType === 'daily'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            Daily
                          </button>
                          <button
                            type="button"
                            onClick={() => setRepeatType('custom')}
                            className={cn(
                              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                              repeatType === 'custom'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            Custom
                          </button>
                        </div>
                      </div>

                      {/* Custom Days */}
                      {repeatType === 'custom' && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-3">Select days</p>
                          <div className="grid grid-cols-7 gap-2">
                            {dayLabels.map((day, index) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const newDays = [...repeatDays];
                                  newDays[index] = !newDays[index];
                                  setRepeatDays(newDays);
                                }}
                                className={cn(
                                  "h-10 rounded-lg text-xs font-medium transition-colors",
                                  repeatDays[index]
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {day}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div 
              className="flex-shrink-0 px-6 py-4 md:py-5 border-t border-border/50 bg-card"
              style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
              <Button
                type="submit"
                disabled={!name.trim() || isDuplicate || name.length > 50}
                className="w-full h-12 md:h-14 rounded-xl fire-gradient text-white font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-shadow"
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
