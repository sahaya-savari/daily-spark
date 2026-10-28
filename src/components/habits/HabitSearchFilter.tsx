import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, Archive, Trash2, CheckSquare, Square, X } from "lucide-react";
import { type Habit } from "@/lib/habits/types";
import { isArchived } from "@/lib/habits/logic";

export type StatusFilter = "all" | "active" | "starred" | "archived";

interface HabitSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  availableCategories: string[];
  // Bulk selection props
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkStar: (star: boolean) => void;
  onBulkArchive: (archive: boolean) => void;
  onBulkDelete: () => void;
  filteredCount: number;
}

export function filterHabits(
  habits: Habit[],
  query: string,
  status: StatusFilter,
  category: string | null,
): Habit[] {
  const q = query.trim().toLowerCase();

  return habits.filter((h) => {
    // 1. Status Filter
    if (status === "active" && isArchived(h)) return false;
    if (status === "archived" && !isArchived(h)) return false;
    if (status === "starred" && !h.isStarred) return false;

    // 2. Category Filter
    if (category && h.category !== category) return false;

    // 3. Search Query Filter (name, emoji, notes)
    if (q) {
      const matchName = h.name.toLowerCase().includes(q);
      const matchEmoji = h.emoji.toLowerCase().includes(q);
      const matchNotes = h.notes?.toLowerCase().includes(q) ?? false;
      if (!matchName && !matchEmoji && !matchNotes) return false;
    }

    return true;
  });
}

export function HabitSearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  selectedCategory,
  onCategoryChange,
  availableCategories,
  isSelectionMode,
  onToggleSelectionMode,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onBulkStar,
  onBulkArchive,
  onBulkDelete,
  filteredCount,
}: HabitSearchFilterProps) {
  return (
    <div className="space-y-3">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search habits or notes..."
            className="pl-9 bg-surface-1 border-border text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          variant={isSelectionMode ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleSelectionMode}
          className="shrink-0 text-xs gap-1.5"
        >
          {isSelectionMode ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
          {isSelectionMode ? "Done" : "Select"}
        </Button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {(
          [
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "starred", label: "Starred ⭐" },
            { id: "archived", label: "Archived 📦" },
          ] as const
        ).map((pill) => (
          <button
            key={pill.id}
            onClick={() => onStatusFilterChange(pill.id)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              statusFilter === pill.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-surface-2/60 text-muted-foreground hover:text-foreground border border-border/50"
            }`}
          >
            {pill.label}
          </button>
        ))}

        {/* Categories if available */}
        {availableCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(selectedCategory === cat ? null : cat)}
            className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 ${
              selectedCategory === cat
                ? "bg-accent text-accent-foreground"
                : "bg-surface-2/60 text-muted-foreground hover:text-foreground border border-border/50"
            }`}
          >
            #{cat}
          </button>
        ))}
      </div>

      {/* Bulk Action Toolbar when in Selection Mode */}
      {isSelectionMode && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-border text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {selectedIds.size} selected
            </span>
            <button
              onClick={selectedIds.size === filteredCount ? onDeselectAll : onSelectAll}
              className="text-primary hover:underline font-medium"
            >
              {selectedIds.size === filteredCount ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={() => onBulkStar(true)}
              title="Star Selected"
              className="h-8 w-8 p-0"
            >
              <Star className="h-4 w-4 text-warning" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={() => onBulkArchive(true)}
              title="Archive Selected"
              className="h-8 w-8 p-0"
            >
              <Archive className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedIds.size === 0}
              onClick={onBulkDelete}
              title="Delete Selected"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
