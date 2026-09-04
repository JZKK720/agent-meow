// React Query hooks for the agent-meow Docs surface.
// Mirrors the useTerminals.ts pattern: react-query for the seed fetch,
// with mutation helpers for create/update/delete.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createDocument,
  deleteDocument,
  getDocument,
  getDocumentBinary,
  listDocuments,
  updateDocument,
  uploadDocumentFile,
  type Document,
} from "@/lib/documentsApi";

/** Stable query key for a session's documents list. */
export function documentsQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "documents"] as const;
}

/** Stable query key for a single document. */
export function documentQueryKey(conversationId: string, documentId: string): readonly unknown[] {
  return ["conversation", conversationId, "documents", documentId] as const;
}

/** Fetch a single document by id. */
export function useDocument(
  conversationId: string | null | undefined,
  documentId: string | null | undefined,
) {
  return useQuery<Document>({
    queryKey:
      conversationId == null || documentId == null
        ? ["conversation", null, "documents", null]
        : documentQueryKey(conversationId, documentId),
    queryFn: () => getDocument(conversationId!, documentId!),
    enabled: conversationId != null && documentId != null,
  });
}

/** List documents for a session, newest-first. */
export function useDocuments(conversationId: string | null | undefined) {
  return useQuery<Document[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "documents"]
        : documentsQueryKey(conversationId),
    queryFn: () => listDocuments(conversationId!),
    enabled: conversationId != null,
  });
}

/** Create a new document in a session. */
export function useCreateDocument(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; contentMd?: string; contentJson?: string | null }) =>
      createDocument(conversationId!, input),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: documentsQueryKey(conversationId) });
      }
    },
  });
}

/** Update a document's title and/or content. */
export function useUpdateDocument(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      documentId: string;
      title?: string;
      contentMd?: string;
      contentJson?: string | null;
    }) =>
      updateDocument(conversationId!, input.documentId, {
        title: input.title,
        contentMd: input.contentMd,
        contentJson: input.contentJson,
      }),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: documentsQueryKey(conversationId) });
      }
    },
  });
}

/** Delete a document. */
export function useDeleteDocument(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(conversationId!, documentId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: documentsQueryKey(conversationId) });
      }
    },
  });
}

/** Upload a file as a binary office document in a session. */
export function useUploadDocumentFile(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocumentFile(conversationId!, file),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: documentsQueryKey(conversationId) });
      }
    },
  });
}

/** Fetch a binary document's bytes for download / preview. */
export function useDocumentBinary(
  conversationId: string | null | undefined,
  documentId: string | null | undefined,
) {
  return useQuery({
    queryKey:
      conversationId == null || documentId == null
        ? ["conversation", null, "documents", null, "binary"]
        : [...documentQueryKey(conversationId, documentId), "binary"],
    queryFn: () => getDocumentBinary(conversationId!, documentId!),
    enabled: conversationId != null && documentId != null,
    // Binary payloads are fetched on demand (download click), not cached stale.
    gcTime: 0,
    staleTime: 0,
  });
}