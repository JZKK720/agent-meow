# Advisor Plans — Post-Merge Audit (2026-07-22)

Audit performed at commit `1090799b` on `reintegration/staging` branch.
Scope: 7 CLI/harness integrations + 3 surface tools (Docs, Images, Voice).

## Priority order + dependencies

| # | Plan | Category | Impact | Effort | Risk | Status |
|---|------|----------|--------|--------|------|--------|
| 001 | Fix `_ALL_LOCAL_TOOLS` missing surface frozensets | bug | HIGH | S | LOW | TODO |
| 002 | Fix `doc_export` empty session-id path | bug | HIGH | S | LOW | TODO |
| 003 | Add doc surface dispatch tests | tests | MED | M | LOW | TODO |
| 004 | Restore ironclaw-native harness implementation | bug | HIGH | L | MED | TODO |
| 005 | Add server `/documents/{id}/file` binary endpoint | bug | MED | M | MED | TODO |
| 006 | Add image surface dispatch tests | tests | MED | S | LOW | TODO |
| 007 | Update voice schema docstrings (Voicebox preferred) | docs | LOW | S | LOW | TODO |

## Dependency graph

```
001 (no deps) → 003 (tests can verify the fix)
002 (no deps) → 003 (tests can verify the fix)
004 (no deps, standalone)
005 (no deps, but blocks office tools from working end-to-end)
006 (no deps)
007 (no deps)
```

Plans 001 and 002 are the highest leverage — both are S-effort fixes for
HIGH-impact bugs that silently break surface tools on certain dispatch paths.
Plan 003 (doc tests) should land after 001+002 so the tests verify the fixes.

## Considered and rejected

- **Onboarding auth files for kimi/kiro/codex** (MED confidence): these
  harnesses may intentionally use credential-file or env-based auth instead
  of interactive onboarding. Not enough evidence to plan — investigate first.
- **Voice surface persistence panel** (CORRECTNESS-05/06 from surface audit):
  voice is intentionally inline-only in v1 (AudioBlock in ToolCard). Adding a
  persisted audio resource surface is a product decision, not a bug fix. Defer.
- **`image_get` O(N) list-filter** (CORRECTNESS-04): real perf finding but
  LOW impact in practice (sessions rarely have many images). Defer to a
  future optimization pass.