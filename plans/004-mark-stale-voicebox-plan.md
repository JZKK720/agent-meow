# Plan 004: Mark stale voicebox-tts-integration plan

> **Executor instructions**: Follow this plan step by step.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `1a2047ec`, 2026-07-24

## Why this matters

`docs/superpowers/plans/2026-07-22-voicebox-tts-integration.md` is a plan that was written but **never executed** — all task checkboxes are unchecked `- [ ]`, and the code it claims to implement (`_VOICE_TOOLS` frozenset, `_execute_voice_tool` function in `tool_dispatch.py`) does not exist. Leaving this stale plan in place creates false confidence that voice dispatch is implemented. Plan 003 (Phase 4 runner dispatch) supersedes it.

## Current state

- `docs/superpowers/plans/2026-07-22-voicebox-tts-integration.md` — exists, all checkboxes unchecked
- `agent_meow/runner/tool_dispatch.py` — no `_VOICE_TOOLS` or `_execute_voice_tool` (grep returns zero matches)
- The plan's "File Structure" section lists `agent_meow/tools/mcp/voicebox.yaml` and `agent_meow/tools/builtins/tts.py` — `tts.py` exists (schema-only), `voicebox.yaml` does not

## Scope

**In scope**:
- `docs/superpowers/plans/2026-07-22-voicebox-tts-integration.md` — add a stale/superseded notice at the top

**Out of scope**:
- Deleting the file (it has useful design context for Plan 003)
- Any code changes

## Steps

### Step 1: Add superseded notice

At the top of `docs/superpowers/plans/2026-07-22-voicebox-tts-integration.md`, before the first line, add:

```
> **⚠️ STALE — Never executed.** This plan was written 2026-07-22 but never
> implemented (all checkboxes unchecked). The voice dispatch it describes
> (`_VOICE_TOOLS`, `_execute_voice_tool`) does not exist in the codebase.
> Superseded by `plans/003-phase4-runner-dispatch.md` which covers all
> surface + voice tool dispatch together. Kept for design context.
```

**Verify**: Read the file and confirm the notice is at the top.

## STOP conditions

- If the file has already been marked stale — stop and report.
- If the file has been deleted — stop and report; nothing to do.

## Test plan

No tests needed. Verification is visual.

## Maintenance note

When Plan 003 lands voice dispatch, this file can be deleted entirely.
