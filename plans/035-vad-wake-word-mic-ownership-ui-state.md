# Plan 035: Fix wake-word TTS echo-back + UI state + dictation disable

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 7d79bb9bb..HEAD -- web/src/hooks/useWakeWordDetector.ts web/src/hooks/useRealtimeVoice.ts web/src/shell/NewChatDialog.tsx web/src/lib/hermesVoice.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Terminology

This plan uses these terms precisely as they appear in the code:

- **VAD** (Silero VAD) — the `@ricky0123/vad-web` MicVAD instance. It owns
  the mic via `getUserMedia`, segments speech, and calls `onSpeechEnd` with
  a `Float32Array` of speech audio. It does NOT do transcription — that's
  STT (a separate HTTP call to Hermes/whisper).
- **Wake word system** — the overall system that listens for "橘宝". It has
  two modes: (1) **VAD wake-word mode** — the VAD is connected, speech
  segments go to STT then keyword check; (2) **fallback SpeechRecognition** —
  the VAD is NOT connected, the browser's Web Speech API listens for "橘宝".
- **Voice session** (paw-mic) — the full VAD → STT → LLM → TTS pipeline.
  Started by clicking the paw button or by the wake word firing.
- **Dictation** (ComposerMicButton) — separate SpeechRecognition that
  transcribes speech into the composer text box. NOT connected to the VAD
  or LLM — just STT → text input.
- **playReply()** — browser `SpeechSynthesis` TTS that plays "橘宝在呢" when
  the wake word fires. This is SEPARATE from hermesVoice's own TTS pipeline
  (which plays the LLM response). The VAD's half-duplex guard (`ttsPlaying`)
  does NOT cover `playReply()`.

## Status

- **Priority**: P0
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `7d79bb9bb`, 2026-08-29

## Why this matters

The VAD wake-word system has two bugs that break the mic ownership matrix:

### Bug 1: TTS echo-back gap (P0 — the VAD sends "橘宝在呢" to STT as user speech)

When the Electron app auto-starts the VAD in wake-word mode and the user says
"橘宝" (or "橘猫" — both are wake words per `wakeWords.ts`), the `onWakeWord`
callback plays a TTS reply "橘宝在呢" via browser `SpeechSynthesis`. But the
VAD is still running during the TTS reply. The mic picks up "橘宝在呢" from
the speakers, and the following sequence sends it to the LLM as user speech:

**Verified timeline (VAD wake-word mode, Electron auto-start):**

```
T=0.0s   User says "橘宝" (~0.5s speech)
T=0.5s   User stops speaking → VAD waits redemptionMs (1000ms)
T=1.5s   VAD fires onSpeechEnd("橘宝" audio)
         → processWakeWordSpeech → STT (200ms round-trip)
T=1.7s   STT returns "橘宝" → containsWakeWord → true → emit wake.word
         → onWakeWord() fires → playReply() starts "橘宝在呢" via SpeechSynthesis
         *** VAD still running, ttsPlaying=false, isProcessing=false ***
         *** VAD mic picks up "橘宝在呢" from speakers ***

T=2.2s   "橘宝在呢" finishes playing → playReply() resolves
         → stopWakeWordModeForTurn() → wakeWordMode = false
         (but VAD already captured "橘宝在呢" audio at T=1.7-2.2s)

T=2.2s   VAD detects speech end of "橘宝在呢" → waits redemptionMs (1000ms)
T=3.2s   VAD fires onSpeechEnd("橘宝在呢" audio)
         → ttsPlaying=false, isProcessing=false
         → wakeWordMode=false (set at T=2.2s by stopWakeWordModeForTurn)
         → processVadSpeech("橘宝在呢") → isProcessing=true
         → STT transcribes "橘宝在呢"
         → LLM receives "橘宝在呢" as user prompt
         → LLM responds to "橘宝在呢" instead of the user's actual question
```

**Why the existing guards don't catch it:**
- `ttsPlaying` — only set by hermesVoice's own TTS pipeline (lines 974, 1029),
  NOT by browser `SpeechSynthesis` used by `playReply()`. During `playReply()`,
  `ttsPlaying = false`.
- `isProcessing` — only set by `processVadSpeech` (line 907). At T=3.2s when
  the echo-back `onSpeechEnd` fires, no voice turn has started yet, so
  `isProcessing = false`.
