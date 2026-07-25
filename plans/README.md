# Advisor Plans — agent-meow Roadmap Accuracy

**Audit date**: 2026-07-24 · **Planned at**: commit `1a2047ec` · **Scope**: roadmap doc accuracy + Phase 4 runner dispatch

## Audit verdict

The roadmap (`docs/ROADMAP_AND_CORE_FEATURES.md`) is **largely accurate**. A code-vs-doc verification pass confirmed 5 of 7 claims are fully accurate, 2 are partially accurate with minor discrepancies. The main actionable gap is Phase 4 (runner dispatch for doc/image/video/voice tools) — the roadmap correctly marks this as pending, and the code confirms it.

## Findings index

| # | Finding | Category | Impact | Effort | Risk | Verdict |
|---|---|---|---|---|---|---|
| 001 | Roadmap `db_models.py` path imprecision | docs | LOW | S | LOW | Fix path reference |
| 002 | VIDEOS_SURFACE.md stale claims (2 items) | docs | MED | S | LOW | Sync with reality |
| 003 | Phase 4: Register surface+voice tools in `_BUILTIN_REGISTRY` + runner dispatch | direction | HIGH | L | MED | Plan written |
| 004 | Stale voicebox-tts-integration plan (never executed) | docs | LOW | S | LOW | Mark stale or remove |

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

## Considered and rejected

- **Full rebrand audit** — out of scope; the rebrand has its own audit doc (`docs/REBRAND_AUDIT.md`)
- **Static bundle commit strategy** — operational decision, not a code plan; flagged in roadmap Risk Watchlist
