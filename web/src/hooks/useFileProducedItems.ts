import { useMemo } from "react";
import { useWorkspaceChangedFiles } from "@/hooks/useWorkspaceChangedFiles";
import type { RenderItem } from "@/lib/renderItems";

/**
 * Emit `file_produced` RenderItems for files the runner's workspace
 * registry reports as newly *created* during the session.
 *
 * Watches the existing `useWorkspaceChangedFiles` polling (registry-backed,
 * flat list of created/modified/deleted files) and filters to only the
 * "created" entries — modifications and deletions are not surfaced as
 * produced-file chips. Returns an empty array while the conversation is
 * undefined or the query has not yet resolved.
 */
export function useFileProducedItems(
  conversationId: string | undefined,
): RenderItem[] {
  const { data } = useWorkspaceChangedFiles(conversationId);

  return useMemo(() => {
    if (!conversationId || !data) return [];
    return data.data
      .filter((f) => f.status === "created")
      .map((f): RenderItem => ({
        kind: "file_produced",
        itemId: null,
        file: {
          path: f.path,
          // The registry payload has no mime field; default to a generic
          // binary type — the renderer infers a richer type from the path
          // extension when displaying the chip.
          mime: "application/octet-stream",
          size: f.bytes ?? 0,
          contentUrl: `/v1/sessions/${conversationId}/resources/files/${encodeURIComponent(f.path)}/content`,
        },
      }));
  }, [conversationId, data]);
}