- `wakeWordMode` re-guard in `processWakeWordSpeech` (line 858) — checks
  `!this.wakeWordMode` after the async STT round-trip. But the echo-back
  audio goes to `processVadSpeech` (not `processWakeWordSpeech`) because
  `wakeWordMode` was set to `false` by `stopWakeWordModeForTurn()` at T=2.2s.
  The re-guard in `processWakeWordSpeech` is never reached.
- Fallback SpeechRecognition cooldown (`lastWakeWordTimeRef`, 1500ms) — only
  applies to the fallback SpeechRecognition path, NOT to the VAD wake-word
  path. `processWakeWordSpeech` has no cooldown.

**Why Scenario A (fallback, no VAD) does NOT have this gap:**
In Scenario A, `playReply()` resolves → `realtimeVoice.connect()` → VAD
connects AFTER the TTS finishes. The VAD doesn't exist during `playReply()`,
so it can't pick up "橘宝在呢". The 1500ms cooldown in the fallback
SpeechRecognition handles any echo-back in that path.

### Bug 2: UI state mismatch (P1 — paw and chip show wrong state)

When the Electron app auto-starts the VAD in wake-word mode,
`realtimeVoice.state` becomes `"connected"`, which causes:

1. The paw button shows "Stop" / "Listening…" even though the VAD is only
   background-listening for the wake word "橘宝" — not in a voice turn.
2. The wake-word chip shows "Wake word paused" even though the VAD IS actively
   running in wake-word mode.

The user expects: when VAD awake is active (wake-word mode), the paw button
should show "Start" (not "Listening…"), the wake-word chip should show
"Wake word on", and the dictation button should be disabled (mic is busy).
When the wake word fires, the VAD switches to voice-turn mode and the paw
button shows "Listening…".

### Bug 3: Dictation enabled when fallback SpeechRecognition is running (P2)

When the wake-word chip is toggled WITHOUT a voice session (no VAD connected),
the fallback SpeechRecognition runs, but the dictation button is still
enabled — clicking it starts a second SpeechRecognition, creating a brief
mic conflict.

### Bug 4: Paw-mic and dictation button visual/state sync (P1)

The paw-mic (Start/Stop voice input) and the dictation button (ComposerMicButton)
both serve the same purpose — capturing user speech → STT → text. But their
state is not properly synced, causing two issues:

**Issue 4a: Dictation button shows "listening" while disabled**

When the VAD is connected (via paw-mic or Hermes fallback), the dictation
button's `usingHermesFallback` state subscription sets `isListening = true`
(because `hermesVoice.state = "connected"`). But the button is also
`disabled = creating || realtimeVoice.state === "connected"` → `true`. So
the button shows animated bars + glow (isListening=true) while disabled.
The user sees TWO buttons showing "listening" at the same time — the paw-mic
and the dictation button.

**Root cause**: `ComposerMicButton.tsx:186-199` — the Hermes state
subscription sets `isListening = true` when `state === "connected"`,
regardless of whether the button is disabled. The `disabled` prop and
`isListening` state are independent — no guard prevents `isListening`
from being true while `disabled` is true.

**Issue 4b: Dictation button can start VAD but can't stop it**

When `usingHermesFallback` is true (no Web Speech, no server dictation),
clicking the dictation button calls `onHermesVoice()` which calls
`realtimeVoice.connect()` — starting the VAD. But once the VAD connects,
`realtimeVoice.state = "connected"` → `disabled = true` → the dictation
button is disabled. The user can't click it again to stop the VAD. They
must use the paw-mic "Stop" button.

This is an asymmetry: the dictation button can START the voice session
but can't STOP it. The paw-mic button can both start and stop.

**Issue 4c: Brief mic overlap when paw-mic starts during dictation**

When Web Speech dictation is active and the user clicks the paw-mic:
1. `realtimeVoice.connect()` → VAD connects (acquires mic via getUserMedia)
2. `realtimeVoice.state = "connected"` → dictation button `disabled = true`
3. Auto-stop effect fires (React effect, async) → `recognition.stop()`

Between step 1 and step 3, both the VAD (getUserMedia) and SpeechRecognition
are running. The overlap is brief (~1 render cycle) but exists.

**Fix for Bug 4**:
- 4a: In `ComposerMicButton.tsx`, when `usingHermesFallback` and `disabled`,
  do NOT set `isListening = true`. Or: add a guard in the Hermes state
  subscription: `if (disabledRef.current) return;` before `setIsListening`.
