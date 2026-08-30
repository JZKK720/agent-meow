# Plan 036: Disable dictation mic during TTS playback (Tier 1 over-hear fix)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

> **Drift check (run first)**: `git diff --stat e09d5542..HEAD -- web/src/pages/ChatPage.tsx web/src/pages/ChatPage.voiceDictation.test.tsx`
> If either file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/035-rebuild-spa-restart-server.md (the baseline must be live to smoke-test)
- **Category**: bug (correctness)
- **Planned at**: commit `e09d5542`, 2026-08-31

## Why this matters

After the user dictates the first prompt and the reply starts playing, the
dictation mic re-enables **while TTS is still playing** (the chat stream
completes before the audio drains), captures the speaker's audio, and
transcribes it as garbage that lands in the composer. This is the
"dictation mic over-hears garbage after the first voice-input prompt"
symptom.

Root cause: `ChatPage`'s `ComposerMicButton` `disabled` expression guards
only `isStreaming` (chat stream active), which flips false when the stream
completes — **not** when TTS finishes. Two TTS systems keep playing after
the stream: the voice pipeline's playQueue (`realtimeVoice.isAudioPlaying`)
and the auto-speak read-aloud path (`readAloudState === "playing"`).

This fix is **additive** (keeps `isStreaming`) and **scoped to the dictation
mic only** — the VAD must stay listening during TTS for future barge-in
support (Tier 2, deferred). The dictation mic uses a separate `getUserMedia`
stream without the AEC reference signal the VAD has, so it genuinely cannot
distinguish echo from user speech.

## Current state

`web/src/pages/ChatPage.tsx:5440` — the `ComposerMicButton` disabled
expression (inside the `Composer` function, which starts at line 4267):

```tsx
<ComposerMicButton
  enableHotkey
  disabled={disabled || isReadOnly || hasPendingElicitation || isStreaming}
  onVoiceStart={() => {
```

**Component scope (critical)**: `Composer` (line 4267) is a **separate
function** from `ChatPage` (line 598) and from `AssistantBubble` (line 3553).
The TTS-busy states are available as follows:

- `realtimeVoice` — **already in scope** inside `Composer`. `Composer` calls
  `useRealtimeVoice()` at line 4305, so `realtimeVoice.isAudioPlaying` is
  directly usable. (Confirmed: `const realtimeVoice = useRealtimeVoice();`
  at `ChatPage.tsx:4305`, inside `Composer`.)
- `readAloudState` — **NOT in scope** inside `Composer`. It is declared at
  `ChatPage.tsx:3567` inside `AssistantBubble` (line 3553). However,
  `useReadAloudState()` (line 3510) is a module-local hook that subscribes
  to module-scope state via `subscribeReadAloudState` — it can be called
  from **any** component, including `Composer`. The executor must add a
  `const readAloudState = useReadAloudState();` call inside `Composer`.

**Alternative (preferred if plan 037 has landed)**: use `useVoiceActive()`
(line 3517) instead of `readAloudState`. After plan 037 wires
`setVoiceActive(true/false)`, `useVoiceActive()` returns `true` whenever
voice TTS is playing — a single boolean that covers both the voice-pipeline
TTS and (transitively, because `playback.started` fires for both) the
read-aloud path. If plan 037 has NOT landed, use `readAloudState` +
`realtimeVoice.isAudioPlaying` as described below.

**Repo conventions** (from `AGENTS.md`):
- Frontend tests are colocated Vitest: `*.test.tsx` beside the component.
- Match existing test patterns — see `web/src/pages/ChatPage.voiceDictation.test.tsx`
  for the voice-mock structure (transport mock with `vi.hoisted`).
- Commit style: conventional commits with DCO sign-off (`git commit -s`).
  Example from `git log`: `fix(voice): pin TTS engine per turn + drop trailing dictation WS events`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `cd web && npx tsc --noEmit` | exit 0, no errors |
