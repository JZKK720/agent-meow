# Design Proposal: Unified Landing + Chat Page

**Date**: 2026-08-30
**Status**: Proposal — not yet implemented
**Author**: Voice pipeline debugging session

## Problem

The current architecture has two separate pages:

1. **NewChatDialog** (landing page `/`) — paw-mic button, wake word chip,
   doc/image/video attachment bricks, composer. Creates a new session on
   submit.
2. **ChatPage** (session page `/c/:id`) — chat bubbles, composer, voice
   integration. The session already exists.

When the user submits from NewChatDialog, the app **auto-navigates** to
ChatPage as soon as the LLM starts responding. This navigation causes:

- **Dictation-mic garbage**: The DictationSession's WebSocket receives
  trailing events after `cancel()` during the unmount→remount transition.
  (Fixed in `e09d5542` with `this.closed` guard, but the root cause is
  the navigation itself.)
- **Voice session re-binding**: `hermesVoice` is a singleton (survives
  navigation), but `useRealtimeVoice` re-initializes on ChatPage mount,
  potentially re-binding the session or losing state.
- **Audio context disruption**: The AudioContext for TTS playback is
  shared, but the component that owns the UI state changes, causing
  brief glitches.
- **User disorientation**: The page jumps mid-reply — the user sees
  the paw-mic disappear and chat bubbles appear while the voice is
  still playing.

## Proposal: One Page, Two Modes

Make the landing page (`/`) and the chat page (`/c/:id`) the **same
component** — a unified `WorkspacePage` that adapts its UI based on
whether a session is active.

### Mode 1: Landing (no session)

- Paw-mic button (large, centered)
- Wake word chip
- Doc/image/video attachment bricks
- Composer (text input)
- No chat bubbles

### Mode 2: Chat (session active)

- Paw-mic button (shrinks to composer-attached, like ChatPage)
- Wake word chip (moves to header or stays)
- Attachment bricks (collapse into composer attachments)
- Composer (same, now bound to the session)
- Chat bubbles (appear as the session progresses)

### Transition

When the user submits (text or voice), the page **does not navigate**.
Instead:

1. A session is created (or reused) in-place.
2. The URL updates to `/c/:id` (via `history.replaceState`, no React
   Router navigation — the component stays mounted).
3. The UI animates from landing mode to chat mode:
   - Paw-mic shrinks/moves to the composer.
   - Attachment bricks collapse.
   - Chat bubbles fade in.
4. The voice pipeline (hermesVoice singleton) keeps running — no
   re-initialization, no mic re-acquisition, no DictationSession
   cancel/restart.

### Benefits

- **No navigation = no voice leak**: The DictationSession, VAD, and
  AudioContext all stay alive. No unmount→remount race conditions.
- **No voice session re-binding**: `useRealtimeVoice` stays mounted,
  its state persists.
- **Smoother UX**: The page doesn't jump — the user sees a smooth
  transition from "landing" to "chat" within the same view.
- **Simpler code**: One component instead of two. No auto-navigate
  effect, no `navigatedRef`, no session-rebinding logic.

### Implementation Sketch

```tsx
// WorkspacePage.tsx — replaces both NewChatDialog and ChatPage
function WorkspacePage() {
  const { sessionId } = useParams();  // null on "/", set on "/c/:id"
  const [localSessionId, setLocalSessionId] = useState(sessionId);

  // If the URL has a session, use it. Otherwise, create on submit.
  const activeSessionId = sessionId ?? localSessionId;
  const isLanding = !activeSessionId;

  // Update URL without navigation when a session is created.
  const handleSessionCreated = (id: string) => {
    setLocalSessionId(id);
    window.history.replaceState({}, "", `/c/${id}`);
  };

  return (
    <div>
      {isLanding ? <LandingHero /> : <ChatBubbles sessionId={activeSessionId} />}
      <Composer
        sessionId={activeSessionId}
        onSubmit={isLanding ? handleSessionCreated : undefined}
      />
    </div>
  );
}
```

### Migration Path

This is a **large refactor** — it touches routing, session creation,
and the entire UI layout. It should NOT be done in the same PR as
voice pipeline fixes. The recommended approach:

1. **Phase 1** (done): Fix the immediate voice bugs (TTS pinning,
   dictation WS guard) as isolated patches on the current architecture.
2. **Phase 2**: Prototype the unified page as a separate route
   (`/workspace`) running alongside the existing `/` and `/c/:id`.
3. **Phase 3**: Migrate users to the unified page and remove the old
   routes.

### Risks

- **Layout complexity**: The landing page and chat page have different
  layouts (centered hero vs. full-height chat column). Combining them
  requires careful CSS transitions.
- **Session lifecycle**: The current flow creates a session on submit.
  The unified page needs to handle "no session → session created →
  session active" transitions smoothly.
- **Voice session binding**: `hermesVoice.setAgentMeowSession()` is
  currently called on ChatPage mount. In the unified page, it would
  be called when the session is created — the timing changes.

## Conclusion

This design eliminates the root cause of the voice leak (navigation)
rather than patching its symptoms. The current fix (`this.closed` guard
in dictation WS) is a safety net, but the unified page would make it
unnecessary. This should be pursued as a follow-up refactor after the
immediate voice fixes are validated.