- 4b: Either (a) don't disable the dictation button when the VAD is connected
  in Hermes fallback mode — let it toggle the VAD on/off (same as paw-mic),
  or (b) hide the dictation button when the VAD is connected (since the
  paw-mic already controls the VAD).
- 4c: In `NewChatDialog.tsx`, disable the paw-mic button when dictation is
  active: `disabled={creating || dictationActive}`. This prevents the user
  from starting the VAD while dictation is running. The user must stop
  dictation first, then click the paw-mic.

## Current state

### Files and their roles

- `web/src/lib/hermesVoice.ts` — Singleton voice transport. Owns the Silero
  VAD, STT, LLM, and TTS pipeline. Has `wakeWordMode` flag that routes speech
  segments to keyword checking instead of LLM+TTS. Key methods: `connect()`,
  `disconnect()`, `startWakeWordMode()`, `stopWakeWordMode()`,
  `stopWakeWordModeForTurn()`, `getState()`, `subscribeState()`.
- `web/src/hooks/useRealtimeVoice.ts` — React hook wrapping `hermesVoice`.
  Exposes `state` (disconnected/connecting/connected/error), `connect()`,
  `disconnect()`. Subscribes to `hermesVoice` state changes via
  `subscribeState()`. Has Electron auto-start path (line ~400) that calls
  `connect()` then `startWakeWordMode()`.
- `web/src/hooks/useWakeWordDetector.ts` — Wake-word detector hook. Two
  modes: VAD mode (when `hermesVoice.getState() === "connected"`, calls
  `startWakeWordMode()` and subscribes to `wake.word` events) and fallback
  mode (Web Speech API or server dictation when VAD not connected).
- `web/src/shell/NewChatDialog.tsx` — Landing screen. Wires the paw button,
  wake-word chip, and dictation button together. Key state: `wakeWordActive`,
  `dictationActive`, `voiceListening`, `realtimeVoice.state`.

### Key code excerpts

**hermesVoice.ts — wakeWordMode flag and isWakeWordOnly (REMOVED in current HEAD)**

The `isWakeWordOnly` getter was added in commit `11c457e76` and removed in
`44dbd52e5`. The `wakeWordMode` private field still exists:

```typescript
// web/src/lib/hermesVoice.ts:550
private wakeWordMode = false;
```

There is NO public way to check if the VAD is in wake-word-only mode vs a
full voice session. `getState()` returns `"connected"` in both cases.

**useRealtimeVoice.ts — Electron auto-start (line ~410)**

```typescript
// web/src/hooks/useRealtimeVoice.ts:410-420
const handleAutoStart = () => {
  navigator.permissions
    .query({ name: "microphone" as PermissionName })
    .then((result) => {
      if (result.state === "granted") {
        connect().then(() => {
          hermesVoice.startWakeWordMode();
        }).catch(() => {});
      }
    })
    .catch(() => {});
};
```

After `connect()`, `realtimeVoice.state = "connected"`. Then
`startWakeWordMode()` is called — but `realtimeVoice.state` stays
`"connected"`. The UI cannot distinguish "connected in wake-word mode"
from "connected in voice-turn mode".

**NewChatDialog.tsx — wakeWordEnabled guard (line ~2158)**

```typescript
// web/src/shell/NewChatDialog.tsx:2158
const wakeWordEnabled =
  wakeWordActive && !creating && !dictationActive && realtimeVoice.state !== "connected";
```

When VAD is auto-started in wake-word mode: `state = "connected"` →
`wakeWordEnabled = false` → chip shows "paused" (WRONG — VAD IS in
wake-word mode).

**NewChatDialog.tsx — voiceListening effect (line ~2194)**

```typescript
// web/src/shell/NewChatDialog.tsx:2194
useEffect(() => {
  setVoiceListening(realtimeVoice.state === "connected");
}, [realtimeVoice.state]);
```

When VAD is auto-started in wake-word mode: `state = "connected"` →
`voiceListening = true` → paw button shows "Stop" / "Listening…" (WRONG —
VAD is only background-listening for the wake word).

**NewChatDialog.tsx — dictation button disabled (line ~3939)**

```typescript
// web/src/shell/NewChatDialog.tsx:3939
disabled={creating || realtimeVoice.state === "connected"}
```

When VAD is auto-started in wake-word mode: `state = "connected"` →
dictation disabled (CORRECT — VAD owns the mic).

When wake-word chip is toggled WITHOUT VAD: `state = "disconnected"` →
dictation enabled (PROBLEM — fallback SpeechRecognition is running, clicking
dictation starts a second SpeechRecognition).

