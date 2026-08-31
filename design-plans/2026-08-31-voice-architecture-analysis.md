# Voice Pipeline Architecture Analysis: Dictation Over-hear + Unified Page

**Date**: 2026-08-31
**Status**: Analysis — not yet implemented
**Author**: Systematic debugging session (Phase 1 root cause + architecture research)
**Scope**: (1) the remaining dictation over-hear bug after the first voice-input
prompt, (2) deep-dive comparison of the unified-page architecture options.

---

## Part 1 — Dictation mic over-hears garbage after the first prompt

### 1.1 Symptom (precise)

After the user dictates the first prompt on the landing page (`/`) and the
reply starts playing, the dictation mic re-enables **while TTS is still
playing**, captures the speaker's audio, and transcribes it as garbage that
lands in the composer.

### 1.2 Phase 1 root cause (evidence-backed)

**Architecture reality vs the design doc's assumption.** The "unified page"
already half-exists:

- `web/src/App.tsx:131-132` registers **both** `/` and `/c/:conversationId`
  with the **same** `<ChatPage />` element. React Router keeps `ChatPage`
  mounted across the `/` → `/c/:id` transition. `AppShell.test.tsx:298`
  documents this: *"AppShell stays mounted, only the `:conversationId` route
  param changes"*.
- `web/src/pages/ChatPage.tsx:1244` swaps the page **body**:
  `if (!urlConvId) return <NewChatLandingScreen />;`
- So `ChatPage`'s own `useRealtimeVoice()` (`ChatPage.tsx:4305`), chat-store
  subscription, and `useReadAloudState()` (`ChatPage.tsx:3510`) **persist**.
  What unmounts is the `NewChatLandingScreen` subtree, which has its **own**
  `useRealtimeVoice()` (`NewChatDialog.tsx:2156`), its **own**
  `useWakeWordDetector`, its **own** `ComposerMicButton` (with its own
  `DictationSession` ref), and its **own** `dictationActive`/`voiceListening`
  local state.

**The disabled-guard regression.** `ChatPage`'s `ComposerMicButton` disabled
expression (`ChatPage.tsx:5440`):

```tsx
disabled={disabled || isReadOnly || hasPendingElicitation || isStreaming}
```

This guards **only** `isStreaming` (the chat stream active flag). It does
**not** guard:

- `realtimeVoice.isAudioPlaying` — the voice pipeline's TTS playQueue keeps
  draining **after** the LLM stream completes; `audio.done` fires only after
  the full playQueue drains (`hermesVoice.ts:1386`).
- `readAloudState === "playing"` — the auto-speak path added in `f5c3d9d5`
  reads replies via `/v1/audio/speech` **after** the stream completed.

Commit `0047c63d` ("pause mic during LLM processing and TTS playback")
originally added `isStreaming` for both LLM **and** TTS — but `isStreaming`
flips false the moment the chat stream completes, **not** when TTS finishes.
The failed refactor (reverted per `voice-refactor-failed-must-revert.md`)
tried to add `isSpeaking`/`voiceTurnState` guards but **dropped**
`isStreaming` (the regression documented in
`voice-dictation-regression-2026-08-30.md`). After the revert we're back to
`isStreaming`-only — so the dictation mic re-enables mid-TTS, picks up the
speaker, and transcribes it.

**Why the VAD pause fix (`34e52674`) doesn't help here.** That fix pauses the
Silero VAD during the STT→LLM→TTS gap, preventing side-talk leaking into the
**next voice turn**. But the dictation mic is a **separate** consumer
(`DictationSession` / Web Speech) — the VAD pause doesn't touch it. The
dictation mic needs its **own** disable guard tied to TTS playback state.

**Why the dictation WS guard (`e09d5542`) doesn't help here.** That fix added
`this.closed` checks in `DictationSession.ws.onmessage` to stop trailing
frames leaking into the **new** composer after `cancel()`. It addresses the
**navigation** leak (landing → chat unmount), not the **over-hear** leak
(dictation mic re-enabling mid-TTS on the **same** page).

### 1.3 Root cause (single sentence)

`ChatPage`'s dictation `disabled`-guard covers `isStreaming` but not the two
TTS playback systems that continue after the stream completes
(`hermesVoice` playQueue + `readAloud` auto-speak), so the dictation mic
re-enables mid-TTS, captures the speaker's audio, and transcribes it.

### 1.4 Phase 3 hypothesis + Phase 4 fix (revised after web research)

