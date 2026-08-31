// Typed client for the file tags endpoint:
//   GET /v1/sessions/{id}/resources/tags
//
// Tags are populated by the agent calling the image_analyze tool
// (runner-dispatched). This client only reads tags for the UI.

import { authenticatedFetch } from "./identity";

/** One tag with its file count. */
export interface TagSummary {
  tag: string;
  count: number;
}

/** All tags for a session. */
export interface TagsResponse {
  object: "tags_response";
  sessionId: string;
  tags: TagSummary[];
}

/** One tag for one file (from the by-file endpoint). */
export interface FileTagDetail {
  tag: string;
  confidence: number;
  description: string | null;
  model: string;
}

/** Wire shape from the server (snake_case). */
interface TagsResponseWire {
  object: "tags_response";
  session_id: string;
  tags: TagSummary[];
}

interface FileTagsResponseWire {
  object: string;
  session_id: string;
  filename: string;
  tags: FileTagDetail[];
}

/**
 * Fetch all unique tags with file counts for a session.
 *
 * @param conversationId - The session/conversation ID.
 * @returns The tags response with an array of {tag, count}.
 */
export async function getFileTags(conversationId: string): Promise<TagsResponse> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/tags`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`getFileTags failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as TagsResponseWire;
  return {
    object: wire.object,
    sessionId: wire.session_id,
    tags: wire.tags,
  };
}

/**
 * Fetch all tags for one file in a session (matched by trailing path
 * segment on the server). Used by the ImagesPanel to surface AI tags on
 * each gallery thumbnail.
 *
 * @param conversationId - The session/conversation ID.
 * @param filename - The image's filename (basename only).
 */
export async function getFileTagsByFile(
  conversationId: string,
  filename: string,
): Promise<FileTagDetail[]> {
  const qs = new URLSearchParams({ filename });
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/tags/by-file?${qs}`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`getFileTagsByFile failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as FileTagsResponseWire;
  return wire.tags;
}

/** Wire shape for the bulk by-session endpoint. */
interface SessionTagsResponseWire {
  object: string;
  session_id: string;
  tags_by_file: Record<string, FileTagDetail[]>;
}

/**
 * Fetch all tags for a session grouped by file basename — one query for
 * the whole ImagesPanel gallery. Returns a Map keyed by basename so the
 * panel can look up tags per thumbnail in O(1).
 *
 * @param conversationId - The session/conversation ID.
 * @returns Map<basename, FileTagDetail[]>.
 */
export async function getFileTagsBySession(
  conversationId: string,
): Promise<Map<string, FileTagDetail[]>> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/tags/by-session`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`getFileTagsBySession failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as SessionTagsResponseWire;
  return new Map(Object.entries(wire.tags_by_file ?? {}));
}