| Tests (focused) | `cd web && npx vitest run src/pages/ChatPage.voiceDictation.test.tsx` | all pass |
| Lint | `cd web && npx oxlint src/pages/ChatPage.tsx src/pages/ChatPage.voiceDictation.test.tsx` | no new errors |

## Scope

**In scope**:
- `web/src/pages/ChatPage.tsx` — the `ComposerMicButton` `disabled` prop (line ~5440)
- `web/src/pages/ChatPage.voiceDictation.test.tsx` — new test case(s)

**Out of scope**:
- `web/src/lib/hermesVoice.ts` — do NOT change the VAD pause/resume logic
  (the VAD must stay listening during TTS for barge-in; this plan is
  dictation-mic-only).
- `web/src/components/ComposerMicButton.tsx` — do NOT change the auto-stop
  effect or the `disabled` prop signature.
- `web/src/hooks/useRealtimeVoice.ts` — do NOT change the event handlers.
- The `isVoiceActive` wiring bug (pending issue #3) — that is plan 037.
- Barge-in implementation (Tier 2) — deferred; requires voice provider first.

## Git workflow

- Branch: `fix/036-dictation-mic-tts-guard` (matches repo's `fix/` prefix convention)
- Commit: `fix(voice): disable dictation mic during TTS playback` with `-s` sign-off.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add the readAloudState hook call inside Composer

`readAloudState` is NOT currently in scope inside `Composer` (it's declared
in `AssistantBubble` at line 3567). Add a call to `useReadAloudState()`
inside `Composer`, near the existing `realtimeVoice` declaration (line 4305):

```tsx
  const realtimeVoice = useRealtimeVoice();
  // Read-aloud playback state — used to disable the dictation mic while
  // auto-speak TTS is playing (the chat stream completes before audio drains).
  const readAloudState = useReadAloudState();
```

`useReadAloudState` is already defined at `ChatPage.tsx:3510` and
`subscribeReadAloudState` is imported at the top of the file (line 51).
Confirm the import is present; if not, add it from `@/lib/readAloudAudio`.

**Verify**: `cd web && npx tsc --noEmit` → exit 0 (confirms `useReadAloudState`
is in scope and the import resolves).

### Step 2: Add the TTS-busy guards to the disabled expression

In `web/src/pages/ChatPage.tsx`, find the `ComposerMicButton` disabled prop
(around line 5440). Change:

```tsx
              disabled={disabled || isReadOnly || hasPendingElicitation || isStreaming}
```

to:

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

**Why `loading` too**: the auto-speak path sets `readAloudState` to
`"loading"` while fetching the TTS audio (`ChatPage.tsx:3375`), before
flipping to `"playing"`. If the dictation mic is enabled during the fetch
window, it captures the tail of the previous TTS or ambient noise.

**Verify**: `cd web && npx tsc --noEmit` → exit 0, no errors.

### Step 3: Write the failing-then-passing test

In `web/src/pages/ChatPage.voiceDictation.test.tsx`, add a new `describe`
block after the existing one. Model the test structure on the existing
`describe("ChatPage composer mic binds the active conversation", ...)` block
(lines 131+) — reuse the same transport mock and render harness.

The new test must cover two cases:

1. **Dictation disabled while voice TTS plays**: render `ChatPage`, drive
   the transport mock to `connected` + emit a `playback.started` event (so
   `realtimeVoice.isAudioPlaying` becomes true), set `isStreaming` false,
   and assert the `ComposerMicButton` has `disabled` set (or is not
   clickable / shows the disabled state).
2. **Dictation disabled while read-aloud plays**: render `ChatPage`, drive
   `readAloudState` to `"playing"` (via the `subscribeReadAloudState` mock
   or by triggering the auto-speak effect), set `isStreaming` false, and
   assert the `ComposerMicButton` is disabled.

```tsx
describe("ChatPage composer mic disabled during TTS playback", () => {
  it("is disabled when realtimeVoice.isAudioPlaying is true (voice TTS draining)", async () => {
    // Render ChatPage with the transport mock connected.
    // Emit playback.started so isAudioPlaying flips true.
    // Assert ComposerMicButton.disabled === true even when isStreaming is false.
  });

  it("is disabled when readAloudState is 'playing' (auto-speak reply)", async () => {
    // Render ChatPage, complete a response so auto-speak fires.
    // Drive readAloudState to "playing".
    // Assert ComposerMicButton.disabled === true even when isStreaming is false.
  });
});
```

**Verify**: `cd web && npx vitest run src/pages/ChatPage.voiceDictation.test.tsx`
→ all tests pass, including the 2 new ones.

**Note**: If mocking `readAloudState` proves difficult because
`useReadAloudState` is a local hook (not easily mockable), focus the test on
the `realtimeVoice.isAudioPlaying` case (case 1) which is the primary
over-hear path, and add a comment noting the read-aloud case is covered by
manual smoke test. Do NOT refactor `useReadAloudState` to make it mockable —
that is out of scope.

### Step 4: Lint check

```powershell
cd web
npx oxlint src/pages/ChatPage.tsx src/pages/ChatPage.voiceDictation.test.tsx
cd ..
```
**Verify**: no new errors introduced by this change (pre-existing errors in
unrelated files are fine).

## Test plan

- New tests in `web/src/pages/ChatPage.voiceDictation.test.tsx`:
  - "is disabled when realtimeVoice.isAudioPlaying is true" (regression for
    the over-hear bug)
  - "is disabled when readAloudState is 'playing'" (if feasible without
    refactoring `useReadAloudState`)
- Pattern to model: the existing `describe` block at line 131 of the same
  file (transport mock + render harness + assertion).
- Verification: `npx vitest run src/pages/ChatPage.voiceDictation.test.tsx`
  → all pass.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run src/pages/ChatPage.voiceDictation.test.tsx` all pass (incl. new tests)
- [ ] `npx oxlint src/pages/ChatPage.tsx` reports no new errors
- [ ] The `disabled` expression at `ChatPage.tsx:5440` includes
      `realtimeVoice.isAudioPlaying` and `readAloudState === "playing" || readAloudState === "loading"`
- [ ] `isStreaming` is still present in the expression (NOT dropped — that
      caused the `voice-dictation-regression-2026-08-30` regression)
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at `ChatPage.tsx:5440` doesn't match the "Current state" excerpt
  (the disabled expression has already been changed — the codebase has
  drifted).
- `realtimeVoice` or `readAloudState` is not in scope at the `ComposerMicButton`
  render site (the typecheck will fail — report this; do not move variable
  declarations to make it compile).
- The test cannot be written without refactoring `useReadAloudState` (report
  and write only the `isAudioPlaying` case).
- `tsc --noEmit` fails after the change for a reason not covered by the
  "out of scope" list.

## Maintenance notes

- This fix is **dictation-mic-only**. The VAD (voice pipeline) stays
  listening during TTS — this is intentional, to enable barge-in (Tier 2)
  in a future plan. A reviewer who sees `ttsPlaying` suppressing VAD
  `onSpeechEnd` (`hermesVoice.ts:799`) and thinks "the dictation mic should
  match" should be told: the dictation mic lacks the AEC reference signal
  the VAD has (separate `getUserMedia` stream), so it genuinely cannot
  distinguish echo — disabling it is correct for the dictation path only.
- **Do NOT drop `isStreaming`** from the disabled expression. The failed
  voice refactor (reverted) tried to replace `isStreaming` with
  `voiceTurnState` and caused a regression where dictation kept running
  during LLM generation. This fix is additive.
- Follow-up (deferred to a separate plan): implement barge-in on the VAD
  path — cancel TTS when `onSpeechEnd` fires during playback. Requires the
  voice provider architecture (Option C) first.