### Repo conventions

- TypeScript strict mode. Type-check: `cd web && npx tsc -b` (has pre-existing
  errors in FilesPanel.tsx and Sidebar.tsx — NOT in scope, use `npx vite build`
  for SPA builds which skips tsc).
- Tests: `cd web && node node_modules/vitest/vitest.mjs run <file>` (PowerShell
  execution policy blocks `npx` — use `node` directly).
- SPA build: `cd web && npx vite build` → outputs to
  `agent_meow/server/static/web-ui/`.
- Commit style: conventional commits with `Signed-off-by` (DCO). Example:
  `fix(wake-word): description\n\nSigned-off-by: JZKK720 <JZKK720@users.noreply.github.com>`
- No BOM in source files. If using PowerShell to write files, use
  `[System.IO.File]::WriteAllText(path, content, [System.Text.UTF8Encoding]::new($false))`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `cd web && npx tsc -b`   | exit 0 (pre-existing errors in FilesPanel.tsx/Sidebar.tsx are OK — only check for NEW errors in in-scope files) |
| Tests     | `cd web && node node_modules/vitest/vitest.mjs run src/hooks/useWakeWordDetector.test.ts src/lib/hermesVoice.test.ts` | all pass (5 pre-existing failures in hermesVoice.test.ts sanitizeForTts are OK — only check for NEW failures) |
| SPA build | `cd web && npx vite build` | "built in Xs" with no errors |
| Lint      | `cd web && npx oxlint src/hooks/useWakeWordDetector.ts src/lib/hermesVoice.ts src/shell/NewChatDialog.tsx src/hooks/useRealtimeVoice.ts` | exit 0 |

## Scope

**In scope** (the only files you should modify):
- `web/src/lib/hermesVoice.ts` — add `isWakeWordOnly` public getter (returns `this.wakeWordMode`), add `pauseVad()`/`resumeVad()` methods and `vadPaused` flag, update `onSpeechEnd` to check `vadPaused`, reset `vadPaused` in `disconnect()`
- `web/src/hooks/useRealtimeVoice.ts` — expose `isWakeWordOnly` from the hook
- `web/src/shell/NewChatDialog.tsx` — fix `onWakeWord` to pause/resume VAD around `playReply()`, fix `wakeWordEnabled`, `voiceListening`, dictation `disabled`, and paw-mic `disabled` to account for wake-word-only mode and dictation active
- `web/src/components/ComposerMicButton.tsx` — guard the Hermes state subscription to not set `isListening = true` when the button is `disabled` (Bug 4a)
- `web/src/hooks/useWakeWordDetector.ts` — expose `isListening` for dictation disable (no change needed — already exported)

**Out of scope** (do NOT touch):
- `web/src/hooks/usePushToTalkHotkey.ts` — PTT hotkey; it already guards against TTS playback
- `web/src/lib/readAloudAudio.ts` — read-aloud feature; unrelated
- The `wakeWordOnly` connect path — do NOT re-introduce `hermesVoice.connect({wakeWordOnly: true})`. The VAD should only connect via the paw button or `realtimeVoice.connect()` (after wake word fires or Electron auto-start). See `/memories/repo/vad-wake-word-revert-complete-2026-08-29.md`.

## Git workflow

- Branch: `fix/vad-wake-word-ui-state`
- Commit per logical unit; message style: `fix(wake-word): description`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Pause the VAD during playReply() TTS echo-back (P0 — critical fix)

The root cause of the TTS echo-back gap: during `playReply()`, the VAD is still
running in wake-word mode and picks up "橘宝在呢" from the speakers. The
`onSpeechEnd` callback checks `this.ttsPlaying`, but `ttsPlaying` only covers
`hermesVoice`'s own TTS pipeline, not the browser `SpeechSynthesis` used by
`playReply()`.

**Fix**: Add a `pauseVad()` / `resumeVad()` method pair to `hermesVoice` that
pauses/resumes the VAD without disconnecting. Call `pauseVad()` before
`playReply()` and `resumeVad()` after it resolves. This prevents the VAD from
segmenting the TTS audio as speech.

In `web/src/lib/hermesVoice.ts`, add these methods after `stopWakeWordModeForTurn()`:

```typescript
  /** Pause the VAD's speech detection without disconnecting. Used to
   *  prevent echo-back during browser SpeechSynthesis TTS (playReply),
   *  which is separate from hermesVoice's own TTS pipeline (ttsPlaying).
   *  The mic stream stays acquired — only the onSpeechEnd callback is
   *  suppressed via a flag. */
  private vadPaused = false;
  pauseVad(): void {
    this.vadPaused = true;
    this.vad?.pause().catch(() => {});
    console.log("[hermes-voice] VAD paused (echo-back guard)");
  }
  resumeVad(): void {
    this.vadPaused = false;
    this.vad?.start().catch(() => {});
    console.log("[hermes-voice] VAD resumed");
  }
```

Then update the `onSpeechEnd` callback in `connect()` (line ~745) to also check
`this.vadPaused`:

```typescript
// BEFORE:
onSpeechEnd: (audio: Float32Array) => {
  if (this.ttsPlaying || this.isProcessing) return;
  if (this.wakeWordMode) {
    void this.processWakeWordSpeech(audio);
  } else {
    void this.processVadSpeech(audio);
  }
},

// AFTER:
onSpeechEnd: (audio: Float32Array) => {
  if (this.ttsPlaying || this.isProcessing || this.vadPaused) return;
  if (this.wakeWordMode) {
    void this.processWakeWordSpeech(audio);
  } else {
    void this.processVadSpeech(audio);
  }
},
```

Then in `web/src/shell/NewChatDialog.tsx`, update the `onWakeWord` callback
(line ~2163) to pause the VAD before `playReply()` and resume after:

```typescript
// BEFORE:
onWakeWord: () => {
  void playReply().then(() => {
    if (realtimeVoice.state !== "connected") {
      voiceSnapshotRef.current = message;
      realtimeVoice.connect().catch(() => {});
    } else {
      import("@/lib/hermesVoice").then(({ hermesVoice }) => {
        hermesVoice.stopWakeWordModeForTurn();
      });
    }
  });
},

// AFTER:
onWakeWord: () => {
  // Pause the VAD during the TTS reply to prevent echo-back:
  // the mic would pick up "橘宝在呢" from the speakers and send it
  // to STT as user speech. The fallback SpeechRecognition has a
  // 1500ms cooldown for this, but the VAD path has no cooldown.
  import("@/lib/hermesVoice").then(({ hermesVoice }) => {
    hermesVoice.pauseVad();
  });
  void playReply().then(() => {
    import("@/lib/hermesVoice").then(({ hermesVoice }) => {
      if (realtimeVoice.state !== "connected") {
        // VAD not connected — start a fresh voice session.
        // resumeVad is safe to call even if the VAD was just connected.
        hermesVoice.resumeVad();
        voiceSnapshotRef.current = message;
        realtimeVoice.connect().catch(() => {});
      } else {
        // VAD already connected (wake-word mode) — switch to voice turn.
        hermesVoice.stopWakeWordModeForTurn();
        hermesVoice.resumeVad();
      }
    });
  });
},
```

Also update `disconnect()` in `hermesVoice.ts` to reset `vadPaused`:

```typescript
// In disconnect(), add:
this.vadPaused = false;
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "hermesVoice NewChatDialog"` → no new errors

### Step 2: Add `isWakeWordOnly` getter to hermesVoice.ts

Add a public getter that returns the current `wakeWordMode` state. This lets
the UI distinguish "connected in wake-word mode" from "connected in voice-turn
mode".

In `web/src/lib/hermesVoice.ts`, after the `wakeWordAutoResume` field
declaration (around line 554), add:

```typescript
  /** Public getter — the UI checks this to distinguish a VAD that's
   *  connected in wake-word-only mode (background listening for "橘宝")
   *  from a full voice session. When true, the paw button should show
   *  "Start" (not "Listening…") and the wake-word chip should show
   *  "Wake word on" (not "paused"). */
  get isWakeWordOnly(): boolean {
    return this.wakeWordMode;
  }
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "hermesVoice"` → no errors in hermesVoice.ts

### Step 3: Expose `isWakeWordOnly` from useRealtimeVoice.ts

The `useRealtimeVoice` hook needs to expose whether the VAD is in wake-word-only
mode so `NewChatDialog.tsx` can use it.

In `web/src/hooks/useRealtimeVoice.ts`:

1. Add a state variable that tracks wake-word-only mode:
```typescript
const [isWakeWordOnly, setIsWakeWordOnly] = useState(false);
```

2. In the event handler (inside the `useEffect` that subscribes to
   `hermesVoice` events), add a case for state changes. After the existing
   `subscribeState` callback (around line 97), update the wake-word-only
   state:
