// Typed client for the agent-meow Docs surface endpoints:
//   GET    /v1/sessions/{id}/resources/documents
//   POST   /v1/sessions/{id}/resources/documents
//   GET    /v1/sessions/{id}/resources/documents/{docId}
//   PATCH  /v1/sessions/{id}/resources/documents/{docId}
//   DELETE /v1/sessions/{id}/resources/documents/{docId}
//
// Mirrors agent_meow/server/routes/documents.py. Wire is snake_case; the
// TS surface is camelCase. Conversions happen at the boundary.

import { authenticatedFetch } from "./identity";

/** Wire shape of a document response from the server. */
interface DocumentWire {
  id: string;
  object: "document";
  conversation_id: string;
  title: string;
  format: string;
  content_md: string;
  content_json: string | null;
  created_at: number;
  updated_at: number;
  version: number;
  created_by: string | null;
  /** Binary office documents: original filename, else null. */
  filename: string | null;
  /** MIME type of the binary payload, else null. */
  mime: string | null;
  /** ArtifactStore key holding the bytes, else null. */
  artifact_key: string | null;
  /** Binary size in bytes (0 for markdown documents). */
  bytes_size: number;
}

/** UI-facing document record (camelCase). */
export interface Document {
  id: string;
  conversationId: string;
  title: string;
  format: string;
  contentMd: string;
  contentJson: string | null;
  createdAt: number;
  updatedAt: number;
  version: number;
  createdBy: string | null;
  /** Original filename for binary office documents, else null. */
  filename: string | null;
  /** MIME type of the binary payload, else null. */
  mime: string | null;
  /** Whether this document has downloadable binary bytes. */
  hasBinary: boolean;
  /** Binary size in bytes (0 when absent). */
  bytesSize: number;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toDocument(w: DocumentWire): Document {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    title: w.title,
    format: w.format,
    contentMd: w.content_md,
    contentJson: w.content_json,
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    version: w.version,
    createdBy: w.created_by,
    filename: w.filename,
    mime: w.mime,
    hasBinary: Boolean(w.artifact_key),
    bytesSize: w.bytes_size ?? 0,
  };
}

/** List documents for a session, newest-first. */
export async function listDocuments(conversationId: string): Promise<Document[]> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents`,
  );
  if (!res.ok) {
    throw new Error(`listDocuments failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: DocumentWire[] };
  return body.data.map(toDocument);
}

/** Fetch a single document by id. */
export async function getDocument(conversationId: string, documentId: string): Promise<Document> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents/${encodeURIComponent(documentId)}`,
  );
  if (!res.ok) {
    throw new Error(`getDocument failed: ${res.status} ${res.statusText}`);
  }
  return toDocument((await res.json()) as DocumentWire);
}

/**
 * Upload a file as a binary office document (multipart POST).
 *
 * The server stores the bytes in the ArtifactStore and returns the
 * document row (format "binary"); the title becomes the filename minus
 * its extension.
 */
export async function uploadDocumentFile(
  conversationId: string,
  file: File,
): Promise<Document> {
  const form = new FormData();
  form.append("file", file, file.name);
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    throw new Error(`uploadDocumentFile failed: ${res.status} ${res.statusText}`);
  }
  return toDocument((await res.json()) as DocumentWire);
}

/**
 * Fetch a binary document's bytes (the runner's doc_export output etc.).
 *
 * Returns the payload with the server-provided filename and MIME type so
 * the caller can hand it to a downloader / viewer.
 */
export async function getDocumentBinary(
  conversationId: string,
  documentId: string,
): Promise<{ blob: Blob; filename: string; mime: string }> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents/${encodeURIComponent(documentId)}/binary`,
  );
  if (!res.ok) {
    throw new Error(`getDocumentBinary failed: ${res.status} ${res.statusText}`);
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const fallbackName = `${documentId}.bin`;
  return {
    blob: await res.blob(),
    filename: match?.[1] ?? fallbackName,
    mime: res.headers.get("Content-Type") ?? "application/octet-stream",
  };
}

/** Create a new document. */
export async function createDocument(
  conversationId: string,
  input: {
    title: string;
    format?: string;
    contentMd?: string;
    contentJson?: string | null;
  },
): Promise<Document> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        format: input.format ?? "markdown",
        content_md: input.contentMd ?? "",
        content_json: input.contentJson ?? null,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`createDocument failed: ${res.status} ${res.statusText}`);
  }
  return toDocument((await res.json()) as DocumentWire);
}

/** Update a document's title and/or content. */
export async function updateDocument(
  conversationId: string,
  documentId: string,
  input: {
    title?: string;
    contentMd?: string;
    contentJson?: string | null;
  },
): Promise<Document> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents/${encodeURIComponent(documentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        content_md: input.contentMd,
        content_json: input.contentJson,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`updateDocument failed: ${res.status} ${res.statusText}`);
  }
  return toDocument((await res.json()) as DocumentWire);
}

/** Delete a document. */
export async function deleteDocument(
  conversationId: string,
  documentId: string,
): Promise<Document> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/documents/${encodeURIComponent(documentId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteDocument failed: ${res.status} ${res.statusText}`);
  }
  return toDocument((await res.json()) as DocumentWire);
}