// revealStore — drives the right-rail "reveal these files" flow (plan 039 P1).
//
// Fed by the ``files.revealed`` SSE event (emitted by the runner after
// ``search_files_semantic`` returns hits, or by the server when a voice
// intent routes straight to the search endpoint). AppShell subscribes
// and calls ``setRightRailTab`` + ``openFileViewer`` to auto-open the
// best match. The store holds the latest reveal per session so a rail
// that mounts after the event (e.g. a session switch) can still drain it.

import { create } from "zustand";

export interface RevealRequest {
  /** Workspace-relative posix paths, best match first. */
  paths: string[];
  /** Rail tab to land on ("files" or "images"). */
  tab: "files" | "images";
  /** The search query that produced the hits (for the UI header). */
  query: string;
  /** Epoch ms the reveal was queued — lets a stale drain skip. */
  queuedAt: number;
}

interface RevealState {
  /** sessionId -> latest pending reveal request. */
  pending: Record<string, RevealRequest>;
  /** Queue a reveal for a session (called from the SSE handler). */
  reveal: (sessionId: string, req: Omit<RevealRequest, "queuedAt">) => void;
  /** Claim the pending reveal for a session (one-shot drain). */
  claim: (sessionId: string) => RevealRequest | null;
}

/**
 * Cross-component store of pending file-reveal requests.
 *
 * The SSE ``files.revealed`` handler calls ``reveal``; AppShell's effect
 * calls ``claim`` on mount and on session change to auto-open the rail.
 * A claim is destructive (the request is removed) so a stale mount
 * doesn't re-trigger.
 */
export const useRevealStore = create<RevealState>((set, get) => ({
  pending: {},
  reveal: (sessionId, req) =>
    set((s) => ({
      pending: {
        ...s.pending,
        [sessionId]: { ...req, queuedAt: Date.now() },
      },
    })),
  claim: (sessionId) => {
    const req = get().pending[sessionId];
    if (!req) return null;
    set((s) => {
      const next = { ...s.pending };
      delete next[sessionId];
      return { pending: next };
    });
    return req;
  },
}));