```typescript
return hermesVoice.subscribeState(() => {
  setState(hermesVoice.getState());
  setIsWakeWordOnly(hermesVoice.isWakeWordOnly);
});
```

3. Add `isWakeWordOnly` to the returned object (around line 429):
```typescript
return useMemo(
  () => ({
    state,
    isWakeWordOnly,
    connect,
    disconnect,
    // ... existing fields
  }),
  [state, isWakeWordOnly, connect, disconnect, /* ... existing deps */],
);
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "useRealtimeVoice"` → no errors

### Step 4: Fix wakeWordEnabled in NewChatDialog.tsx

The `wakeWordEnabled` guard currently disables the wake word when
`realtimeVoice.state === "connected"`. But when the VAD is in wake-word-only
mode, the wake word IS active — it should show "on", not "paused".

Change the `wakeWordEnabled` computation (line ~2158):

```typescript
// BEFORE:
const wakeWordEnabled =
  wakeWordActive && !creating && !dictationActive && realtimeVoice.state !== "connected";

// AFTER:
const wakeWordEnabled =
  wakeWordActive && !creating && !dictationActive &&
  (realtimeVoice.state !== "connected" || realtimeVoice.isWakeWordOnly);
```

This means: the wake word is enabled when the VAD is disconnected (fallback
SpeechRecognition) OR when the VAD is connected in wake-word-only mode. It's
disabled when the VAD is in a full voice turn (`state === "connected"` and
`!isWakeWordOnly`).

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "NewChatDialog"` → no errors

### Step 5: Fix voiceListening in NewChatDialog.tsx

The `voiceListening` effect currently sets `voiceListening = true` whenever
`realtimeVoice.state === "connected"`. But when the VAD is in wake-word-only
mode, the paw button should show "Start" (not "Listening…").

Change the `voiceListening` effect (line ~2194):

```typescript
// BEFORE:
useEffect(() => {
  setVoiceListening(realtimeVoice.state === "connected");
}, [realtimeVoice.state]);

// AFTER:
useEffect(() => {
  // When the VAD is connected in wake-word-only mode, the paw button
  // should NOT show "Listening…" — it's just background keyword spotting.
  // Only show "Listening…" during a full voice turn.
  setVoiceListening(
    realtimeVoice.state === "connected" && !realtimeVoice.isWakeWordOnly,
  );
}, [realtimeVoice.state, realtimeVoice.isWakeWordOnly]);
```

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "NewChatDialog"` → no errors

### Step 6: Disable dictation when fallback SpeechRecognition is running

When the wake-word chip is toggled WITHOUT a VAD session, the fallback
SpeechRecognition runs. The dictation button should be disabled in this case
to prevent a second SpeechRecognition from starting.

The `useWakeWordDetector` hook already exposes `isListening`. Wire it into
`NewChatDialog.tsx`:

1. Capture the `isListening` return value from `useWakeWordDetector`:
```typescript
// BEFORE (line ~2161):
useWakeWordDetector({
  enabled: wakeWordEnabled,
  onWakeWord: () => { /* ... */ },
});

// AFTER:
const { isListening: wakeWordListening } = useWakeWordDetector({
  enabled: wakeWordEnabled,
  onWakeWord: () => { /* ... */ },
});
```

2. Add `wakeWordListening` to the dictation button's `disabled` prop
   (line ~3939):
```typescript
// BEFORE:
disabled={creating || realtimeVoice.state === "connected"}

// AFTER:
disabled={
  creating ||
  realtimeVoice.state === "connected" ||
  (wakeWordEnabled && wakeWordListening)
}
```

This disables dictation when: creating a session, VAD voice session active,
OR the wake-word fallback SpeechRecognition is actively listening.

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "NewChatDialog"` → no errors

### Step 7: Fix paw-mic and dictation button sync (Bug 4)

Three sub-fixes for the sync between the paw-mic and dictation button:

**7a: Don't show "listening" on dictation button when disabled**

In `web/src/components/ComposerMicButton.tsx`, add a guard in the Hermes
state subscription effect (line ~186). When the button is disabled, don't
set `isListening = true`:

```typescript
// BEFORE (line ~186):
unsub = hermesVoice.subscribeState(() => {
  const state = hermesVoice.getState();
  if (state === "connected" || state === "connecting") {
    setError(null);
    setIsListening(true);
  } else if (state === "disconnected") {
    setError(null);
    setIsListening(false);
  } else if (state === "error") {
    setError("Voice connection failed — check Hermes gateway");
    setIsListening(false);
  }
});

