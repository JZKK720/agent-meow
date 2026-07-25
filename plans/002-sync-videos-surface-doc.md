# Plan 002: Sync VIDEOS_SURFACE.md with actual code state

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `1a2047ec`, 2026-07-24

## Why this matters

`docs/VIDEOS_SURFACE.md` has two stale claims that contradict the actual code:
1. It claims `_execute_video_tool` handler exists in `tool_dispatch.py` — it does NOT
2. Its "v1 limitations" section says `video_generate` is "not yet a tool" — but `VideoGenerateTool` exists as a schema class in `agent_meow/tools/builtins/videos.py`

These contradictions confuse anyone trying to understand the video surface's actual state. The roadmap's Risk Watchlist #2 flags this doc as stale; this plan fixes it.

## Current state

- `docs/VIDEOS_SURFACE.md:20-28` — architecture diagram claims `agent_meow/runner/tool_dispatch.py — _execute_video_tool handler` exists. **FALSE**: grep of `tool_dispatch.py` for `_execute_video_tool` / `video_` returns zero matches.
- `docs/VIDEOS_SURFACE.md:113` — claims `"videos"` was added to `RightRailTab` union. **TRUE** (verified at `web/src/shell/railTabs.ts:13`).
- `docs/VIDEOS_SURFACE.md:124-126` — "v1 limitations" says `video_generate` is "not yet a tool". **FALSE**: `VideoGenerateTool` exists at `agent_meow/tools/builtins/videos.py:14` as a schema-only `Tool` subclass with `name()`, `description()`, and `get_schema()`.
- The actual `video_generate` state: schema class exists, has a full provider quality ladder documented in `spec/AGENTSPEC.md` (fal.ai/Happy Horse/Pixelle-Video/OpenMontage), but is NOT registered in `_BUILTIN_REGISTRY` and has NO runner dispatch (`_execute_video_tool` does not exist).

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Verify stale claim 1 | `Select-String -Path agent_meow\runner\tool_dispatch.py -Pattern '_execute_video_tool'` | No matches |
| Verify stale claim 2 | `Select-String -Path agent_meow\tools\builtins\videos.py -Pattern 'class VideoGenerateTool'` | Match at line 14 |
| Verify rail tab claim | `Select-String -Path web\src\shell\railTabs.ts -Pattern 'videos'` | Match |

## Scope

**In scope**:
- `docs/VIDEOS_SURFACE.md` — fix the two stale claims

**Out of scope**:
- `docs/DOCS_SURFACE.md` and `docs/IMAGES_SURFACE.md` — audit separately if needed
- Any code changes
- The roadmap itself (its Risk Watchlist #2 correctly flags this doc as stale)

## Steps

### Step 1: Fix the architecture diagram (line ~20-28)

In `docs/VIDEOS_SURFACE.md`, the architecture diagram has a line:

```
│   └── agent_meow/runner/tool_dispatch.py        — _execute_video_tool handler
```

Replace it with:

```
│   └── agent_meow/runner/tool_dispatch.py        — _execute_video_tool handler (PENDING — not yet implemented)
```

**Verify**: Read the file and confirm the line now says "(PENDING — not yet implemented)".

### Step 2: Fix the "v1 limitations" section (line ~124-126)

In `docs/VIDEOS_SURFACE.md`, the "v1 limitations" section says:

```
- **No video generation**: `video_generate` is not yet a tool. Wire to a
  video generation provider (Runway, Pika, Sora) when ready.
```

Replace with:

```
- **Video generation**: `video_generate` exists as a schema-only tool class
  (`agent_meow/tools/builtins/videos.py`) with a provider quality ladder
  (fal.ai / Happy Horse / Pixelle-Video / OpenMontage — see `spec/AGENTSPEC.md`).
  Runner dispatch is PENDING (Phase 4) — the tool is not yet callable by agents.
```

**Verify**: Read the file and confirm the section now describes `video_generate` as a schema class with pending dispatch.

### Step 3: Add a status note at the top of the doc

Add a note at the top of `docs/VIDEOS_SURFACE.md` (after the title, before the Architecture section):

```
> **Status (2026-07-24):** UI rail tab ✅ | Backend router ✅ | Runner dispatch ⏳ (Phase 4) | `video_generate` schema class exists, dispatch pending
```

**Verify**: Read the file and confirm the status note is present.

## STOP conditions

- If the file has already been edited and the stale claims are gone — stop and report; the fix may be unnecessary.
- If the line numbers have shifted significantly — re-read the file to find the exact text before replacing.

## Test plan

No code tests needed. Verification is:
1. `Select-String -Path docs\VIDEOS_SURFACE.md -Pattern '_execute_video_tool'` → should show "(PENDING" next to it
2. `Select-String -Path docs\VIDEOS_SURFACE.md -Pattern 'not yet a tool'` → should return no matches (the old wording is gone)
3. `Select-String -Path docs\VIDEOS_SURFACE.md -Pattern 'Status.*2026-07-24'` → should match the new status note

## Maintenance note

When Phase 4 lands and `_execute_video_tool` is implemented, update this doc again to remove the "PENDING" marker. The status note at the top should track the same ✅/⏳ pattern as the roadmap §7.
