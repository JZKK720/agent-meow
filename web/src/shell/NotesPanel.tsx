// NotesPanel — the right-side rail tab for the agent-meow Notes surface.
// Mirrors DocsPanel.tsx structure: a list of session notes with a new-note
// button. Notes are lightweight markdown — pinned notes appear first.

import { PinIcon, PlusIcon, StickyNoteIcon, Trash2Icon } from "lucide-react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  usePinNote,
} from "@/hooks/useNotes";
import { useTranslation } from "react-i18next";

interface NotesPanelProps {
  /** Called when a note is selected for viewing/editing. */
  onNoteSelect?: (noteId: string) => void;
  /** Currently selected note id, or null. */
  selectedNoteId?: string | null;
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

/** Format an epoch-second timestamp as a short relative date. */
function formatRelativeDate(epochSeconds: number): string {
  if (!epochSeconds) return "";
  const d = new Date(epochSeconds * 1000);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function NotesPanel({
  onNoteSelect,
  selectedNoteId,
  onClose,
  frameless,
}: NotesPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: notes, isLoading, error } = useNotes(conversationId);
  const createNote = useCreateNote(conversationId);
  const deleteNote = useDeleteNote(conversationId);
  const pinNote = usePinNote(conversationId);

  function handleNewNote() {
    createNote.mutate(
      { title: t("chat.untitled", "Untitled"), bodyMd: "" },
      {
        onSuccess: (note) => {
          onNoteSelect?.(note.id);
        },
      },
    );
  }

  function handleDelete(noteId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("notes.deleteConfirm", "Delete this note?"))) {
      deleteNote.mutate(noteId);
    }
  }

  function handlePin(noteId: string, pinned: boolean, e: React.MouseEvent) {
    e.stopPropagation();
    pinNote.mutate({ noteId, pinned: !pinned });
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        frameless ? "" : "rounded-lg border border-border bg-card",
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <StickyNoteIcon className="size-4 text-muted-foreground" />
          <span>{t("notes.title", "Notes")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("notes.newNote", "New note")}
            onClick={handleNewNote}
            disabled={createNote.isPending}
          >
            <PlusIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("notes.closePanel", "Close")}
              onClick={onClose}
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading", "Loading...")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("notes.loadFailed", "Failed to load notes")}
          </div>
        ) : !notes || notes.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <StickyNoteIcon className="size-8 opacity-40" />
            <p>{t("notes.noNotes", "No notes yet")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNewNote}
              disabled={createNote.isPending}
            >
              <PlusIcon className="size-4" /> {t("notes.newNote", "New note")}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notes.map((note) => (
              <li
                key={note.id}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-2 hover:bg-muted/50",
                  selectedNoteId === note.id && "bg-muted",
                )}
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`Open ${note.title}`}
                  onClick={() => onNoteSelect?.(note.id)}
                />
                {note.pinned ? (
                  <PinIcon className="size-4 shrink-0 fill-primary text-primary" />
                ) : (
                  <StickyNoteIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">{note.title}</div>
                  {note.tags && (
                    <div className="truncate text-xs text-muted-foreground">{note.tags}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeDate(note.updatedAt)}
                  </div>
                </div>
                <button
                  type="button"
                  className="relative z-10 shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-muted hover:text-foreground group-hover:opacity-100"
                  aria-label={note.pinned ? t("notes.unpin", "Unpin") : t("notes.pin", "Pin")}
                  onClick={(e) => handlePin(note.id, note.pinned, e)}
                >
                  <PinIcon className={cn("size-3.5", note.pinned && "fill-primary text-primary")} />
                </button>
                <button
                  type="button"
                  className="relative z-10 shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={t("notes.delete", "Delete")}
                  onClick={(e) => handleDelete(note.id, e)}
                >
                  <Trash2Icon className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}