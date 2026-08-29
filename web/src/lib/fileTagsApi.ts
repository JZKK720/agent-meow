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

/** Wire shape from the server (snake_case). */
interface TagsResponseWire {
  object: "tags_response";
  session_id: string;
  tags: TagSummary[];
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