// AFTER:
unsub = hermesVoice.subscribeState(() => {
  const state = hermesVoice.getState();
  if (state === "connected" || state === "connecting") {
    // Don't show "listening" if the button is disabled — the paw-mic
    // owns the VAD in this state, and showing two active buttons is
    // confusing. The paw-mic's voiceListening already reflects the
    // VAD state.
    if (!disabledRef.current) {
      setError(null);
      setIsListening(true);
    }
  } else if (state === "disconnected") {
    setError(null);
    setIsListening(false);
  } else if (state === "error") {
    setError("Voice connection failed — check Hermes gateway");
    setIsListening(false);
  }
});
```

Note: `disabledRef` already exists (line ~157: `const disabledRef = useRef(disabled); disabledRef.current = disabled;`).

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "ComposerMicButton"` → no errors

**7b: Disable paw-mic when dictation is active**

In `web/src/shell/NewChatDialog.tsx`, add `dictationActive` to the paw-mic
button's `disabled` prop (line ~3577):

```typescript
// BEFORE:
<button
  type="button"
  disabled={creating}

// AFTER:
<button
  type="button"
  disabled={creating || dictationActive}
```

This prevents the user from starting the VAD while Web Speech dictation is
running. The user must stop dictation first, then click the paw-mic. This
eliminates the brief mic overlap (Bug 4c).

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "NewChatDialog"` → no errors

**7c: Let dictation button stop the VAD in Hermes fallback mode**

In `web/src/shell/NewChatDialog.tsx`, when `usingHermesFallback` is true and
the VAD is connected, don't disable the dictation button — let it toggle
the VAD off (same as the paw-mic). Change the `disabled` prop on
`ComposerMicButton` (line ~3939):

```typescript
// BEFORE:
disabled={creating || realtimeVoice.state === "connected"}

