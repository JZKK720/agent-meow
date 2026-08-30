# Plan 037: Wire setVoiceActive so auto-speak cannot double with voice TTS

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

> **Drift check (run first)**: `git diff --stat e09d5542..HEAD -- web/src/hooks/useRealtimeVoice.ts web/src/lib/readAloudAudio.ts web/src/pages/ChatPage.tsx`
> If any file changed since this plan was written, compare the "Current
> state" excerpts against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/035-rebuild-spa-restart-server.md (baseline live for smoke test)
- **Category**: bug (correctness)
- **Planned at**: commit `e09d5542`, 2026-08-31

## Why this matters

The `isVoiceActive()` guard in `speakText()` (`ChatPage.tsx:3371`) is
supposed to block the auto-speak read-aloud path while the voice pipeline's
TTS is playing, preventing double audio. But `setVoiceActive(true)` is
**never called anywhere** in the codebase — it appears only in a comment at
`ChatPage.tsx:3369`. So `isVoiceActive()` always returns `false`, the guard
never blocks, and auto-speak can fire while voice TTS is playing.

This is a **double-voice source independent of the TTS engine pinning fix**
(`e09d5542`). The engine pinning fix prevents mixing Edge + Qwen3 voices
within a single voice-pipeline turn; this bug causes the voice pipeline
TTS and the read-aloud TTS to play **simultaneously** — two different audio
systems overlapping.

The auto-speak gate (`shouldAutoSpeakReply`, `ChatPage.tsx:3502`) checks
`voiceSessionActive = hermesVoice.getState() === "connected"`, which blocks
auto-speak whenever the voice session is connected. But if the user is on
the **dictation-only path** (voice session not connected, auto-speak on),
and somehow triggers both paths, the guard is absent. More importantly, the
`isVoiceActive` mechanism exists specifically for this coordination and is
dead code — wiring it makes the intent explicit and robust.

## Current state

`web/src/lib/readAloudAudio.ts:115-124` — the `isVoiceActive` / `setVoiceActive`
functions exist but `setVoiceActive` has no callers:

```ts
export function isVoiceActive(): boolean {
  return _voiceActive;
}

export function setVoiceActive(active: boolean): void {
  _voiceActive = active;
  _notifyVoice();
}
```

`web/src/hooks/useRealtimeVoice.ts:165-170` — the `playback.started` handler
calls `stopReadAloud()` but **not** `setVoiceActive(true)`:

```ts
case "playback.started":
  // First audio chunk is playing — switch from "Responding" to "Speaking".
  // Stop any active Read-aloud clip so the two audio systems don't overlap.
  stopReadAloud();
  setIsAudioPlaying(true);
  break;
```

`web/src/hooks/useRealtimeVoice.ts:172-180` — the `audio.done` handler clears
`isAudioPlaying` but **not** `isVoiceActive`:

```ts
case "audio.done":
  // Response audio complete.
  setIsResponding(false);
  setIsAudioPlaying(false);
  // ... (clears transcripts after 1.5s delay)
```

`web/src/pages/ChatPage.tsx:3369-3371` — the guard that never fires:

```ts
  // audio systems would overlap. setVoiceActive(true) already calls
  // stopReadAloud(), but this guard prevents starting a new session.
  if (isVoiceActive()) return;
```

**Confirmed by grep**: `setVoiceActive(true)` and `setVoiceActive(false)`
appear **only** in the comment at `ChatPage.tsx:3369` — never as actual
calls. (grep: `setVoiceActive\(true\)|setVoiceActive\(false\)` → 1 match, in
a comment.)

**Repo conventions** (from `AGENTS.md`):
- Frontend tests are colocated Vitest.
- Match existing test patterns — see `web/src/hooks/useRealtimeVoice.test.ts`.
- Commit style: conventional commits with DCO sign-off.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `cd web && npx tsc --noEmit` | exit 0, no errors |
| Tests (focused) | `cd web && npx vitest run src/hooks/useRealtimeVoice.test.ts src/pages/ChatPage.test.ts` | all pass |
| Lint | `cd web && npx oxlint src/hooks/useRealtimeVoice.ts` | no new errors |

## Scope

**In scope**:
- `web/src/hooks/useRealtimeVoice.ts` — add `setVoiceActive(true)` in
  `playback.started`, `setVoiceActive(false)` in `audio.done`
- `web/src/hooks/useRealtimeVoice.test.ts` — test(s) for the wiring

**Out of scope**:
- `web/src/lib/readAloudAudio.ts` — the `setVoiceActive`/`isVoiceActive`
  functions already exist and are correct; do NOT change them.
- `web/src/pages/ChatPage.tsx` — the `speakText` guard at line 3371 already
  calls `isVoiceActive()`; do NOT change it. (The comment at line 3369
  mentions `setVoiceActive(true)` — you may update the comment to remove
  the "already calls" phrasing if it becomes inaccurate, but no logic change.)
- `web/src/lib/hermesVoice.ts` — do NOT change the TTS pipeline.
- Barge-in, voice provider, unified page — all deferred.

