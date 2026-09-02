// React Query hooks for the agent-meow Notes surface.
// Mirrors the useDocuments.ts pattern.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createNote,
  deleteNote,
  listNotes,
  pinNote,
  updateNote,
  type Note,
} from "@/lib/notesApi";

/** Stable query key for a session's notes list. */
export function notesQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "notes"] as const;
}

/** List notes for a session, pinned-first then newest-first. */
export function useNotes(conversationId: string | null | undefined) {
  return useQuery<Note[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "notes"]
        : notesQueryKey(conversationId),
    queryFn: () => listNotes(conversationId!),
    enabled: conversationId != null,
  });
}

/** Create a new note in a session. */
export function useCreateNote(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; bodyMd?: string; pinned?: boolean; tags?: string }) =>
      createNote(conversationId!, input),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: notesQueryKey(conversationId) });
      }
    },
  });
}

/** Update a note's title and/or body and/or tags. */
export function useUpdateNote(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { noteId: string; title?: string; bodyMd?: string; tags?: string }) =>
      updateNote(conversationId!, input.noteId, {
        title: input.title,
        bodyMd: input.bodyMd,
        tags: input.tags,
      }),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: notesQueryKey(conversationId) });
      }
    },
  });
}

/** Pin or unpin a note. */
export function usePinNote(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { noteId: string; pinned: boolean }) =>
      pinNote(conversationId!, input.noteId, input.pinned),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: notesQueryKey(conversationId) });
      }
    },
  });
}

/** Delete a note. */
export function useDeleteNote(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => deleteNote(conversationId!, noteId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: notesQueryKey(conversationId) });
      }
    },
  });
}