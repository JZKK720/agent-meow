// React Query hook for the workspace file scanner.
// Triggers a scan and invalidates all three surface query caches on success.

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { scanWorkspace, type WorkspaceScanResult } from "@/lib/workspaceScanApi";
import { documentsQueryKey } from "@/hooks/useDocuments";
import { imagesQueryKey } from "@/hooks/useImages";
import { videosQueryKey } from "@/hooks/useVideos";

/**
 * Mutation hook to scan the session workspace for files.
 *
 * On success, invalidates the docs, images, and videos query caches so the
 * panels refresh automatically.
 */
export function useScanWorkspace() {
  const qc = useQueryClient();

  return useMutation<
    WorkspaceScanResult,
    Error,
    { conversationId: string }
  >({
    mutationFn: ({ conversationId }) => scanWorkspace(conversationId),
    onSuccess: (_data, variables) => {
      // Invalidate all three surface caches so panels refresh.
      qc.invalidateQueries({ queryKey: documentsQueryKey(variables.conversationId) });
      qc.invalidateQueries({ queryKey: imagesQueryKey(variables.conversationId) });
      qc.invalidateQueries({ queryKey: videosQueryKey(variables.conversationId) });
    },
  });
}