**My original hypothesis** (disable the dictation mic during TTS playback)
is a **symptom fix** that the research [4][5] explicitly calls out as the
broken "walkie-talkie" legacy pattern. It trades the over-hear bug for a
worse UX: no barge-in (the user can't interrupt the assistant mid-sentence).

**Revised approach — two tiers:**

#### Tier 1 (immediate, stops the bleeding): the guard fix, but scoped

Keep the guard fix from my original hypothesis, but **scope it to the
dictation mic only** (not the VAD). The VAD must stay listening during TTS
for barge-in (Tier 2). The dictation mic is a **separate** consumer with a
**separate** `getUserMedia` stream that lacks the AEC reference signal
(§2.4.5), so it genuinely cannot distinguish echo from user speech —
disabling it during TTS is correct **for the dictation path only**.

```tsx
disabled={
  disabled ||
  isReadOnly ||
  hasPendingElicitation ||
  isStreaming ||
  realtimeVoice.isAudioPlaying ||
  readAloudState === "playing" ||
  readAloudState === "loading"
}
```

This is **additive** (keeps `isStreaming`, the mistake that caused the
`voice-dictation-regression-2026-08-30` regression). Failing test in
`ChatPage.voiceDictation.test.tsx`: render `ChatPage`, start a reply, flip
`readAloudState` to `"playing"` **after** `isStreaming` goes false, assert
`ComposerMicButton` is `disabled`.

#### Tier 2 (root-cause, follows the industry standard): barge-in on the VAD path

Implement **barge-in** on the voice pipeline (VAD path), per the OpenAI
Realtime API pattern [4][5]:

1. Keep the VAD listening during TTS playback (do **not** pause it for the
   echo-back guard — `pauseVad()` / `ttsPlaying` currently suppresses
   `onSpeechEnd` during playback, which prevents barge-in).
2. When `onSpeechEnd` fires during TTS playback, **cancel the TTS**:
   - Clear the `playQueue` (drop pending chunks).
   - Stop the currently-playing `AudioBufferSourceNode`.
   - Cancel the in-flight LLM stream (`abortController`).
   - Stop `readAloud` if it's playing.
3. Then process the new user speech as a new turn.

This is a **larger** change to `hermesVoice.processTurn` (the `ttsPlaying`
guard at `hermesVoice.ts:799` and the `playQueue` drain logic at
`hermesVoice.ts:1164-1170`). It should be pursued **after** Tier 1 stops
the dictation over-hear and **after** Option C (voice provider) is in
place, because barge-in requires the VAD and TTS to be coordinated by a
single owner — exactly what the provider establishes.

**Why not Tier 2 alone (without Tier 1)?** The dictation mic is a separate
consumer without AEC reference; even with barge-in on the VAD, the
dictation mic would still capture echo. Tier 1 is necessary for the
dictation path regardless. Tier 2 is necessary for the voice path to
match industry-standard UX.

**Verification (Tier 1)**: `tsc -b` clean, `vitest ChatPage.voiceDictation`
green, live smoke: dictate a prompt, let the reply speak, try clicking the
dictation mic mid-speech — it should stay disabled until TTS finishes.

**Verification (Tier 2, later)**: speak while the assistant is replying —
the TTS should cut off mid-sentence and the new utterance should start a
new turn.

---

## Part 2 — Unified-page architecture: deep-dive comparison

### 2.1 What the codebase actually has (evidence)

| Concern | Current state | File:line |
|---|---|---|
| Route table | `/` and `/c/:id` **both render `<ChatPage />`** | `App.tsx:131-132` |
| ChatPage mount persistence | Stays mounted across `/` → `/c/:id` (documented in test) | `AppShell.test.tsx:298` |
| Body swap | `if (!urlConvId) return <NewChatLandingScreen />;` | `ChatPage.tsx:1244` |
| ChatPage's voice hook | `useRealtimeVoice()` — persists | `ChatPage.tsx:4305` |
| Landing's voice hook | `useRealtimeVoice()` — **separate instance, unmounts** | `NewChatDialog.tsx:2156` |
| Landing's wake-word | `useWakeWordDetector` — unmounts | `NewChatDialog.tsx:2186` |
| Landing's dictation | `ComposerMicButton` with own `DictationSession` ref — unmounts | `NewChatDialog.tsx:3959` |
| Voice transport | `hermesVoice` module singleton — survives | `hermesVoice.ts` (module scope) |
| Chat store | zustand, module scope — survives | (chatStore) |
| Auto-navigate effect | Fires when `assistantTranscript` non-empty | `NewChatDialog.tsx:2270-2280` |

**Key insight**: the "navigation" problem is **not** a React Router remount
of `ChatPage`. It's the **body swap** inside `ChatPage` — the landing
subtree (with its own mic consumers and React state) unmounts while the
voice transport (singleton) keeps running. The design doc's premise ("the
app auto-navigates… causing dictation-mic garbage") is **partially wrong**:
the navigation itself is a no-op for `ChatPage`'s mount; the garbage comes
from the landing subtree's unmount.

### 2.2 The four observed failure modes (what an architecture must fix)

1. **Dictation WS cancel/restart leaking transcripts** — landing's
   `DictationSession` is cancelled on unmount; trailing WS frames leak.
   (`e09d5542` patched this with `this.closed`, but the race remains
   structurally.)
2. **`useRealtimeVoice` re-init losing session binding** — landing's hook
   instance unmounts; `ChatPage`'s hook instance inherits the session via
   `hermesVoice.getAgentMeowSession()` (`useRealtimeVoice.ts:128`), but the
   landing's local `userTranscript`/`assistantTranscript` state is lost.
3. **AudioContext/TTS continuity glitches** — `hermesVoice.audioContext` is
   on the singleton and survives, but the landing's `useWakeWordReply`
   `SpeechSynthesis` instance and the landing's `ComposerMicButton`
   visualizer `AudioContext` are torn down mid-playback.
4. **React state (`dictationActive`, `voiceListening`) dying on unmount** —
   nothing coordinates the mic consumers across the body swap because the
   coordinator state is local to the landing subtree.

### 2.3 Option comparison

#### Option A — Single `WorkspacePage`, optional `:id`, `history.replaceState`

The design doc's proposal. One component renders both modes; URL updates via
`replaceState` (no router navigation).

| Pros | Cons |
|---|---|
| Eliminates the body swap → fixes all 4 failure modes structurally | **Large refactor**: `NewChatDialog.tsx` is ~4000 lines (huge — agent picker, project prefill, sandbox, harness setup, host picker). Merging it into `ChatPage` (also huge) is high-risk. |
| One `useRealtimeVoice`, one `ComposerMicButton`, one `dictationActive` | `history.replaceState` bypasses React Router → back/forward buttons, route guards, and data loaders don't fire. The URL can drift from React state. |
| Smoothest UX (animated mode transition) | Duplicates the "session created" logic currently in `NewChatDialog.handleCreate` — must be reimplemented in the unified component. |
| | `ChatPage` already does URL-driven data loading keyed on `:id` (conversation hydration, scroll, initial-prompt send). A `replaceState`-only approach must reproduce all of that without a remount — exactly what `ChatPage` already does today. |

**Verdict**: highest payoff, highest risk. The codebase is **already 80% of
the way there** (same `ChatPage` for both routes) — the remaining 20% is
removing the body swap. But the body swap exists because `NewChatDialog` is
too entangled to inline. **Defer until Option C is in place.**

#### Option B — React Router layout route with persistent voice shell

Restructure routes so a parent layout route renders the persistent voice/UI
shell, and only the message-list area swaps.

| Pros | Cons |
|---|---|
| Idiomatic React Router — back/forward, guards, data loaders all work | React Router **does** keep layout-route components mounted across child-route changes (this is the documented behavior of nested `<Route element={<Layout/>}>` + `<Outlet/>`). **But** the codebase already has this structure (`AppShell` is the layout, `ChatPage` is the child) — and the bug still happens because the body swap is **inside** `ChatPage`, not between routes. |
| No `replaceState` drift | Doesn't fix the landing-subtree-unmounts problem unless the voice shell moves **above** `ChatPage` — which is Option C. |
| Incremental migration from current structure | The layout route is `AppShell` (sidebar); moving voice state into `AppShell` is feasible but couples the sidebar to voice state. |

**Verdict**: doesn't solve the problem the codebase actually has. The
persistence gap is **inside** `ChatPage`, not between routes. Reject.

#### Option C — Hoist ALL voice state into a provider/singleton above the router

Keep both pages (or the current body-swap). Move **all** voice state —
`useRealtimeVoice`, `useWakeWordDetector`, `dictationActive`,
`voiceListening`, the `ComposerMicButton`'s `DictationSession` ref — into a
`VoiceProvider` mounted **above** the router (in `main.tsx` or `App.tsx`),
backed by `useSyncExternalStore` subscriptions to the `hermesVoice`
singleton.

| Pros | Cons |
|---|---|
| **Navigation-safe by construction** — remounts stop mattering because the state lives above the router | Requires refactoring `ComposerMicButton` to read from the provider instead of local state (moderate). |
| Fixes all 4 failure modes **without** merging the two pages | `DictationSession` is per-take (start/stop) — the provider must own the **current** session ref, but the UI button still drives start/stop. |
| Smallest change that de-risks the voice pipeline independently of the UI merge | The landing's `useWakeWordReply` (browser `SpeechSynthesis`) and the visualizer `AudioContext` are UI-local — they'd need to move too or be split into "transport" (provider) vs "presentation" (local). |
| The `hermesVoice` singleton is **already** a de-facto provider — this option just makes the React binding match | |
| Enables Option A later with near-zero voice risk | |

**Verdict**: **best risk/reward**. The `hermesVoice` singleton already
survives navigation; the bug is that the **React bindings** (`useRealtimeVoice`,
`dictationActive`) don't. A `VoiceProvider` with `useSyncExternalStore`
makes the React state match the singleton's lifetime. This is the
**incremental first step** that de-risks everything else.

#### Option D — Optimistic/instant session creation

Create the session record **before** navigating (or navigate immediately
with a placeholder id, `replaceState` when the real id arrives), so the
"submit on landing → navigate mid-reply" window disappears.

| Pros | Cons |
|---|---|
| Smallest possible change to the navigation flow | Doesn't fix the body-swap unmount — the landing's `ComposerMicButton` still unmounts mid-take. |
| Removes the "navigate mid-reply" UX jank | Session creation is server-side (`createSession` POST) — can't be fully optimistic; the placeholder-id approach adds a new "pending session" state to manage. |
| | The auto-navigate effect (`NewChatDialog.tsx:2270`) navigates on `assistantTranscript` non-empty, **not** on submit — so the window is already "after first token", not "after submit". Optimistic creation doesn't shrink it much. |

**Verdict**: marginal. The navigation window is already small (post-first-
token, not post-submit). Reject as a standalone fix; could complement Option C.

### 2.4 External evidence (web research, 2026-08-31)

#### 2.4.1 React Router: "persist components across navigation" is a known gap

React Router GitHub Discussion #12167 [1] is a feature request asking for a
`persist` prop on `<Route>` to prevent unmount/remount cycles. The discussion
confirms:

- React Router **does** unmount components on route change by default (no
  built-in persistence for child routes).
- `memo`/`useMemo` do **not** solve this — the component is still torn down.
- The accepted workaround is **lifting state above the route** (context
  providers / global stores), exactly as Option C proposes.

This validates that the codebase's current "same `<ChatPage/>` for both
routes" trick (which avoids the router-level remount) is the right instinct,
but the **body swap inside ChatPage** is the remaining gap that Option C
addresses.

#### 2.4.2 Production chat apps: state lives above the route

Research stream [2] surveyed ChatGPT, Claude.ai, LibreChat, Open WebUI, and
LobeChat. Direct code-level confirmation of each app's internal mounting
strategy is limited (closed-source for ChatGPT/Claude.ai), but the
consistent pattern across open-source projects and production guidance [3][7]
is:

- **State is lifted above leaf chat views** via context/custom hooks or
  global stores (zustand in LobeChat's case), so composer and voice state
  survive navigation transitions without reset.
- Basic prototypes use local `useState` inside a single chat component [8] —
  that approach loses draft/state on remount, which is exactly our bug.
- Real-time React chat best practices [11] recommend `ChatContext` for shared
  state (room/user/messages), independent of individual leaf components.

**Pattern**: every mature chat app keeps the composer + voice state in a
**persistent layer above the route**, not per-route. This strongly supports
**Option C**.

#### 2.4.3 Voice assistant interruption: the industry standard is "barge-in", not "disable mic"

This is the most important finding from the research and it **challenges my
Phase 3 hypothesis** (Part 1.4).

The OpenAI Realtime API [4] and voice-agent engineering guides [5] describe
the standard pattern for handling overlapping speech during TTS playback:

> "Realtime API handles interruptions when VAD is enabled, in that it
> detects user speech, cancels the ongoing response, and starts a new one."
> — OpenAI Realtime conversations guide [4]

The pattern is **full-duplex barge-in** [5]:
1. System detects overlapping speech instantly (VAD runs **during** TTS).
2. Stops its own output mid-sentence (`response.cancel` + `output_audio_buffer.clear`).
3. Captures the user's input.
4. Decides whether to respond or continue.

This is the **opposite** of my proposed fix (disable the dictation mic
during TTS). The industry standard is to **keep the mic listening** and
**interrupt the TTS** when the user speaks — "walkie-talkie" half-duplex
(disable mic during TTS) is explicitly called out as the broken legacy
pattern [5]:

> "Traditional voice systems operate like walkie-talkies: only one person
> can talk at a time… The system either ignores you or crashes the entire
> interaction. This isn't how humans talk."

**Implication for our bug**: My "disable dictation mic during TTS" fix
(Part 1.4) is a **symptom fix** that trades the over-hear bug for a
worse UX (no barge-in). The research points to a better root-cause fix:
implement **barge-in** — keep the VAD listening during TTS, and when it
detects speech, cancel the TTS playback (clear the playQueue + stop
readAloud) and start a new turn.

#### 2.4.4 Textual Echo Cancellation (TEC): a third option for the echo

Google Research's TEC paper [6] proposes cancelling TTS playback echo at the
**STT** layer rather than the mic layer: a sequence-to-sequence model takes
both the mic mixture and the **source text** of the TTS playback as inputs,
and predicts the enhanced (echo-removed) user audio. The text is much
smaller than the raw acoustic reference and can be sent to the ASR server
**before** playback is synthesized.

This is relevant because our `hermesVoice` pipeline **already has the TTS
source text** (the `fullText` / `sentenceBuf` in `processTurn`). A TEC-style
approach could let the dictation mic stay active during TTS without
capturing echo — but it requires an ML model on the STT path, which is
heavyweight for our stack. **Not recommended for now**, but noted as a
future option if barge-in proves insufficient.

#### 2.4.5 Acoustic Echo Cancellation (AEC): what we already rely on

Both our mic consumers already request `echoCancellation: true`
(`dictation.ts:225`, `hermesVoice.ts:766` via MicVAD's `getStream` default).
Azure Speech SDK guidance [9] and Microsoft's model-based AEC docs [10]
confirm that browser-level AEC removes *some* of the TTS echo but is
unreliable for full-duplex — it works best when the TTS audio is routed
through the **same AudioContext** as the mic capture (so the AEC algorithm
can reference the playback signal). Our `hermesVoice` already shares the
AudioContext between VAD and TTS playback (`hermesVoice.ts:758`,
`playAudio` uses `this.audioContext.createBufferSource`), so AEC is
working for the **VAD** path. The **dictation** path (`DictationSession`)
uses a **separate** `getUserMedia` stream with its own AudioWorklet — it
does **not** share the VAD's AudioContext, so AEC has no reference signal
for the TTS playback. This is why the dictation mic over-hears while the
VAD (with the shared context) mostly doesn't.

**This is a key new finding**: the dictation mic's over-hear is partly an
**AEC reference-signal** problem, not just a timing/guard problem.

### 2.5 Ranked recommendation

| Rank | Option | Effort | Risk | Fixes failure modes |
|---|---|---|---|---|
| **1** | **C — Voice provider above router** | Medium (refactor `ComposerMicButton` + `useRealtimeVoice` to read from provider) | Low (additive — singleton already exists) | All 4 |
| 2 | A — Single `WorkspacePage` | Large (merge ~4000-line `NewChatDialog` into `ChatPage`) | High (entangled code, URL drift) | All 4 |
| 3 | D — Optimistic session creation | Small | Low | None directly (navigation window already small) |
| 4 | B — Layout route | Medium | Medium | None (problem is inside ChatPage, not between routes) |

### 2.6 Incremental migration path (recommended)

**Step 1 (now)**: Fix the dictation over-hear bug (Part 1.4). One-line
guard addition + failing test. This is independent of any architecture
work and stops the bleeding.

**Step 2 (next)**: Introduce `VoiceProvider` in `main.tsx` (above
`<App/>`). Move `useRealtimeVoice`'s state into it via
`useSyncExternalStore` subscriptions to `hermesVoice`. Both `ChatPage` and
`NewChatLandingScreen` consume the **same** provider instance — no more
duplicate hooks. `dictationActive`/`voiceListening` move into the provider.

**Step 3**: Move `ComposerMicButton`'s `DictationSession` ref into the
provider (the provider owns the current take; the button is a pure UI
trigger). This eliminates the unmount-cancel race structurally.

**Step 4 (optional, later)**: Pursue Option A (unified `WorkspacePage`)
now that voice state is navigation-safe. The merge is still large but the
voice risk is gone — if the merge breaks, voice keeps working because the
provider is above the router.

### 2.7 What NOT to do

- **Do not** attempt Option A (unified page) before Option C. The failed
  refactor (`voice-refactor-failed-must-revert.md`) showed that merging
  voice state with UI state in one component is high-risk.
- **Do not** drop `isStreaming` from the dictation disabled guard (the
  regression that caused `voice-dictation-regression-2026-08-30.md`).
  The fix is **additive** (`isStreaming` + TTS guards), not a replacement.
- **Do not** rely on `history.replaceState` without a router navigation
  strategy — it breaks back/forward and route guards.

---

## Summary

| Question | Answer |
|---|---|
| Dictation over-hear root cause | `disabled`-guard covers `isStreaming` but not TTS playback (`realtimeVoice.isAudioPlaying` + `readAloudState`); compounded by dictation mic's separate `getUserMedia` lacking AEC reference signal (§2.4.5) |
| Immediate fix (Tier 1) | Add TTS guards to dictation `disabled` (additive, scoped to dictation mic only — VAD stays listening for barge-in) |
| Root-cause fix (Tier 2) | Implement barge-in on the VAD path (cancel TTS on speech-during-playback) per OpenAI Realtime API standard [4][5] |
| Unified-page best approach | **Option C** (voice provider above router) first, Option A (unified page) later |
| Why not the design doc's proposal (Option A) directly | `NewChatDialog` is ~4000 lines; merging is high-risk; `replaceState` breaks router semantics (§2.4.1) |
| External evidence | All mature chat apps keep voice/composer state above the route [2][3][7][11]; industry standard for voice interruption is barge-in, not mic-disabling [4][5] |

## Citations (web research, 2026-08-31)

[1] React Router Discussion #12167 — "Persist Components to Avoid
Unmount/Remount Cycles with a `persist` Prop on `<Route>`".
https://github.com/remix-run/react-router/discussions/12167

[2] wigolo research stream — "How do production React chat applications
keep the composer and voice/audio state mounted and persistent across
new-chat to conversation route transitions?" (surveyed ChatGPT,
Claude.ai, LibreChat, Open WebUI, LobeChat). Sources include:
- https://github.com/danny-avila/LibreChat
- https://github.com/lobehub/lobe-chat
- https://docs.openwebui.com/alternatives/librechat/

[3] "Building Production-Grade AI Chat Features in React: The Architecture
Nobody Talks About" — Medium.
https://medium.com/@mihirshahwrites/building-production-grade-ai-chat-features-in-react-the-architecture-nobody-talks-about-2ef1b5d1b63c

[4] OpenAI Realtime conversations guide — "Realtime API handles
interruptions when VAD is enabled, in that it detects user speech,
cancels the ongoing response, and starts a new one."
https://developers.openai.com/api/docs/guides/realtime-conversations

[5] Zed Haque — "Voice Agents That Don't Break When You Interrupt:
Handling Barge-In And Overlapping Speech" (Nov 2025).
https://www.zedhaque.com/blog/voice-agents-handle-interruptions/

[6] Ding, Jia, Hu, Wang (Google) — "Textual Echo Cancellation" (arXiv
2008.06006). https://google.github.io/speaker-id/publications/TEC/

[7] "ReactJS Experts for Real-Time Chat Applications: Best Practices" —
MakersDen. https://makersden.io/blog/reactjs-for-real-time-chat-best-practices

[8] "How to build a chat app in React" — CoreUI.
https://coreui.io/answers/how-to-build-a-chat-app-in-react/

[9] Azure Speech SDK Q&A — "Continuous Recognition not always detecting
speech" (echo cancellation + getUserMedia constraints).
https://learn.microsoft.com/en-in/answers/questions/5522072/

[10] Microsoft — "Model-based echo cancellation audio processing" (Speech
service). https://learn.microsoft.com/en-us/azure/ai-services/speech-service/audio-processing-model-based-echo-cancellation

[11] "WebSockets in React: Hooks, Lifecycle, and Pitfalls" —
websocket.org. https://websocket.org/guides/frameworks/react/