## Git workflow

- Branch: `fix/037-wire-voice-active-flag`
- Commit: `fix(voice): wire setVoiceActive so auto-speak cannot double with voice TTS` with `-s`.
- Do NOT push or open a PR unless instructed.

## Steps

### Step 1: Add setVoiceActive(true) on playback.started

In `web/src/hooks/useRealtimeVoice.ts`, the `handleEvent` callback's
`playback.started` case (around line 165). Import `setVoiceActive` alongside
the existing `stopReadAloud` import at the top of the file:

```ts
import { stopReadAloud, setVoiceActive } from "@/lib/readAloudAudio";
```

Then add `setVoiceActive(true)` in the `playback.started` case:

```ts
      case "playback.started":
        // First audio chunk is playing — switch from "Responding" to "Speaking".
        // Stop any active Read-aloud clip so the two audio systems don't overlap.
        // Mark voice active so speakText()'s isVoiceActive() guard blocks
        // auto-speak from starting a second TTS while voice TTS drains.
        stopReadAloud();
        setVoiceActive(true);
        setIsAudioPlaying(true);
        break;
```

**Verify**: `cd web && npx tsc --noEmit` → exit 0.

### Step 2: Add setVoiceActive(false) on audio.done

In the same `handleEvent` callback, the `audio.done` case (around line 172).
Add `setVoiceActive(false)` to clear the flag when voice TTS completes:

```ts
      case "audio.done":
        // Response audio complete.
        setIsResponding(false);
        setIsAudioPlaying(false);
        // Clear the voice-active flag so auto-speak (speakText) can run again.
        setVoiceActive(false);
```

**Verify**: `cd web && npx tsc --noEmit` → exit 0.

### Step 3: Write the test

In `web/src/hooks/useRealtimeVoice.test.ts`, add a test that:
1. Subscribes to the hook.
2. Drives a `playback.started` event through `hermesVoice.subscribeEvents`.
3. Asserts `isVoiceActive()` returns `true` (import from `@/lib/readAloudAudio`).
4. Drives an `audio.done` event.
5. Asserts `isVoiceActive()` returns `false`.

Model the test structure on the existing tests in the same file (they
already mock the transport and drive events).

**Verify**: `cd web && npx vitest run src/hooks/useRealtimeVoice.test.ts`
→ all pass, including the new test.

### Step 4: Lint check

```powershell
cd web
npx oxlint src/hooks/useRealtimeVoice.ts
cd ..
```
**Verify**: no new errors.

## Test plan

- New test in `web/src/hooks/useRealtimeVoice.test.tsx`:
  - "sets voice active on playback.started and clears on audio.done"
- Pattern: existing tests in the same file (transport mock + event dispatch).
- Verification: `npx vitest run src/hooks/useRealtimeVoice.test.ts` → all pass.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx vitest run src/hooks/useRealtimeVoice.test.ts` all pass (incl. new test)
- [ ] `npx oxlint src/hooks/useRealtimeVoice.ts` reports no new errors
- [ ] `setVoiceActive(true)` is called in the `playback.started` handler
- [ ] `setVoiceActive(false)` is called in the `audio.done` handler
- [ ] `grep -rn "setVoiceActive" web/src/` shows actual calls (not just the comment)
- [ ] No files outside the in-scope list are modified
- [ ] `plans/README.md` status row updated

## STOP conditions

- The code at `useRealtimeVoice.ts:165` or `:172` doesn't match the "Current
  state" excerpts (the handlers have been changed — codebase drifted).
- `setVoiceActive` is not exported from `readAloudAudio.ts` (it is, per
  `readAloudAudio.ts:120` — if not, report; do NOT add the export yourself
  unless it's a trivial missing-export fix).
- The test cannot drive `playback.started`/`audio.done` events through the
  existing mock harness (report — do not refactor the test harness).
- `tsc --noEmit` fails for a reason not covered by the in-scope changes.

## Maintenance notes

- This fix makes the `isVoiceActive()` guard at `ChatPage.tsx:3371` actually
  work. A reviewer should verify that `speakText` is now correctly blocked
  during voice TTS — and that it un-blocks when `audio.done` fires.
- The `shouldAutoSpeakReply` gate (`ChatPage.tsx:3502`) already blocks
  auto-speak when `voiceSessionActive` (voice session connected). This fix
  adds a **second** layer of protection for the case where the voice session
  is connected but the auto-speak effect races (e.g. a reply completes
  between `playback.started` and `audio.done`). The two guards are
  complementary, not redundant.
- **Edge case to watch in review**: if `audio.done` never fires (e.g. the
  voice turn errors out), `setVoiceActive(false)` must still run. The
  `error` case in `handleEvent` (around line 200) sets `isResponding(false)`
  but does NOT currently clear `isVoiceActive`. If a reviewer finds voice
  gets stuck "active" after an error, add `setVoiceActive(false)` to the
  `error` case too — but that is a follow-up, not this plan.
- Follow-up (deferred): the `error` case and any disconnect path should also
  clear `isVoiceActive` to prevent a stuck-active flag.
