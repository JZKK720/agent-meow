// Typed client for the agent-meow Projects surface endpoints:
//   GET    /v1/sessions/{id}/resources/projects
//   POST   /v1/sessions/{id}/resources/projects
//   GET    /v1/sessions/{id}/resources/projects/{projectId}
//   PATCH  /v1/sessions/{id}/resources/projects/{projectId}
//   DELETE /v1/sessions/{id}/resources/projects/{projectId}
//
// Mirrors agent_meow/server/routes/session_projects.py. Wire is snake_case;
// the TS surface is camelCase. Conversions happen at the boundary.

import { authenticatedFetch } from "./identity";

/** Wire shape of a project response from the server. */
interface ProjectWire {
  id: string;
  object: "session_project";
  conversation_id: string;
  name: string;
  description: string;
  status: string;
  created_at: number;
  updated_at: number;
  created_by: string | null;
}

/** UI-facing project record (camelCase). */
export interface SessionProject {
  id: string;
  conversationId: string;
  name: string;
  description: string;
  status: "active" | "archived" | "completed";
  createdAt: number;
  updatedAt: number;
  createdBy: string | null;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toProject(w: ProjectWire): SessionProject {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    name: w.name,
    description: w.description,
    status: w.status as SessionProject["status"],
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    createdBy: w.created_by,
  };
}

/** List projects for a session, newest-first. */
export async function listProjects(conversationId: string): Promise<SessionProject[]> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/projects`,
  );
  if (!res.ok) {
    throw new Error(`listProjects failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: ProjectWire[] };
  return body.data.map(toProject);
}

/** Fetch a single project by id. */
export async function getProject(
  conversationId: string,
  projectId: string,
): Promise<SessionProject> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/projects/${encodeURIComponent(projectId)}`,
  );
  if (!res.ok) {
    throw new Error(`getProject failed: ${res.status} ${res.statusText}`);
  }
  return toProject((await res.json()) as ProjectWire);
}

/** Create a new project. */
export async function createProject(
  conversationId: string,
  input: {
    name: string;
    description?: string;
    status?: string;
  },
): Promise<SessionProject> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/projects`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? "",
        status: input.status ?? "active",
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`createProject failed: ${res.status} ${res.statusText}`);
  }
  return toProject((await res.json()) as ProjectWire);
}

/** Update a project's name, description, and/or status. */
export async function updateProject(
  conversationId: string,
  projectId: string,
  input: {
    name?: string;
    description?: string;
    status?: string;
  },
): Promise<SessionProject> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/projects/${encodeURIComponent(projectId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
        status: input.status,
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`updateProject failed: ${res.status} ${res.statusText}`);
  }
  return toProject((await res.json()) as ProjectWire);
}

/** Delete a project. */
export async function deleteProject(
  conversationId: string,
  projectId: string,
): Promise<SessionProject> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/projects/${encodeURIComponent(projectId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteProject failed: ${res.status} ${res.statusText}`);
  }
  return toProject((await res.json()) as ProjectWire);
}
