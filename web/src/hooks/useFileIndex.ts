// React Query hook for the workspace file index (plan 039).
//
// useFileIndex: fetches the indexed files for the session's workspace
// and keys them by workspace-relative path for the FilesPanel rows.
// Polls on a short interval ONLY while rows are still pending/processing
// (the watcher + meta worker are mid-drain); once the queue is quiet it
// falls back to a long staleTime so an idle panel doesn't hammer the API.
//
// The hook never throws into the UI: a 404 (session without a workspace)
// or a server without the file-index routes yields an empty map, so the
// panel degrades to its pre-039 look.

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getFileIndex, metaBadge, type FileIndexEntry } from "@/lib/fileIndexApi";

const FILE_INDEX_KEY = (conversationId: string) => ["file-index", conversationId] as const;

/** Short poll while the worker is draining the queue. */
const POLL_ACTIVE_MS = 2000;
/** Quiet-mode refresh: the watcher enqueues on fs events, so a slow poll
 *  only backstops missed events (network mounts, runner restarts). */
const STALE_QUIET_MS = 60_000;

export interface FileIndexRow {
  entry: FileIndexEntry;
  /** One-line EXIF/doc summary for the row badge, or null. */
  badge: string | null;
}

/**
 * Indexed files for a session's workspace, keyed by relative path.
 *
 * @param conversationId - The session id, or undefined on `/`.
 * @returns `{ byPath, counts, isLoading }` — `byPath` maps
 *   workspace-relative path → row (entry + badge).
 */
export function useFileIndex(conversationId: string | undefined): {
  byPath: Map<string, FileIndexRow>;
  counts: Record<string, number>;
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: conversationId ? FILE_INDEX_KEY(conversationId) : ["file-index", "none"],
    queryFn: () => getFileIndex(conversationId!),
    enabled: !!conversationId,
    staleTime: STALE_QUIET_MS,
    refetchInterval: (q) => {
      const counts = q.state.data?.counts ?? {};
      const draining = (counts.pending ?? 0) + (counts.processing ?? 0) > 0;
      return draining ? POLL_ACTIVE_MS : false;
    },
    // A server without the endpoint (404) or a workspace-less session
    // shouldn't retry-storm; treat as "no index".
    retry: false,
  });

  const byPath = useMemo(() => {
    const map = new Map<string, FileIndexRow>();
    for (const entry of query.data?.files ?? []) {
      if (entry.status === "gone") continue;
      map.set(entry.path, { entry, badge: metaBadge(entry) });
    }
    return map;
  }, [query.data]);

  return {
    byPath,
    counts: query.data?.counts ?? {},
    isLoading: query.isLoading,
  };
}
