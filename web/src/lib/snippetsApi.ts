// Typed client for the agent-meow Code Snippets surface endpoints:
//   GET    /v1/sessions/{id}/resources/snippets
//   POST   /v1/sessions/{id}/resources/snippets
//   GET    /v1/sessions/{id}/resources/snippets/search?q=...
//   GET    /v1/sessions/{id}/resources/snippets/{snippetId}
//   PATCH  /v1/sessions/{id}/resources/snippets/{snippetId}
//   DELETE /v1/sessions/{id}/resources/snippets/{snippetId}
//
// Mirrors agent_meow/server/routes/snippets.py.

import { authenticatedFetch } from "./identity";

/** Wire shape of a snippet response from the server. */
interface SnippetWire {
  id: string;
  object: "snippet";
  conversation_id: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string;
  created_at: number;
  updated_at: number;
  created_by: string | null;
}

/** UI-facing snippet record (camelCase). */
export interface Snippet {
  id: string;
  conversationId: string;
  title: string;
  language: string;
  code: string;
  description: string;
  tags: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string | null;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toSnippet(w: SnippetWire): Snippet {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    title: w.title,
    language: w.language,
    code: w.code,
    description: w.description,
    tags: w.tags,
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    createdBy: w.created_by,
  };
}

/** List snippets for a session, newest-first. */
export async function listSnippets(
  conversationId: string,
  opts?: { language?: string; tag?: string },
): Promise<Snippet[]> {
  const params = new URLSearchParams();
  if (opts?.language) params.set("language", opts.language);
  if (opts?.tag) params.set("tag", opts.tag);
  const qs = params.toString();
  const url = `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets${qs ? `?${qs}` : ""}`;
  const res = await authenticatedFetch(url);
  if (!res.ok) {
    throw new Error(`listSnippets failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: SnippetWire[] };
  return body.data.map(toSnippet);
}

/** Search snippets by text in title, code, description, or tags. */
export async function searchSnippets(conversationId: string, query: string): Promise<Snippet[]> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets/search?q=${encodeURIComponent(query)}`,
  );
  if (!res.ok) {
    throw new Error(`searchSnippets failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: SnippetWire[] };
  return body.data.map(toSnippet);
}

/** Fetch a single snippet by id. */
export async function getSnippet(conversationId: string, snippetId: string): Promise<Snippet> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets/${encodeURIComponent(snippetId)}`,
  );
  if (!res.ok) {
    throw new Error(`getSnippet failed: ${res.status} ${res.statusText}`);
  }
  return toSnippet((await res.json()) as SnippetWire);
}

/** Create a new snippet in a session. */
export async function createSnippet(
  conversationId: string,
  input: {
    title: string;
    language?: string;
    code?: string;
    description?: string;
    tags?: string;
  },
): Promise<Snippet> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: input.title,
        language: input.language ?? "text",
        code: input.code ?? "",
        description: input.description ?? "",
        tags: input.tags ?? "",
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`createSnippet failed: ${res.status} ${res.statusText}`);
  }
  return toSnippet((await res.json()) as SnippetWire);
}

/** Update a snippet's fields. */
export async function updateSnippet(
  conversationId: string,
  snippetId: string,
  input: {
    title?: string;
    language?: string;
    code?: string;
    description?: string;
    tags?: string;
  },
): Promise<Snippet> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets/${encodeURIComponent(snippetId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(input.title !== undefined && { title: input.title }),
        ...(input.language !== undefined && { language: input.language }),
        ...(input.code !== undefined && { code: input.code }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.tags !== undefined && { tags: input.tags }),
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`updateSnippet failed: ${res.status} ${res.statusText}`);
  }
  return toSnippet((await res.json()) as SnippetWire);
}

/** Delete a snippet. */
export async function deleteSnippet(conversationId: string, snippetId: string): Promise<Snippet> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/snippets/${encodeURIComponent(snippetId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteSnippet failed: ${res.status} ${res.statusText}`);
  }
  return toSnippet((await res.json()) as SnippetWire);
}