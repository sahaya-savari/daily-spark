import React, { useState, useMemo } from "react";
import { useNotesStore, noteActions } from "@/lib/habits/notes";
import { type StandaloneNote } from "@/lib/habits/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Pin, Plus, Trash2, Edit3, X, FileText } from "lucide-react";
import FolderFloat from "@/components/ui/FolderFloat";
import { toast } from "sonner";

export function NotesView({ createRequest = 0 }: { createRequest?: number }) {
  const { notes } = useNotesStore();
  const [search, setSearch] = useState("");
  const [editingNote, setEditingNote] = useState<StandaloneNote | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState<string | undefined>(undefined);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? notes.filter(
          (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
        )
      : notes;

    // Pinned notes come first, then sorted by updatedAt desc
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search]);

  const handleStartCreate = () => {
    setTitle("");
    setContent("");
    setColor(undefined);
    setIsCreating(true);
    setEditingNote(null);
  };

  React.useEffect(() => {
    if (createRequest > 0) handleStartCreate();
  }, [createRequest]);

  const folderItems = useMemo(() => {
    if (notes.length > 0) {
      return notes.slice(0, 8).map((n) => ({
        label: n.title.length > 22 ? `${n.title.slice(0, 20)}…` : n.title,
        value: n.id,
      }));
    }
    return [
      { label: "Daily Reflection", value: "Daily Reflection" },
      { label: "Morning Gratitude", value: "Morning Gratitude" },
      { label: "Workout & Energy", value: "Workout & Energy" },
      { label: "Evening Wind Down", value: "Evening Wind Down" },
    ];
  }, [notes]);

  const handleSave = () => {
    if (editingNote) {
      noteActions.updateNote(editingNote.id, {
        title: title.trim() || "Untitled Note",
        content,
        color,
      });
      setEditingNote(null);
      toast.success("Note updated");
    } else if (isCreating) {
      noteActions.addNote({
        title: title.trim() || "Untitled Note",
        content,
        color,
      });
      setIsCreating(false);
      toast.success("Note created");
    }
  };

  const handleStartEdit = (note: StandaloneNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color);
    setIsCreating(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and New Note Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-9 bg-surface-1 border-border text-foreground"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button size="sm" onClick={handleStartCreate} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </Button>
      </div>

      {/* Interactive Folder & Collection Float (matter-js zero-gravity pills) */}
      <div className="flex flex-col items-center justify-center pt-1 pb-3 overflow-visible">
        <FolderFloat
          items={folderItems}
          label="Notes Collection"
          sublabel={notes.length > 0 ? `${notes.length} notes` : "Tap to open"}
          trigger="click"
          physics={true}
          drift={0.35}
          width={180}
          height={115}
          spread={150}
          lift={24}
          onSelect={(value) => {
            if (notes.length > 0) {
              const matched = notes.find((n) => n.id === value || n.title === value);
              if (matched) handleStartEdit(matched);
            } else {
              setTitle(value);
              setContent("");
              setIsCreating(true);
            }
          }}
          folderColor="var(--surface-2, #1E2433)"
          frontColor="var(--surface, #141824)"
          paperColor="var(--ember, #F59E0B)"
          itemColor="var(--surface-2, #1E2433)"
          itemTextColor="var(--foreground, #F8FAFC)"
          labelColor="var(--foreground, #F8FAFC)"
        />
      </div>

      {/* Editor Card (Creating or Editing) */}
      {(isCreating || editingNote) && (
        <div className="p-4 rounded-xl bg-surface-2 border border-border space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {editingNote ? "Edit Note" : "New Note"}
            </span>
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-surface-1 font-medium"
          />

          <Textarea
            placeholder="Write your reflection, thoughts, or log here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="bg-surface-1 text-sm resize-none"
          />

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingNote(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Note
            </Button>
          </div>
        </div>
      )}

      {/* Notes Grid / List */}
      {filteredNotes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No notes found.</p>
          <p className="text-xs mt-1">Capture reflections, thoughts, or daily logs here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl bg-surface-1 border border-border/70 hover:border-border transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-semibold text-foreground text-sm line-clamp-1">
                    {note.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => noteActions.pinNote(note.id)}
                      className={`p-1 rounded hover:bg-surface-2 transition-colors ${
                        note.pinned ? "text-primary" : "text-muted-foreground/60 hover:text-foreground"
                      }`}
                      title={note.pinned ? "Unpin Note" : "Pin Note"}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleStartEdit(note)}
                      className="p-1 rounded text-muted-foreground/60 hover:text-foreground hover:bg-surface-2 transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => noteActions.deleteNote(note.id)}
                      className="p-1 rounded text-muted-foreground/60 hover:text-destructive hover:bg-surface-2 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap leading-relaxed">
                  {note.content || <span className="italic opacity-60">No content</span>}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                {note.pinned && <span className="text-primary font-medium">Pinned</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
