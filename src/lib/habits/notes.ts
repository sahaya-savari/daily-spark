import { useSyncExternalStore } from "react";
import { type StandaloneNote } from "./types";
import { mergeVaultNotes } from "./vaultSync";

export const NOTES_STORAGE_KEY = "streakflame_notes";

export interface NotesState {
  loaded: boolean;
  notes: StandaloneNote[];
}

const SERVER_STATE: NotesState = { loaded: false, notes: [] };
let state: NotesState = SERVER_STATE;
const listeners = new Set<() => void>();

function readNotesFromStorage(): StandaloneNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (n): n is StandaloneNote =>
        Boolean(n && typeof n === "object" && typeof n.id === "string" && typeof n.title === "string"),
    );
  } catch {
    return [];
  }
}

function persistNotes(notes: StandaloneNote[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error("[daily-spark] could not persist notes", e);
  }
}

function load() {
  if (state.loaded || typeof window === "undefined") return;
  const notes = readNotesFromStorage();
  state = { loaded: true, notes };
}

function set(next: Partial<NotesState>) {
  state = { ...state, ...next };
  if (next.notes !== undefined) {
    persistNotes(state.notes);
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === NOTES_STORAGE_KEY) {
      state = { ...state, loaded: false };
      load();
      listeners.forEach((l) => l());
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function getSnapshot(): NotesState {
  load();
  return state;
}

export function useNotesStore(): NotesState {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

function newNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const noteActions = {
  getNotes(): StandaloneNote[] {
    load();
    return state.notes;
  },

  addNote(input: {
    id?: string;
    title?: string;
    content?: string;
    pinned?: boolean;
    color?: string;
    createdAt?: string;
    updatedAt?: string;
  }): StandaloneNote {
    load();
    const now = new Date().toISOString();
    const note: StandaloneNote = {
      id: input.id || newNoteId(),
      title: input.title?.trim() || "Untitled Note",
      content: input.content ?? "",
      createdAt: input.createdAt || now,
      updatedAt: input.updatedAt || now,
      pinned: Boolean(input.pinned),
      color: input.color,
    };
    set({ notes: [note, ...state.notes] });
    return note;
  },

  mergeNotes(remoteNotes: StandaloneNote[]) {
    load();
    const merged = mergeVaultNotes(state.notes, remoteNotes);
    set({ notes: merged });
  },

  updateNote(id: string, patch: Partial<StandaloneNote>) {
    load();
    const now = new Date().toISOString();
    set({
      notes: state.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              ...patch,
              id: n.id,
              updatedAt: now,
            }
          : n,
      ),
    });
  },

  deleteNote(id: string) {
    load();
    set({ notes: state.notes.filter((n) => n.id !== id) });
  },

  pinNote(id: string, pinned?: boolean) {
    load();
    const now = new Date().toISOString();
    set({
      notes: state.notes.map((n) =>
        n.id === id
          ? {
              ...n,
              pinned: pinned !== undefined ? pinned : !n.pinned,
              updatedAt: now,
            }
          : n,
      ),
    });
  },

  replaceAll(notes: StandaloneNote[]) {
    set({ loaded: true, notes });
  },

  clearAll() {
    set({ loaded: true, notes: [] });
  },
};
