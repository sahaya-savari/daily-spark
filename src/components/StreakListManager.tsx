import { useState, useCallback } from 'react';
import { Plus, X, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StreakList } from '@/types/streak';
import { cn } from '@/lib/utils';

interface StreakListManagerProps {
  lists: StreakList[];
  activeListId: string;
  onListChange: (listId: string) => void;
  onCreateList: (name: string, color: string) => void;
  onRenameList: (id: string, newName: string) => void;
  onDeleteList: (id: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Fire', value: 'fire' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Forest', value: 'forest' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Purple', value: 'purple' },
  { name: 'Rose', value: 'rose' },
];

export const StreakListManager = ({
  lists,
  activeListId,
  onListChange,
  onCreateList,
  onRenameList,
  onDeleteList,
}: StreakListManagerProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('fire');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateList = useCallback(() => {
    if (newListName.trim()) {
      onCreateList(newListName.trim(), newListColor);
      setNewListName('');
      setNewListColor('fire');
      setShowCreateForm(false);
    }
  }, [newListName, newListColor, onCreateList]);

  const handleRenameList = useCallback((id: string) => {
    if (editingName.trim()) {
      onRenameList(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  }, [editingName, onRenameList]);

  return (
    <div className="space-y-2">
      {lists.map(list => (
        <div
          key={list.id}
          className={cn(
            'flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer',
            activeListId === list.id
              ? 'bg-primary/10 border-2 border-primary'
              : 'bg-muted border-2 border-transparent hover:border-primary/50'
          )}
        >
          {editingId === list.id ? (
            <div className="flex-1 flex gap-2">
              <Input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameList(list.id);
                  if (e.key === 'Escape') {
                    setEditingId(null);
                    setEditingName('');
                  }
                }}
                onBlur={() => handleRenameList(list.id)}
                className="flex-1 h-8 text-sm"
              />
            </div>
          ) : (
            <>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: list.color === 'fire' ? '#ff6b35' :
                                   list.color === 'ocean' ? '#0ea5e9' :
                                   list.color === 'forest' ? '#22c55e' :
                                   list.color === 'sunset' ? '#f97316' :
                                   list.color === 'purple' ? '#a855f7' :
                                   list.color === 'rose' ? '#ec4899' : '#ff6b35'
                }}
              />
              <span
                className="flex-1 font-medium text-sm"
                onClick={() => onListChange(list.id)}
              >
                {list.name}
              </span>
              {list.id !== 'default' && (
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingId(list.id);
                      setEditingName(list.name);
                    }}
                    className="p-1 hover:bg-background rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteList(list.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {showCreateForm ? (
        <div className="space-y-3 p-3 bg-muted rounded-xl">
          <Input
            autoFocus
            placeholder="List name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateList();
              if (e.key === 'Escape') setShowCreateForm(false);
            }}
            className="h-10 text-sm"
          />
          <div className="grid grid-cols-3 gap-2">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color.value}
                onClick={() => setNewListColor(color.value)}
                className={cn(
                  'h-8 rounded-lg transition-all',
                  newListColor === color.value ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'
                )}
                style={{
                  backgroundColor: color.value === 'fire' ? '#ff6b35' :
                                 color.value === 'ocean' ? '#0ea5e9' :
                                 color.value === 'forest' ? '#22c55e' :
                                 color.value === 'sunset' ? '#f97316' :
                                 color.value === 'purple' ? '#a855f7' :
                                 color.value === 'rose' ? '#ec4899' : '#ff6b35'
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="flex-1"
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          New List
        </button>
      )}
    </div>
  );
};
