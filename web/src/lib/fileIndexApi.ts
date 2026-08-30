// Typed client for the file index endpoints:
//   GET /v1/sessions/{id}/resources/file-index
//   GET /v1/sessions/{id}/resources/file-index/stats
//
// The index is populated by the runner's file watcher + metadata worker
// (plan 039). This client only reads it for the FilesPanel. The server
// stores ABSOLUTE paths; the panel works in workspace-relative posix
// paths, so the client normalizes on the way in (see toRelative).

import { authenticatedFetch } from "./identity";

/** Parsed metadata the meta worker extracts per file (sparse — a file
 *  may carry only a subset of these fields). */
export interface FileIndexMeta {
  // image / EXIF
  format?: string;
  width?: number;
  height?: number;
  exif_datetime?: string;
  datetime_original?: string;
  camera_make?: string;
  camera_model?: string;
  lens_model?: string;
  gps_lat?: number;
  gps_lon?: number;
  orientation?: number;
  // documents
  pages?: number;
  paragraphs?: number;
  words?: number;
  text_excerpt?: string;
  [key: string]: unknown;
}

/** One indexed file, normalized to a workspace-relative posix path. */
export interface FileIndexEntry {
  /** Workspace-relative posix path, e.g. "photos/2026/a.jpg" — matches
   *  the panel's WorkspaceFile.path keys. */
  path: string;
  kind: "image" | "document" | "other";
  size: number;
  status: "pending" | "processing" | "indexed" | "failed" | "duplicate" | "gone";
  contentHash: string;
  thumbPath: string | null;
  error: string | null;
  indexedAt: number;
  meta: FileIndexMeta;
}

export interface FileIndexResponse {
  sessionId: string;
  workspace: string | null;
  files: FileIndexEntry[];
  counts: Record<string, number>;
}

/** Wire shape from the server (snake_case, absolute paths). */
interface FileIndexEntryWire {
  path: string;
  kind: string;
  size: number;
  status: string;
  content_hash: string;
  thumb_path: string | null;
  error: string | null;
  indexed_at: number;
  meta: FileIndexMeta;
}

interface FileIndexResponseWire {
  object: string;
  session_id: string;
  workspace: string | null;
  files: FileIndexEntryWire[];
  counts: Record<string, number>;
}

/**
 * Convert an absolute index path to the panel's workspace-relative posix
 * form. Returns null when the path isn't under the workspace (stale row
 * from a moved folder) so callers can skip it.
 */
export function toRelative(absolutePath: string, workspace: string): string | null {
  const ws = workspace.replace(/\\/g, "/").replace(/\/+$/, "");
  const p = absolutePath.replace(/\\/g, "/");
  if (p === ws) return null;
  if (p.startsWith(ws + "/")) return p.slice(ws.length + 1);
  return null;
}

/**
 * Fetch the file index for a session's workspace.
 *
 * @param conversationId - The session/conversation ID.
 * @param kind - Optional filter ("image" | "document").
 */
export async function getFileIndex(
  conversationId: string,
  kind?: "image" | "document",
): Promise<FileIndexResponse> {
  const qs = kind ? `?kind=${kind}` : "";
  const res = await authenticatedFetch(`/v1/sessions/${conversationId}/resources/file-index${qs}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`getFileIndex failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as FileIndexResponseWire;
  const files: FileIndexEntry[] = [];
  for (const f of wire.files) {
    const rel = wire.workspace ? toRelative(f.path, wire.workspace) : null;
    if (rel === null) continue;
    files.push({
      path: rel,
      kind: f.kind as FileIndexEntry["kind"],
      size: f.size,
      status: f.status as FileIndexEntry["status"],
      contentHash: f.content_hash,
      thumbPath: f.thumb_path,
      error: f.error,
      indexedAt: f.indexed_at,
      meta: f.meta ?? {},
    });
  }
  return {
    sessionId: wire.session_id,
    workspace: wire.workspace,
    files,
    counts: wire.counts ?? {},
  };
}

/** The single most informative one-line label for an entry's metadata.
 *  Exported for tests. Returns null for rows with nothing to show. */
export function metaBadge(entry: Pick<FileIndexEntry, "kind" | "meta">): string | null {
  const m = entry.meta;
  if (entry.kind === "image") {
    const date = m.datetime_original ?? m.exif_datetime;
    if (typeof date === "string" && date.length >= 10) {
      // "2026:08:30 12:00:00" → "2026-08-30"
      return date.slice(0, 10).replace(/:/g, "-").slice(0, 10);
    }
    if (typeof m.camera_model === "string" && m.camera_model) return m.camera_model;
    return null;
  }
  if (entry.kind === "document") {
    if (typeof m.pages === "number" && m.pages > 0) return `${m.pages}p`;
    if (typeof m.words === "number" && m.words > 0) return `${m.words}w`;
    return null;
  }
  return null;
}
