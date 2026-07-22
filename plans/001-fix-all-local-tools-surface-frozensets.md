# Plan 001: Fix `_ALL_LOCAL_TOOLS` missing surface tool frozensets

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.

> **Drift check (run first)**: `git diff --stat 1090799b..HEAD -- omnigent/runner/tool_dispatch.py`
> If this file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding; on a mismatch, treat it as
> a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

The `_ALL_LOCAL_TOOLS` union in `omnigent/runner/tool_dispatch.py` is missing
`_DOC_TOOLS`, `_IMAGE_TOOLS`, `_VOICE_TOOLS`, and `_VIDEO_TOOLS`. This means
`should_dispatch_locally()` returns `False` for all surface tools. On the
legacy streaming path (where `dispatch is None`), surface tool calls are
relayed upstream instead of being dispatched by the runner — and the server
has no surface-tool dispatch, so the tools silently fail. This breaks
`doc_*`, `image_*`, `transcribe_audio`, `text_to_speech`, `speak`, and
`video_*` tools for any caller using the legacy path.

## Current state

**File**: `omnigent/runner/tool_dispatch.py`

At line 586, the `_ALL_LOCAL_TOOLS` union is defined:

```python
# Union of all locally-dispatched tools.
_ALL_LOCAL_TOOLS = (
    _OS_ENV_TOOLS
    | _REST_TOOLS
    | _FILE_TOOLS
    | _TERMINAL_TOOLS
    | _ASYNC_INBOX_TOOLS
    | _SUBAGENT_TOOLS
    | _LIST_MODELS_TOOLS
    | _ADVISE_MODELS_TOOLS
    | _SESSION_CREATE_TOOLS
    | _SESSION_QUERY_TOOLS
    | _SESSION_SELF_WRITE_TOOLS
    | _WEB_FETCH_TOOLS
    | _WEB_SEARCH_TOOLS
    | _HINDSIGHT_TOOLS
    | _TIMER_TOOLS
    | _TASK_LIFECYCLE_TOOLS
    | _SKILL_TOOLS
    | _COMMENT_TOOLS
    | _AGENT_TOOLS
    | _POLICY_TOOLS
    | _SCHEDULED_TASK_TOOLS
)
```

The four surface frozensets (`_DOC_TOOLS`, `_IMAGE_TOOLS`, `_VOICE_TOOLS`,
`_VIDEO_TOOLS`) are already defined earlier in the file (lines 392–397) and
are already included in `_NATIVE_RELAY_BUILTIN_TOOLS` (lines 461–464), but
are absent from `_ALL_LOCAL_TOOLS`.

`should_dispatch_locally()` at line 643:

```python
def should_dispatch_locally(tool_name: str) -> bool:
    return tool_name in _ALL_LOCAL_TOOLS
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run voice tests | `uv run pytest tests/runner/test_voice_tool_dispatch.py -v` | 11 passed |
| Run media tests | `uv run pytest tests/runner/test_tool_dispatch_media.py -v` | all pass |
| Import check | `uv run python -c "from omnigent.runner.tool_dispatch import should_dispatch_locally; assert should_dispatch_locally('doc_create'); assert should_dispatch_locally('text_to_speech'); assert should_dispatch_locally('image_list'); assert should_dispatch_locally('video_generate'); print('OK')"` | OK |

## Steps

1. **Add the four surface frozensets to `_ALL_LOCAL_TOOLS`**

   In `omnigent/runner/tool_dispatch.py`, find the `_ALL_LOCAL_TOOLS` union
   (line ~586). Add `| _DOC_TOOLS | _IMAGE_TOOLS | _VOICE_TOOLS | _VIDEO_TOOLS`
   to the end of the union, after `| _SCHEDULED_TASK_TOOLS` and before the
   closing `)`.

   The result should look like:

   ```python
   _ALL_LOCAL_TOOLS = (
       _OS_ENV_TOOLS
       | _REST_TOOLS
       | _FILE_TOOLS
       | _TERMINAL_TOOLS
       | _ASYNC_INBOX_TOOLS
       | _SUBAGENT_TOOLS
       | _LIST_MODELS_TOOLS
       | _ADVISE_MODELS_TOOLS
       | _SESSION_CREATE_TOOLS
       | _SESSION_QUERY_TOOLS
       | _SESSION_SELF_WRITE_TOOLS
       | _WEB_FETCH_TOOLS
       | _WEB_SEARCH_TOOLS
       | _HINDSIGHT_TOOLS
       | _TIMER_TOOLS
       | _TASK_LIFECYCLE_TOOLS
       | _SKILL_TOOLS
       | _COMMENT_TOOLS
       | _AGENT_TOOLS
       | _POLICY_TOOLS
       | _SCHEDULED_TASK_TOOLS
       | _DOC_TOOLS
       | _IMAGE_TOOLS
       | _VOICE_TOOLS
       | _VIDEO_TOOLS
   )
   ```

2. **Verify the import check passes**

   Run: `uv run python -c "from omnigent.runner.tool_dispatch import should_dispatch_locally; assert should_dispatch_locally('doc_create'); assert should_dispatch_locally('text_to_speech'); assert should_dispatch_locally('image_list'); assert should_dispatch_locally('video_generate'); print('OK')"`

   Expected: `OK`

3. **Run existing tests to confirm no regression**

   Run: `uv run pytest tests/runner/test_voice_tool_dispatch.py tests/runner/test_tool_dispatch_media.py -v`

   Expected: all tests pass (11 voice + existing media tests).

4. **Commit with DCO**

   ```bash
   git add omnigent/runner/tool_dispatch.py
   git commit -s -m "fix(runner): add surface tool frozensets to _ALL_LOCAL_TOOLS

   The _ALL_LOCAL_TOOLS union was missing _DOC_TOOLS, _IMAGE_TOOLS,
   _VOICE_TOOLS, and _VIDEO_TOOLS, causing should_dispatch_locally() to
   return False for all surface tools. On the legacy streaming path,
   surface tool calls were relayed upstream instead of dispatched by the
   runner — silently breaking doc_*, image_*, transcribe_audio,
   text_to_speech, speak, and video_* tools."
   ```

## Out of scope

- Do NOT modify `should_dispatch_locally()` itself — only the union it reads.
- Do NOT add new tests in this plan (Plan 003 covers doc dispatch tests).
- Do NOT modify `_NATIVE_RELAY_BUILTIN_TOOLS` — it already includes the four frozensets.

## STOP conditions

- If the import check fails with a `NameError` — one of the frozensets is not
  defined. STOP and report which frozenset is missing.
- If any existing test fails after the change — the surface frozensets may
  contain tool names that conflict with another dispatch path. STOP and report
  the failing test.

## Maintenance note

When Phase 4 renames `omnigent/` back to `agent_meow/`, this file moves but
the fix is path-independent. Future surface tool additions (e.g. a new
`_AUDIO_TOOLS` frozenset) must be added to BOTH `_ALL_LOCAL_TOOLS` and
`_NATIVE_RELAY_BUILTIN_TOOLS` — the two unions must stay in sync.