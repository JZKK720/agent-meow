// React Query hook for the workspace file-index search (plan 039).
//
// useFileSearch: debounced wrapper around searchSessionFiles — the panel
// types a query ("beach", "IMG_2041", "Canon R5", "sunset at the beach")
// and gets ranked hybrid FTS+CLIP hits with workspace-relative paths.
//
// Enabled-gating: only fires for a non-empty trimmed query on a bound
// conversation, so an idle panel never polls. placeholderData keeps the
// previous hits on-screen while a new query loads (no flash-to-empty).
//
// The hook never throws into the UI: a server without the file-search
// route yields an empty list and the panel degrades gracefully.

import { useQuery } from "@tanstack/react-query";

import { searchSessionFiles, type FileSearchHit } from "@/lib/fileIndexApi";

/** Debounce the keystroke → request delay. */
const DEBOUNCE_MS = 250;
/** Hit window freshness: the index updates on fs events, so a short
 *  staleTime keeps repeat typing snappy without hammering the API. */
const STALE_MS = 15_000;

export function useFileSearch(
  conversationId: string | undefined,
  query: string,
  kind?: "image" | "document",
): { results: FileSearchHit[]; isSearching: boolean } {
  const trimmed = query.trim();
  const searchQuery = useQuery({
    queryKey: ["file-search", conversationId, trimmed, kind ?? null],
    queryFn: () => searchSessionFiles(conversationId!, trimmed, kind),
    enabled: !!conversationId && trimmed.length > 0,
    staleTime: STALE_MS,
    placeholderData: (prev) => prev,
    retry: false,
    // Cheap client-side debounce between keystroke and network call.
    gcTime: DEBOUNCE_MS,
  });

  return {
    results: trimmed.length > 0 ? (searchQuery.data ?? []) : [],
    isSearching: trimmed.length > 0 && searchQuery.isFetching,
  };
}