# Advisor Plans — agent-meow Roadmap Accuracy

**Audit date**: 2026-07-24 · **Planned at**: commit `1a2047ec` · **Scope**: roadmap doc accuracy + Phase 4 runner dispatch

## 2026-08-26 additions — Electron VAD + HTML artifact + voice session fixes

| #   | Plan | Status |
| --- | ---- | ------ |
| 020 | Electron VAD unblock + HTML artifact popup + voice session reuse | **Committed** (`e834fca2`) |

**Remaining steps**: Rebuild Electron app, restart backend + TTS server, configure image gen provider.

## 2026-08-24 additions — Chinese voice quality + TTS supervision

| #   | Plan | Status |
| --- | ---- | ------ |
| 018 | Chinese STT→LLM→TTS quality improvements | Ready |
| 019 | Supervise tts-server.exe in ServiceSupervisor | Ready |

**Execution order:** 019 first (supervisor fix unblocks proper TTS startup), then 018 (quality tuning with correct TTS).

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

## 2026-08-24 addition

| #   | Finding                                                          | Category     | Impact | Effort | Risk | Verdict      |
| --- | ---------------------------------------------------------------- | ------------ | ------ | ------ | ---- | ------------ |
| 017 | Read-aloud garbling: `playReadAloud` resolves on play start      | correctness  | HIGH   | S      | LOW  | **DONE**      |

017 (read-aloud fix) ── DONE, merged to main as `c153128c1` + bundle `c642e4ba7`

```

## Recommended execution order

1. **001** — Fix `db_models.py` path reference (5 min)
2. **002** — Sync VIDEOS_SURFACE.md with actual code state (30 min)
3. **004** — Mark stale voicebox plan (5 min)
4. **003** — Phase 4: Runner dispatch for all surface + voice tools (multi-day)

## 2026-08-22 Voice pipeline re-audit (commit `cfb8f94b`)

After switching to local `qwen3.6:35b-a3b-mtp-q4_K_M` as primary model, audited the voice pipeline for remaining issues.

| #   | Finding                                                              | Category        | Impact | Effort | Risk | Verdict        |
| --- | -------------------------------------------------------------------- | --------------- | ------ | ------ | ---- | -------------- |
| 014 | `minimax-m3:cloud` still in Hermes memory config → 429 errors       | correctness     | HIGH   | S      | LOW  | Plan written   |
| 015 | No LLM stream timeout in voice pipeline → indefinite hang on slow model | perf/correctness | HIGH   | M      | MED  | Plan written   |
| 016 | Full audit of all stale cloud model references in Hermes config     | tech debt       | MED    | S      | LOW  | Plan written   |

### Dependency graph

```
014 (memory cloud model) ── no deps, do first (5 min)
016 (full cloud model audit) ── supersedes 014 if done first; do 014 then 016
015 (LLM timeout guard) ── no deps, independent (code change)
```

### Recommended execution order

1. **014** — Remove `minimax-m3:cloud` from memory config (5 min, config-only)
2. **016** — Full audit of all cloud model references (10 min, config-only)
3. **015** — Add LLM stream timeout + thinking indicator (1-2h, code change)

### Direction findings (not planned)

- **LLM latency is the new bottleneck**: 35s first-token for "你好", 102s for a 200-char joke. The voice pipeline's "5-10s to first audio" design assumption no longer holds. Consider: (a) using a smaller local model for voice turns (e.g., `qwen3.5:9b-q8_0` — 3-5s first token), (b) implementing a two-tier model strategy (small model for voice, large for text), or (c) accepting the latency and focusing on UX feedback.
- **Speculative LLM stream is wasted with local models**: the speculative path starts streaming from a partial transcript at 0.8s silence, but with 35s first-token latency, the speculation provides zero benefit. Consider disabling it when the model is local (check `this.model` for a local model indicator).

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
| 013 | TODO | GHCR one-liner deploy — publish qwen3-tts image, create no-clone quickstart compose + PS1 |

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

## 2026-08-26 additions — Omnigent → agent-meow rebrand completion

**Analysis commit**: `a49b4479f` · **Analysis**: `030-omnigent-rebrand-gap-analysis.md`

The rebrand from "omnigent" to "agent-meow" is ~20% complete. Only the Python
import module was renamed; distribution names, SDK dirs, env vars, frontend
bridges, CSS vars, IPC channels, DB schema, and wire protocol all still say
"omnigent." ~1,500+ references across ~200 files.

### Option B (active risk fixes) — ✅ DONE

Committed as `a49b4479f`. Fixed 4 active bugs:
1. `OMNIGENT_EXECUTOR_TYPE` split-brain (HIGH) — now imports canonical value from `_omnigent_compat`
2. Deep-link scheme conflict (MEDIUM) — argv parsing now accepts both `agent-meow://` and `omnigent://`
3. `setup.py` stale paths (MEDIUM) — writes to `agent_meow/` not `omnigent/`
4. Stale `agent_meow.egg-info` (LOW) — deleted; `embed_python.js` cleans both egg-info dirs

### Full rebrand plans (Option A)

| # | Plan | Status | Depends on | Effort | Risk |
|---|---|---|---|---|---|
| 031 | Python metadata + SDK dirs | **DONE** (`9d4c3a276`) | — | L | Medium |
| 032 | Internal symbols + env vars + DB | 📋 Ready | 031 | L | HIGH |
| 033 | Frontend bridges + CSS + IPC | 📋 Ready | 031, 032 | L | Medium |
| 034 | Electron + deep-link + cleanup | 📋 Ready | 031, 032, 033 | M | Low |

### Dependency graph

```
Option B (done) ──► 031 (Python metadata + SDK dirs)
                        │
                        ├──► 032 (internal symbols + env vars + DB)
                        │         │
                        │         ├──► 033 (frontend bridges + CSS + IPC)
                        │         │         │
                        │         │         └──► 034 (Electron + cleanup)
                        │         │
                        │         └────────────► 034
                        │
                        └──────────────────────► 033
                                                 │
                                                 └──► 034
```

### Key constraints

1. Each plan must land complete and verified before the next begins.
2. Plans 031-033 add backward-compat shims; Plan 034 removes them all.
3. Plan 032 has the highest risk (DB migration, env var breaking changes).
4. Plan 033 is cross-layer (IPC + bridge globals must change in one commit).
```
