// React Query hooks for the agent-meow Code Snippets surface.
// Mirrors the useDocuments.ts pattern.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSnippet,
  deleteSnippet,
  listSnippets,
  updateSnippet,
  type Snippet,
} from "@/lib/snippetsApi";

/** Stable query key for a session's snippets list. */
export function snippetsQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "snippets"] as const;
}

/** List snippets for a session, newest-first. */
export function useSnippets(conversationId: string | null | undefined) {
  return useQuery<Snippet[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "snippets"]
        : snippetsQueryKey(conversationId),
    queryFn: () => listSnippets(conversationId!),
    enabled: conversationId != null,
  });
}

/** Create a new snippet in a session. */
export function useCreateSnippet(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      language?: string;
      code?: string;
      description?: string;
      tags?: string;
    }) => createSnippet(conversationId!, input),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: snippetsQueryKey(conversationId) });
      }
    },
  });
}

/** Update a snippet's fields. */
export function useUpdateSnippet(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      snippetId: string;
      title?: string;
      language?: string;
      code?: string;
      description?: string;
      tags?: string;
    }) =>
      updateSnippet(conversationId!, input.snippetId, {
        title: input.title,
        language: input.language,
        code: input.code,
        description: input.description,
        tags: input.tags,
      }),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: snippetsQueryKey(conversationId) });
      }
    },
  });
}

/** Delete a snippet. */
export function useDeleteSnippet(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (snippetId: string) => deleteSnippet(conversationId!, snippetId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: snippetsQueryKey(conversationId) });
      }
    },
  });
}