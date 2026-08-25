# Plan 017: Fix Read-Aloud Garbling and Gaps

**Written against commit:** `663f0ffaa`
**Date:** 2026-08-24
**Category:** Correctness / UX bug
**Impact:** HIGH — read-aloud is unusable (every chunk except the last is cut off)
**Effort:** S (single function fix + optional chunking improvement)
**Risk:** LOW — isolated to `playReadAloud`, no shared state changes

## Problem

When the user clicks the "Read aloud" button on a chat message, the audio
is **garbled** (each sentence is cut off almost immediately) and has
**major gaps** between sentences.

## Root Cause

`playReadAloud()` in `web/src/pages/ChatPage.tsx` (line 3368) calls
`await audio.play()`, which resolves when playback **starts**, not when
playback **ends**. The function returns immediately after playback starts,
and the `for` loop in `speakText()` moves to the next iteration.

The sequence for a 3-chunk message:

1. Chunk 1: `playReadAloud(blob1)` → `audio.play()` resolves → function returns
2. Loop continues → chunk 2's blob is fetched (prefetched) → `playReadAloud(blob2)`
3. `setReadAloudAudio(audio2)` **pauses audio1** (chunk 1 cut off mid-word)
4. `audio2.play()` resolves → function returns → loop continues
5. Chunk 3: `setReadAloudAudio(audio3)` **pauses audio2** (chunk 2 cut off)
6. Only chunk 3 plays to completion

The `onended` callback (line 3372) only revokes the object URL and releases
the audio reference — it does **not** resolve the `playReadAloud` promise,
so the `for` loop never waits for playback to complete.

The **gaps** occur when the prefetch for chunk N+1 hasn't resolved by the
time chunk N starts playing (which is almost instantly, since `audio.play()`
resolves immediately). The loop waits on `await blobPromise` for the next
fetch, creating silence between chunks.

## Evidence

