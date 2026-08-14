# Advisor Plans — agent-meow Roadmap Accuracy

**Audit date**: 2026-07-24 · **Planned at**: commit `1a2047ec` · **Scope**: roadmap doc accuracy + Phase 4 runner dispatch

## Audit verdict

The roadmap (`docs/ROADMAP_AND_CORE_FEATURES.md`) is **largely accurate**. A code-vs-doc verification pass confirmed 5 of 7 claims are fully accurate, 2 are partially accurate with minor discrepancies. The main actionable gap is Phase 4 (runner dispatch for doc/image/video/voice tools) — the roadmap correctly marks this as pending, and the code confirms it.

## Findings index

| #   | Finding                                                                        | Category  | Impact | Effort | Risk | Verdict              |
| --- | ------------------------------------------------------------------------------ | --------- | ------ | ------ | ---- | -------------------- |
| 001 | Roadmap `db_models.py` path imprecision                                        | docs      | LOW    | S      | LOW  | Fix path reference   |
| 002 | VIDEOS_SURFACE.md stale claims (2 items)                                       | docs      | MED    | S      | LOW  | Sync with reality    |
| 003 | Phase 4: Register surface+voice tools in `_BUILTIN_REGISTRY` + runner dispatch | direction | HIGH   | L      | MED  | Plan written         |
| 004 | Stale voicebox-tts-integration plan (never executed)                           | docs      | LOW    | S      | LOW  | Mark stale or remove |

## Dependency graph

```
001 ✓ → 002 ✓ → 003 ✓ (runner dispatch complete)
004 ✓ (stale plan marked)
005 DRAFT (Voicebox engine reliability)
```

001 (path fix) ── no deps, do first
002 (surface doc sync) ── no deps
003 (runner dispatch) ── the big one, depends on 002 for accurate spec
004 (stale plan cleanup) ── no deps

```

## Recommended execution order

1. **001** — Fix `db_models.py` path reference (5 min)
2. **002** — Sync VIDEOS_SURFACE.md with actual code state (30 min)
3. **004** — Mark stale voicebox plan (5 min)
4. **003** — Phase 4: Runner dispatch for all surface + voice tools (multi-day)

## Status

| Plan | Status | Notes |
|---|---|---|
| 001 | TODO | Trivial path fix |
| 002 | TODO | Two stale claims to fix |
| 003 | TODO | The core remaining functional gap |
| 004 | TODO | Stale plan cleanup |
| 005 | DRAFT | Voicebox engine reliability (pre-QAA) |
| 006 | **SUPERSEDED** | QAA Gateway + DashScope — replaced by Hermes-direct (`hermesVoice.ts`) |
| 007 | **SUPERSEDED** | QAA realtime hook — `realtimeVoice.ts` deleted, replaced by `hermesVoice.ts` |
| 008 | TODO | Build whisper.cpp with Vulkan for GPU-accelerated STT (still relevant — fixes 60s cold-start) |
| 009 | **SUPERSEDED** | ACP shim — QAA middleman eliminated, Hermes handles directly |
| 010 | TODO | Dual-platform report (K16 + R16) |
| 011 | DRAFT | Local realtime QAA provider (Qwen3-ASR + Hermes + Qwen3-TTS) |

## QAA voice migration plans (2026-08-04 audit)

**Audit date**: 2026-08-04 · **Planned at**: commit `ff786767`
**Source**: `design-plans/qwen-audio-agent-evaluation.md` (research + design)

### Audit verdict

The evaluation doc is thorough research but was **not an implementation
plan** — it's a design document with staged recommendations. The `improve`
audit converted its actionable items into 4 self-contained plan files
(006-009) that a cold executor can follow. Each plan has verification gates,
scope boundaries, and STOP conditions per the plan template.

### Findings from the evaluation audit

| # | Finding | Category | Impact | Effort | Risk | Evidence |
|---|---------|----------|--------|--------|------|----------|
| 006 | QAA Gateway + DashScope not yet installed | dx | HIGH | S | LOW | No QAA process running; no DashScope config |
| 007 | Hand-rolled voice transport should be retired for QAA's | tech-debt | HIGH | L | MED | `realtimeVoice.ts` (221 lines) + `s2s_proxy.py` (233 lines) replaced by QAA |
| 008 | STT runs on CPU while GPU+NPU sit idle (90s warmup) | perf | HIGH | M | MED | faster-whisper CTranslate2 only supports CUDA; machine has Vulkan 1.4.329 + ROCm 7.1 |
| 009 | No backend agent — voice is transport-only | direction | MED | L | MED | QAA ACP backend → Hermes for tool-using voice |

### Dependency graph (QAA plans)

```

006 (install QAA + DashScope) ──→ 007 (port realtime hook into VoicePanel)
006 (install QAA + DashScope) ──→ 009 (ACP shim → Hermes)
008 (whisper.cpp Vulkan STT) ── independent, can run in parallel with 006-007

```

### Recommended execution order

1. **006** — Install QAA + DashScope (quick win, solves online warmup)
2. **008** — Build whisper.cpp with Vulkan (parallel, solves offline warmup)
3. **007** — Port QAA realtime hook into VoicePanel (the big UI change)
4. **009** — ACP shim → Hermes backend (additive, Path B)

Plans 006 and 008 can run in parallel. Plan 007 depends on 006. Plan 009
depends on 006 and is additive (not required for basic voice).

## Considered and rejected

- **Full rebrand audit** — out of scope; the rebrand has its own audit doc (`docs/REBRAND_AUDIT.md`)
- **Static bundle commit strategy** — operational decision, not a code plan; flagged in roadmap Risk Watchlist
- **Gemini Live API as forever-free cloud provider** — blocked in China (network); see `design-plans/qwen-audio-agent-evaluation.md` Addendum 2
- **NPU STT via winml CLI** — winml explicitly excludes Whisper (seq2seq) until late 2026; not viable
- **Retiring the local S2S server permanently** — rejected; it stays as the offline/free fallback (hybrid design)
```
