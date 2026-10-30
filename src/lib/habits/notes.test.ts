import { describe, expect, it, beforeEach } from "vitest";
import { noteActions, NOTES_STORAGE_KEY } from "./notes";

describe("notes store", () => {
  beforeEach(() => {
    localStorage.clear();
    noteActions.clearAll();
  });

  it("adds and persists a note in localStorage", () => {
    const note = noteActions.addNote({
      title: "Daily Reflections",
      content: "Made solid progress on the project.",
      pinned: true,
      color: "sage",
    });

    expect(note.title).toBe("Daily Reflections");
    expect(note.content).toBe("Made solid progress on the project.");
    expect(note.pinned).toBe(true);
    expect(note.color).toBe("sage");

    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const stored = JSON.parse(raw!);
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe("Daily Reflections");
  });

  it("updates an existing note with timestamp refresh", () => {
    const note = noteActions.addNote({ title: "Draft", content: "Initial thoughts" });
    const originalCreatedAt = note.createdAt;

    noteActions.updateNote(note.id, {
      title: "Final Draft",
      content: "Polished thoughts",
    });

    const notes = noteActions.getNotes();
    const updated = notes.find((n) => n.id === note.id);
    expect(updated?.title).toBe("Final Draft");
    expect(updated?.content).toBe("Polished thoughts");
    expect(updated?.createdAt).toBe(originalCreatedAt);
    expect(updated?.updatedAt).toBeTruthy();
  });

  it("toggles note pin state", () => {
    const note = noteActions.addNote({ title: "Important Note", pinned: false });
    expect(note.pinned).toBe(false);

    noteActions.pinNote(note.id);
    let notes = noteActions.getNotes();
    expect(notes.find((n) => n.id === note.id)?.pinned).toBe(true);

    noteActions.pinNote(note.id, false);
    notes = noteActions.getNotes();
    expect(notes.find((n) => n.id === note.id)?.pinned).toBe(false);
  });

  it("deletes a note and updates storage", () => {
    const note1 = noteActions.addNote({ title: "Note 1" });
    const note2 = noteActions.addNote({ title: "Note 2" });

    expect(noteActions.getNotes()).toHaveLength(2);

    noteActions.deleteNote(note1.id);
    const notes = noteActions.getNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0]?.id).toBe(note2.id);

    const stored = JSON.parse(localStorage.getItem(NOTES_STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe(note2.id);
  });

  it("replaces all notes for backup restore", () => {
    const customNotes = [
      {
        id: "n-restored-1",
        title: "Restored",
        content: "Backup content",
        createdAt: "2026-10-25T10:00:00Z",
        updatedAt: "2026-10-25T10:00:00Z",
      },
    ];

    noteActions.replaceAll(customNotes);
    expect(noteActions.getNotes()).toHaveLength(1);
    expect(noteActions.getNotes()[0]?.title).toBe("Restored");
  });

  it("preserves custom ID and creation dates when restoring single notes", () => {
    const note = noteActions.addNote({
      id: "explicit-id-99",
      title: "Imported Note",
      content: "Preserved content",
      createdAt: "2026-10-01T00:00:00Z",
      updatedAt: "2026-10-01T00:00:00Z",
      pinned: true,
    });
    expect(note.id).toBe("explicit-id-99");
    expect(note.createdAt).toBe("2026-10-01T00:00:00Z");
    expect(note.pinned).toBe(true);
  });

  it("merges remote notes correctly based on latest timestamp", () => {
    noteActions.addNote({
      id: "shared-note-1",
      title: "Local Version",
      content: "Old local content",
      updatedAt: "2026-10-20T10:00:00Z",
    });

    noteActions.mergeNotes([
      {
        id: "shared-note-1",
        title: "Remote Version",
        content: "Newer remote content",
        createdAt: "2026-10-15T00:00:00Z",
        updatedAt: "2026-10-25T10:00:00Z",
      },
      {
        id: "new-remote-note",
        title: "Brand New Note",
        content: "Never seen before",
        createdAt: "2026-10-25T10:00:00Z",
        updatedAt: "2026-10-25T10:00:00Z",
      },
    ]);

    const notes = noteActions.getNotes();
    expect(notes).toHaveLength(2);
    const shared = notes.find((n) => n.id === "shared-note-1");
    expect(shared?.title).toBe("Remote Version");
    expect(shared?.content).toBe("Newer remote content");
    expect(notes.some((n) => n.id === "new-remote-note")).toBe(true);
  });
});
