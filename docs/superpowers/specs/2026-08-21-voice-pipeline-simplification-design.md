# Voice Pipeline Simplification — Zero-Downtime Playback

Date: 2026-08-21
Status: Proposed (awaiting review)
Scope: STT → LLM → TTS → playback pipeline in `web/src/lib/hermesVoice.ts`

## Problem

Client complaints on the dev machine:

1. **Super lagging voice responses.** One bad TTS sentence can stall the
   ordered playback drainer for up to ~50s (Edge TTS: 15s timeout × 2
   attempts + 500ms backoff = 30.5s, then Qwen3-TTS fallback: +20s).
   Because playback is strictly ordered (`drainIdx`), every later sentence
   waits. Additionally, all sentences fire TTS **in parallel**, hitting
   Edge TTS throttling (measured 3.6–11.9s for 11 parallel requests).
2. **Playback doesn't finish full sentences.** Failed fragments are
   silently skipped (empty `ArrayBuffer` return in `synthesize()`), so the
   user hears sentences with holes. Splitting on commas makes fragments
   small and failures frequent.

## Goal

User hears complete voice replies with **no silent gaps and no multi-second
stalls**, using the simplest orchestration that keeps the existing two TTS
engines (Edge primary, Qwen3-TTS offline fallback).

## Non-goals

- Replacing Edge TTS / Qwen3-TTS engines.
- Changing LLM model routing (`hermes-agent` vs `auto`).
- WebSocket/realtime protocol rewrite.

## Design

### 1. Bounded TTS latency (the lag fix)

`synthesize()` in `hermesVoice.ts`:

| Parameter | Today | Proposed | Rationale |
|---|---|---|---|
| Edge TTS timeout | 15s | **6s** | Sentence fragments are 2–3s of speech; 6s is generous |
| Edge retries | 2 | **1** (no retry) | Fallback exists — retrying doubles worst-case stall |
| Qwen fallback timeout | 20s | **12s** | Bounded; a wedged server must not own the turn |
| Worst-case per sentence | ~50.5s | **~18s** | Still high; see §2 for the real fix |

### 2. Concurrency-limited TTS with lookahead (the throttle fix)

Replace fire-all-in-parallel with a **semaphore of 3** in-flight Edge TTS
requests. Edge throttles beyond that; 3 keeps the pipe full without
triggering 429/timeout behavior. Implementation: a simple counter + FIFO
queue inside `processTurn`; `flushSentence` awaits a slot before calling
`synthesize()`.

### 3. No silent skips (the truncation fix)

- `synthesize()` failure now **retries once via the other engine**
  (Edge fail → Qwen; Qwen fail → Edge) before giving up.
- If both engines fail, emit a short **beep-tone placeholder** (generated
  locally via Web Audio oscillator, ~150ms) instead of empty audio, and log
  `TTS #N SKIPPED (both engines failed)` at `warn` level. The user hears a
  perceptible marker, not a hole; the console carries the evidence.
- `drainPending` counts skipped sentences and includes them in the final
  `Total:` log line: `... 12 sentences, 2 skipped, first audio at ...`.

### 4. Coarser sentence splitting (fewer fragments, fewer failure points)

Split on **sentence terminators only** (`. ! ? 。 ！ ？ \n`) instead of also
splitting on commas/semicolons. Keep the 60-char CJK safety net. Trade-off:
first audio arrives ~1–2s later, but fragments are complete clauses —
directly addressing "did not fully play as full sentences". If first-audio
latency regresses measurably, fall back to splitting on commas **only for
the first fragment** of a turn (fast first audio) and terminators after.

### 5. Keep-alive heartbeat during stalls

While the drainer waits on a slow sentence and the queue is empty, emit
`playback.started`-style progress events every 2s (for the UI spinner) so
the user perceives liveness instead of a dead air freeze.

## Error handling summary

| Failure | Behavior |
|---|---|
| Edge 4xx | Immediate fallback to Qwen (no retry) |
| Edge timeout/5xx | Immediate fallback to Qwen (no retry) |
| Qwen fail | One Edge retry (only if Edge was the original failure) |
| Both fail | Beep placeholder + warn log + counted skip |
| Decode fail in `playAudio` | Beep placeholder + error log |

## Testing

1. **Unit (colocated Vitest)**: `web/src/lib/hermesVoice.test.ts` —
   semaphore ordering, dual-engine failover, skip counting, sentence
   splitter change (`splitSentences` is already exported for testing).
2. **E2E UI (Playwright, `tests/e2e_ui/`)**: mock both TTS endpoints; one
   scenario where Edge 500s → assert Qwen was called and audio played; one
   where both fail → assert skip is logged and turn completes.
3. **Manual timing baseline**: rerun the per-stage probes from the
   voice-stack-diagnose skill before/after; compare against the 2026-08-15
   baseline table. Success criteria: worst-case per-sentence stall ≤ 18s,
   zero silent skips in a 20-turn session, first audio ≤ 8s warm.

## Rollout

Single PR, frontend-only (`hermesVoice.ts` + tests). No backend or config
changes. Deploy is a Vite rebuild.
