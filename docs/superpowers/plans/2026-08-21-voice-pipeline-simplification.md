# Voice Pipeline Simplification Implementation Plan

Spec: `docs/superpowers/specs/2026-08-21-voice-pipeline-simplification-design.md`

All changes in `web/src/lib/hermesVoice.ts` + colocated tests. Frontend-only.

## Task 1 — Bounded TTS latency

- Edge TTS: timeout 15s → 6s, remove retry loop (single attempt).
- Qwen fallback: timeout 20s → 12s.
- Test: existing synthesize behavior unchanged otherwise.

## Task 2 — Concurrency semaphore (3) for TTS

- Add module-level `ttsSemaphore` (counter + FIFO) in hermesVoice.ts.
- `flushSentence` acquires a slot before `synthesize()`, releases after.

## Task 3 — No silent skips

- On both-engine failure: generate 150ms beep via OfflineAudioContext-free
  oscillator buffer (build PCM directly), return it instead of empty buffer.
- Count skips; include in final `Total:` log.

## Task 4 — Terminator-only sentence splitting

- `SENTENCE_END_REGEX` → terminators only: `/[.!?。！？\n]/`.
- Keep 60-char CJK safety net.
- Update `splitSentences` doc + tests.

## Task 5 — Tests + verification

- Colocated Vitest: splitter, semaphore ordering, skip counting.
- `cd web && npm run type-check && npm test`.
- Commit with `git commit -s`.
