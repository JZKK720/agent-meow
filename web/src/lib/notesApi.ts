// Typed client for the agent-meow Notes surface endpoints:
//   GET    /v1/sessions/{id}/resources/notes
//   POST   /v1/sessions/{id}/resources/notes
//   GET    /v1/sessions/{id}/resources/notes/{noteId}
//   PATCH  /v1/sessions/{id}/resources/notes/{noteId}
//   POST   /v1/sessions/{id}/resources/notes/{noteId}/pin
//   DELETE /v1/sessions/{id}/resources/notes/{noteId}
//
// Mirrors agent_meow/server/routes/notes.py. Wire is snake_case; the
// TS surface is camelCase. Conversions happen at the boundary.

import { authenticatedFetch } from "./identity";

/** Wire shape of a note response from the server. */
interface NoteWire {
  id: string;
  object: "note";
  conversation_id: string;
  title: string;
  body_md: string;
  pinned: boolean;
  tags: string;
  created_at: number;
  updated_at: number;
  created_by: string | null;
}

/** UI-facing note record (camelCase). */
export interface Note {
  id: string;
  conversationId: string;
  title: string;
  bodyMd: string;
  pinned: boolean;
  tags: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string | null;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toNote(w: NoteWire): Note {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    title: w.title,
    bodyMd: w.body_md,
    pinned: w.pinned,
    tags: w.tags,
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    createdBy: w.created_by,
  };
}

/** List notes for a session, pinned-first then newest-first. */
export async function listNotes(
  conversationId: string,
  opts?: { pinnedOnly?: boolean; tag?: string },
): Promise<Note[]> {
  const params = new URLSearchParams();
  if (opts?.pinnedOnly) params.set("pinned_only", "true");
  if (opts?.tag) params.set("tag", opts.tag);
  const qs = params.toString();
  const url = `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes${qs ? `?${qs}` : ""}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) {
    throw new Error(`listNotes failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: NoteWire[] };
  return body.data.map(toNote);
}

/** Fetch a single note by id. */
export async function getNote(conversationId: string, noteId: string): Promise<Note> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes/${encodeURIComponent(noteId)}`,
  );
  if (!res.ok) {
    throw new Error(`getNote failed: ${res.status} ${res.statusText}`);
  }
  return toNote((await res.json()) as NoteWire);
}

/** Create a new note in a session. */
export async function createNote(
  conversationId: string,
  input: { title: string; bodyMd?: string; pinned?: boolean; tags?: string },
): Promise<Note> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        body_md: input.bodyMd ?? "",
        pinned: input.pinned ?? false,
        tags: input.tags ?? "",
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`createNote failed: ${res.status} ${res.statusText}`);
  }
  return toNote((await res.json()) as NoteWire);
}

/** Update a note's title and/or body and/or tags. */
export async function updateNote(
  conversationId: string,
  noteId: string,
  input: { title?: string; bodyMd?: string; tags?: string },
): Promise<Note> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes/${encodeURIComponent(noteId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.bodyMd !== undefined && { body_md: input.bodyMd }),
        ...(input.tags !== undefined && { tags: input.tags }),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`updateNote failed: ${res.status} ${res.statusText}`);
  }
  return toNote((await res.json()) as NoteWire);
}

/** Pin or unpin a note. */
export async function pinNote(
  conversationId: string,
  noteId: string,
  pinned: boolean,
): Promise<Note> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes/${encodeURIComponent(noteId)}/pin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned }),
    },
  );
  if (!res.ok) {
    throw new Error(`pinNote failed: ${res.status} ${res.statusText}`);
  }
  return toNote((await res.json()) as NoteWire);
}

/** Delete a note. */
export async function deleteNote(conversationId: string, noteId: string): Promise<Note> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/notes/${encodeURIComponent(noteId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteNote failed: ${res.status} ${res.statusText}`);
  }
  return toNote((await res.json()) as NoteWire);
}