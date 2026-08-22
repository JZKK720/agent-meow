# Plan 015: Add LLM stream timeout and latency guard to voice pipeline

**Audit date**: 2026-08-22 · **Commit**: `cfb8f94b` · **Category**: performance/correctness · **Impact**: HIGH · **Effort**: M · **Risk**: MED

## Problem

The voice pipeline in `web/src/lib/hermesVoice.ts` has no timeout on the LLM stream. With the local `qwen3.6:35b-a3b-mtp-q4_K_M` model, streaming latency is **35s for "你好"** (2 chars) and **102s for a 200-char joke**. The code comment says "audio starts playing after the first sentence (~5-10s)" but the local model takes 7-20x longer.

The `chatStreamViaHermes` and `chatStreamViaAgentMeow` methods use the `AbortController` signal (for interrupt/cancel) but **no timeout** — if the local model stalls or is very slow, the voice turn hangs indefinitely with no feedback to the user.

Additionally, the `processTurn` method has a speculative LLM path that starts streaming from a partial transcript at ~0.8s of silence. With a 35s first-token latency, the speculative stream provides no benefit — the user waits 35s regardless.

**Evidence**:
- `web/src/lib/hermesVoice.ts:1341-1360` (`chatStreamViaHermes`): `fetch()` with `signal` but no `AbortSignal.timeout()`
- `web/src/lib/hermesVoice.ts:1278-1339` (`chatStreamViaAgentMeow`): SSE stream with `streamController` but no timeout
- Measured: `qwen3.6:35b-a3b-mtp-q4_K_M` streaming "你好" → 35s (via `curl http://127.0.0.1:8642/v1/chat/completions`)
- Measured: non-streaming 200-char joke → 102.6s

## Fix

### Part A: Add LLM stream timeout (safety net)

Add a 120s timeout to the LLM stream. If no tokens arrive within 120s, abort the stream and emit a user-facing error. This prevents indefinite hangs when the local model is overloaded or stalled.

### Part B: Add "thinking" indicator for slow first token

When the LLM stream hasn't produced its first token within 10s, emit a `voice.state` event with `state: "busy"` so the UI can show a "thinking..." indicator. Currently the user sees nothing for 35s.

### Files in scope

- `web/src/lib/hermesVoice.ts` — `chatStreamViaHermes`, `chatStreamViaAgentMeow`, `processTurn`

### Files out of scope

- `web/src/hooks/useRealtimeVoice.ts` (only consumes events — no change needed if `voice.state: busy` is already handled)
- Server-side code
- TTS server

### Steps

1. **In `chatStreamViaHermes` (line ~1341)**: wrap the `fetch` signal with a timeout:

```typescript
// Current:
const resp = await fetch(hermesChatUrl(), {
  method: "POST",
  headers,
  body: JSON.stringify({...}),
  signal,
});

// Changed to:
// Combine the interrupt signal with a 120s timeout. If the local model
// stalls (no tokens in 120s), abort and surface an error instead of
// hanging the voice turn indefinitely.
const timeoutController = new AbortController();
const timeoutId = setTimeout(() => timeoutController.abort(), 120000);
const onAbort = () => timeoutController.abort();
signal?.addEventListener("abort", onAbort, { once: true });
try {
  const resp = await fetch(hermesChatUrl(), {
    method: "POST",
    headers,
    body: JSON.stringify({...}),
    signal: timeoutController.signal,
  });
  // ... existing stream reading code ...
} finally {
  clearTimeout(timeoutId);
  signal?.removeEventListener("abort", onAbort);
}
```

2. **In `chatStreamViaAgentMeow` (line ~1278)**: add a similar 120s timeout on the SSE stream. If no `text_delta` event arrives within 120s of posting the message, abort the stream.

3. **In `processTurn` (line ~900)**: add a "first token" watchdog. Before calling `chatStream`, set a 10s timer. If `handleDelta` hasn't been called within 10s, emit `{ type: "voice.state", state: "busy" }` so the UI shows a thinking indicator. Clear the timer on the first `handleDelta` call.

```typescript
// After this.emit({ type: "response.started" });
let firstTokenReceived = false;
const firstTokenTimer = setTimeout(() => {
  if (!firstTokenReceived) {
    this.emit({ type: "voice.state", state: "busy" });
  }
}, 10000);

// In handleDelta, first line:
const handleDelta = (delta: string) => {
  if (!firstTokenReceived) {
    firstTokenReceived = true;
    clearTimeout(firstTokenTimer);
  }
  // ... existing code ...
};

// After the stream ends (before drainPending):
clearTimeout(firstTokenTimer);
```

### Verification

1. **Type check**: `cd web && npx tsc --noEmit` — no new errors
2. **Unit tests**: `cd web && npx vitest run src/lib/hermesVoice.test.ts` — all 43 tests pass
3. **Manual test**: Start a voice turn with the local model. Observe:
   - Within 10s with no tokens: UI shows "thinking" indicator
   - Within 120s: first token arrives, TTS starts
   - If model stalls >120s: voice turn ends with error message, not indefinite hang

### Done criteria

- `npx tsc --noEmit` passes with no new errors
- `npx vitest run src/lib/hermesVoice.test.ts` — 43/43 pass
- A voice turn with a slow model shows feedback within 10s, and aborts after 120s if no tokens arrive

### Test plan

Add a unit test in `hermesVoice.test.ts`:
- Test that `processTurn` emits `voice.state: busy` when the LLM stream doesn't produce tokens within 10s (mock `chatStream` to delay)
- Test that `chatStreamViaHermes` aborts after 120s (mock `fetch` to never resolve)

Follow the pattern of existing tests in `hermesVoice.test.ts` that mock fetch and test streaming behavior.

### Maintenance note

The 120s timeout should be adjusted based on the model in use. Cloud models may need shorter timeouts (30s); large local models may need longer (180s). Consider making the timeout configurable via a property on `HermesVoiceTransport`, set from the model name or a config value.

The 10s "thinking" threshold is a UX choice — if the model consistently takes >10s to first token, the indicator will always show. That's acceptable — it's better than silence.

### Escape hatch

If the timeout causes false aborts on legitimately slow model loads (e.g., first request after Ollama model swap takes 60s to load the model into VRAM), increase the timeout to 180s. The first request after a model swap is always slow; subsequent requests should be faster.
