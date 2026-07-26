// React Query hooks for the agent-meow Projects surface.
// Mirrors the useDocuments.ts pattern: react-query for the seed fetch,
// with mutation helpers for create/update/delete.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
  type SessionProject,
} from "@/lib/projectsApi";

/** Stable query key for a session's projects list. */
export function projectsQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "projects"] as const;
}

/** Stable query key for a single project. */
export function projectQueryKey(
  conversationId: string,
  projectId: string,
): readonly unknown[] {
  return ["conversation", conversationId, "projects", projectId] as const;
}

/** Fetch a single project by id. */
export function useProject(
  conversationId: string | null | undefined,
  projectId: string | null | undefined,
) {
  return useQuery<SessionProject>({
    queryKey:
      conversationId == null || projectId == null
        ? ["conversation", null, "projects", null]
        : projectQueryKey(conversationId, projectId),
    queryFn: () => getProject(conversationId!, projectId!),
    enabled: conversationId != null && projectId != null,
  });
}

/** List projects for a session, newest-first. */
export function useProjects(conversationId: string | null | undefined) {
  return useQuery<SessionProject[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "projects"]
        : projectsQueryKey(conversationId),
    queryFn: () => listProjects(conversationId!),
    enabled: conversationId != null,
  });
}

/** Create a new project in a session. */
export function useCreateProject(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; status?: string }) =>
      createProject(conversationId!, input),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: projectsQueryKey(conversationId) });
      }
    },
  });
}

/** Update a project's name, description, and/or status. */
export function useUpdateProject(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      projectId: string;
      name?: string;
      description?: string;
      status?: string;
    }) =>
      updateProject(conversationId!, input.projectId, {
        name: input.name,
        description: input.description,
        status: input.status,
      }),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: projectsQueryKey(conversationId) });
      }
    },
  });
}

/** Delete a project. */
export function useDeleteProject(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => deleteProject(conversationId!, projectId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: projectsQueryKey(conversationId) });
      }
    },
  });
}