// AFTER:
disabled={
  creating ||
  (realtimeVoice.state === "connected" && !usingHermesFallback)
}
```

Wait — `usingHermesFallback` is internal to `ComposerMicButton`. We need a
different approach. Instead, pass a prop to `ComposerMicButton` that tells
it whether the VAD is connected via the Hermes fallback path.

Actually, the simpler fix: when the VAD is connected, the paw-mic "Stop"
button already handles stopping. The dictation button doesn't need to
also stop it. The issue is just visual (4a) — the dictation button shows
"listening" while disabled. Fix 7a handles that. Fix 7b handles the
overlap. Fix 7c is not needed if 7a and 7b are in place.

**Skip 7c** — the paw-mic "Stop" button is the canonical way to stop the
VAD. The dictation button just needs to not show "listening" when disabled
(7a), and the paw-mic needs to not start during dictation (7b).

**Verify**: `cd web && npx tsc -b 2>&1 | findstr "NewChatDialog ComposerMicButton"` → no errors

### Step 8: Rebuild SPA

```bash
cd web && npx vite build
```

**Verify**: Build succeeds with "built in Xs" and no errors. Check the bundle:
```powershell
Select-String -Path "agent_meow\server\static\web-ui\assets\index-*.js" -Pattern "isWakeWordOnly" | Select-Object -First 1
```
→ should find at least one match (the getter is in the bundle).

### Step 9: Run tests

```bash
cd web && node node_modules/vitest/vitest.mjs run src/hooks/useWakeWordDetector.test.ts src/lib/hermesVoice.test.ts
```

**Verify**: No NEW failures (5 pre-existing failures in hermesVoice.test.ts
sanitizeForTts are OK). All useWakeWordDetector tests pass.

## Test plan

- **New test**: `web/src/lib/hermesVoice.test.ts` — add a test that verifies
  `pauseVad()` sets `vadPaused = true` and `resumeVad()` sets it back to
  `false`. Also verify `onSpeechEnd` does NOT call `processWakeWordSpeech` or
  `processVadSpeech` when `vadPaused` is true. Model after existing
  `ttsPlaying` guard tests if they exist, or after the `isProcessing` guard
  tests.
- **New test**: `web/src/hooks/useRealtimeVoice.test.ts` — add a test that
  verifies `isWakeWordOnly` is `true` after `startWakeWordMode()` is called
  and `false` after `stopWakeWordMode()` or `stopWakeWordModeForTurn()`.
  Model after the existing state subscription tests in that file.
- **New test**: `web/src/lib/hermesVoice.test.ts` — add a test that verifies
  the `isWakeWordOnly` getter returns the correct value before/after
  `startWakeWordMode()` / `stopWakeWordMode()`.
- **Manual verification**: In the Electron app (or browser with mic):
  1. **TTS echo-back**: With VAD auto-started in wake-word mode, say "橘宝".
     Verify the VAD does NOT pick up "橘宝在呢" from the speakers — no
     second wake.word event, no "橘宝在呢" sent to LLM as user speech.
  2. **UI state**: With VAD in wake-word mode, verify paw shows "Start"
     (not "Listening…"), chip shows "Wake word on" (not "paused"),
     dictation disabled.
  3. **Fallback**: Toggle wake-word chip (no VAD) → chip shows "on", paw
     shows "Start", dictation disabled.
  4. **Voice turn**: Click paw → VAD connects → paw shows "Listening…",
     chip shows "paused", dictation disabled.
  5. **Stop**: Stop voice session → VAD disconnects → if chip still on,
     wake word resumes in fallback mode.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `cd web && npx tsc -b` exits 0 (or only has pre-existing errors in FilesPanel.tsx/Sidebar.tsx)
- [ ] `cd web && node node_modules/vitest/vitest.mjs run src/hooks/useWakeWordDetector.test.ts src/lib/hermesVoice.test.ts` exits 0 (5 pre-existing sanitizeForTts failures OK)
- [ ] `grep -rn "isWakeWordOnly" web/src/` returns matches in hermesVoice.ts, useRealtimeVoice.ts, and NewChatDialog.tsx
- [ ] `grep -rn "pauseVad\|resumeVad\|vadPaused" web/src/lib/hermesVoice.ts` returns matches (the echo-back guard exists)
- [ ] `grep -rn "wakeWordOnly" web/src/lib/hermesVoice.ts` returns NO matches (the old connect option is NOT re-introduced)
- [ ] `grep -rn "disabledRef.current" web/src/components/ComposerMicButton.tsx` returns matches in the Hermes state subscription guard (Bug 4a fix)
- [ ] `grep -rn "dictationActive" web/src/shell/NewChatDialog.tsx` returns a match in the paw-mic button `disabled` prop (Bug 4b fix)
- [ ] SPA build succeeds (`npx vite build`)
- [ ] No files outside the in-scope list are modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts
  (the codebase has drifted since this plan was written).
- The `isWakeWordOnly` getter already exists in `hermesVoice.ts` (someone
  already added it — check if it's wired correctly before proceeding).
- The `pauseVad()`/`resumeVad()` methods already exist (someone already
  added them — verify they're called in `onWakeWord` around `playReply()`).
- The `vad.pause()` / `vad.start()` API doesn't exist on the MicVAD type
  (the VAD library API changed — check `@ricky0123/vad-web` types).
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file.
- You discover the VAD `wakeWordMode` flag is not reliably set/cleared
  (e.g. `stopWakeWordModeForTurn()` doesn't clear it, or `disconnect()`
  doesn't reset it).
- You discover `containsWakeWord("橘宝在呢")` returns `false` (the wake
  word list was changed — the echo-back guard may not be needed, but
  verify the TTS audio is still not sent to STT).

## Maintenance notes

- **Future changes to the VAD lifecycle**: any new method that changes
  `wakeWordMode` must also trigger a state notification so
  `useRealtimeVoice` picks up the change. The `subscribeState` callback
  fires on `setState()` calls, but `wakeWordMode` changes don't call
  `setState()`. The current plan works around this by checking
  `isWakeWordOnly` in the `subscribeState` callback — but if
  `wakeWordMode` changes without a `setState()` call, the UI won't update.
  Consider adding a separate `subscribeWakeWordMode` notification in a
  future refactor.
- **Reviewer should scrutinize**: the `wakeWordEnabled` expression — it's
  the core guard that prevents mic conflicts. Make sure the `isWakeWordOnly`
  check doesn't create a window where both fallback SpeechRecognition and
  VAD wake-word mode are active.
- **Deferred**: the brief SpeechRecognition overlap race (dictation click
  while fallback SR is running) is mitigated by disabling the dictation
  button, but not fully eliminated — React effect cleanup is async. A full
  fix would require synchronous mic release, which is not possible with the
  Web Speech API. The disabled button is the pragmatic solution.