- `web/src/pages/ChatPage.tsx:3368` — `playReadAloud` returns on `audio.play()`, not `onended`
- `web/src/pages/ChatPage.tsx:3372` — `onended` only revokes URL, doesn't resolve promise
- `web/src/lib/readAloudAudio.ts:32` — `setReadAloudAudio` pauses prior audio (correct behavior, but triggers the cut-off because the loop doesn't wait)
- Contrast with `web/src/lib/hermesVoice.ts:1549` — `playAudio` uses Web Audio API `AudioBufferSourceNode` with `source.onended = () => { onEnded?.() }` callback that drives the queue. The voice-conversation path works because `playQueue()` is called from `onended`, creating a proper gapless chain.

## Fix

### Step 1: Make `playReadAloud` wait for playback to complete

Change `playReadAloud` to return a promise that resolves on `onended`
(or `onerror`), not on `audio.play()`.

**File:** `web/src/pages/ChatPage.tsx`
**Function:** `playReadAloud` (line 3368)

**Current code:**
```typescript
async function playReadAloud(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  const releaseAudio = setReadAloudAudio(audio);
  audio.onended = () => {
    URL.revokeObjectURL(url);
    releaseAudio();
  };
  audio.onerror = () => {
    URL.revokeObjectURL(url);
    releaseAudio();
  };
  await audio.play();
}
```

**Fixed code:**
```typescript
async function playReadAloud(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  const releaseAudio = setReadAloudAudio(audio);
  // Wait for playback to complete (or error) before resolving.
  // The previous version awaited audio.play() which resolves on
  // playback START — the for loop moved to the next chunk immediately,
  // and setReadAloudAudio() paused the current chunk mid-word (garbling).
  await new Promise<void>((resolve, reject) => {
    audio.onended = () => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve(); // Resolve, not reject — skip this chunk, continue
    };
    audio.play().catch((err) => {
      URL.revokeObjectURL(url);
      releaseAudio();
      resolve(); // play() rejected (e.g. autoplay policy) — skip
    });
  });
}
```

Key changes:
- Wrap in `new Promise` that resolves on `onended` / `onerror` / `play() catch`
- `audio.play()` is called inside the promise constructor (not awaited separately)
- All error paths **resolve** (not reject) so the `for` loop continues to the next chunk instead of aborting the entire read-aloud

### Step 2 (optional improvement): Align chunking with voice-conversation path

The read-aloud `splitForTts` uses `maxLen=40` and splits only on sentence
terminators. The voice-conversation path uses `splitSentences` with
`maxLen=80` plus clause-level splitting at commas (`CLAUSE_SPLIT_MIN=10`).

Shorter chunks (40 chars) mean more fetch round-trips and more potential
gap points. Aligning to the voice-conversation parameters would reduce
the number of chunks and improve prosody continuity.

**File:** `web/src/pages/ChatPage.tsx`
**Function:** `speakText` (line 3290)

**Current:**
```typescript
const chunks = splitForTts(ttsText, chinese, 40);
```

**Change to:**
```typescript
const chunks = splitForTts(ttsText, chinese, 80);
```

This is optional — Step 1 alone fixes the garbling. Step 2 reduces gaps
by having fewer, longer chunks that synthesize and play more efficiently.

## Files in scope

- `web/src/pages/ChatPage.tsx` — `playReadAloud` function (Step 1), `speakText` chunk size (Step 2)

## Files explicitly out of scope

- `web/src/lib/readAloudAudio.ts` — no changes needed; `setReadAloudAudio` pausing prior audio is correct behavior once the loop waits for `onended`
- `web/src/lib/hermesVoice.ts` — voice-conversation path works correctly; do not touch
- `agent_meow/server/voice_proxy.py` — server-side proxy is not the cause
- `scripts/qwentts_wrapper.py` — TTS wrapper is not the cause

## Verification

### Manual test

1. Start the server and open the web UI
2. Send a message that produces a multi-sentence reply (e.g. "Tell me about cats in 3 sentences")
3. Click the "Read aloud" button on the assistant reply
4. **Expected:** All sentences play in order, no cut-offs, minimal gaps between sentences
5. **Before fix:** Only the last sentence plays; earlier sentences are cut off after ~0.1s

### Automated test

Add a colocated Vitest test in `web/src/pages/ChatPage.test.tsx` (or
extend if it exists) that verifies `playReadAloud` waits for `onended`:

```typescript
import { describe, it, expect, vi } from "vitest";

describe("playReadAloud", () => {
  it("resolves after onended, not after play()", async () => {
    // Mock Audio constructor
    const mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      onended: null as (() => void) | null,
      onerror: null as (() => void) | null,
    };
    vi.stubGlobal("Audio", vi.fn(() => mockAudio));
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn().mockReturnValue("blob:mock"),
      revokeObjectURL: vi.fn(),
    });

    // Import after stubs
    const { playReadAloud } = await import("./ChatPage");
    const blob = new Blob([new Uint8Array([0])]);
    const promise = playReadAloud(blob);

    // Promise should NOT resolve immediately after play()
    // (give it a tick to settle any microtasks)
    await new Promise((r) => setTimeout(r, 10));
    expect(promise).not.toHaveResolved();

    // Fire onended — promise should now resolve
    mockAudio.onended?.();
    await expect(promise).resolves.toBeUndefined();
  });
});
```

**Note:** The test may need adjustment depending on how `playReadAloud`
is exported (currently it's a module-private function). If it's not
exported, either export it for testing or test via the `speakText`
entry point with mocked `fetch`.

### Existing test suite

```bash
cd web && npm.cmd run test
```

### Type check

```bash
cd web && npm.cmd run type-check
```

### Build

```bash
cd web && npm.cmd run build
```

## Done criteria

- [ ] `playReadAloud` resolves on `onended`, not on `audio.play()`
- [ ] All error paths (`onerror`, `play() catch`) resolve (not reject) so the loop continues
- [ ] Manual test: multi-sentence read-aloud plays all sentences in order without cut-offs
- [ ] `npm run type-check` passes
- [ ] `npm run build` passes
- [ ] Colocated test passes

## Maintenance note

Future changes to the read-aloud audio system should preserve the
"wait for onended" contract. If the audio playback mechanism changes
(e.g. switching to Web Audio API like the voice-conversation path),
ensure the queue-driving callback fires on playback completion, not
start.

The `setReadAloudAudio` function in `readAloudAudio.ts` pauses prior
audio — this is correct and necessary for the stop button. The fix
ensures the `for` loop doesn't advance past a playing chunk before
its `onended` fires, so `setReadAloudAudio` is only called for the
next chunk after the current one finishes.

## Escape hatches

- If `audio.play()` consistently rejects due to browser autoplay policy
  (requires user gesture), the read-aloud button click IS a user gesture,
  so this should not happen. If it does, report back — the fix may need
  a `play()` retry or a user-gesture context workaround.
- If the qwentts.cpp wrapper returns audio that `HTMLAudioElement` can't
  decode (e.g. raw PCM without WAV header), `onerror` will fire. The
  wrapper already converts to WAV (`_pcm_to_wav`), so this should not
  happen. If it does, check the wrapper's `media_type` header.
