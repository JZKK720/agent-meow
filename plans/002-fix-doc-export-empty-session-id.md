# Plan 002: Fix `doc_export` empty session-id path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step.

> **Drift check (run first)**: `git diff --stat 1090799b..HEAD -- omnigent/runner/tool_dispatch.py`
> If this file changed since this plan was written, compare the "Current state"
> excerpts against the live code before proceeding.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

The `doc_export` tool renders an Office document to HTML/PNG/PDF via
`officecli`, then uploads the rendered artifact as an image resource. The
upload URL uses `args.get('session_id', '')` — but the `doc_export` schema
has no `session_id` argument, so `args.get('session_id')` is always `None`
and the path collapses to `/v1/sessions//resources/images`. The server
rejects this (404 on the empty session segment), so the rendered file is
produced but never persisted. The feature is silently broken end-to-end.

## Current state

**File**: `omnigent/runner/tool_dispatch.py`

At line ~5010, inside `_execute_office_cli_tool`'s `doc_export` branch:

```python
                # Upload the rendered output as an image/artifact resource
                data = open(out_path, "rb").read()
                export_name = f"{os.path.splitext(doc_title)[0]}{out_ext}"
                files = {"file": (export_name, data)}
                resp = await server_client.post(
                    f"/v1/sessions/{args.get('session_id', '')}/resources/images",
                    files=files,
                    timeout=60.0,
                )
```

The `_execute_office_cli_tool` function signature at line ~4870:

```python
async def _execute_office_cli_tool(
    tool_name: str,
    args: dict[str, Any],
    *,
    base: str,
    server_client: httpx.AsyncClient | None,
    runner_workspace: Path | None,
) -> str:
```

The caller (`_execute_doc_tool`) has `conversation_id` in scope and passes
`base` but does NOT pass `conversation_id` to `_execute_office_cli_tool`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Import check | `uv run python -c "from omnigent.runner.tool_dispatch import _execute_office_cli_tool; print('OK')"` | OK |
| Run existing tests | `uv run pytest tests/runner/ -v -k "voice or media"` | all pass |

## Steps

1. **Add `conversation_id` parameter to `_execute_office_cli_tool`**

   Find the function signature of `_execute_office_cli_tool` (line ~4870).
   Add `conversation_id: str | None` as a keyword-only parameter:

   ```python
   async def _execute_office_cli_tool(
       tool_name: str,
       args: dict[str, Any],
       *,
       base: str,
       server_client: httpx.AsyncClient | None,
       runner_workspace: Path | None,
       conversation_id: str | None,
   ) -> str:
   ```

2. **Fix the upload URL in the `doc_export` branch**

   Find the line `f"/v1/sessions/{args.get('session_id', '')}/resources/images"`
   (line ~5010). Replace `args.get('session_id', '')` with `conversation_id`:

   ```python
                resp = await server_client.post(
                    f"/v1/sessions/{conversation_id}/resources/images",
                    files=files,
                    timeout=60.0,
                )
   ```

3. **Update the call site in `_execute_doc_tool`**

   Find where `_execute_office_cli_tool` is called from `_execute_doc_tool`
   (line ~4760). Add `conversation_id=conversation_id` to the call:

   ```python
            return await _execute_office_cli_tool(
                tool_name,
                args,
                base=base,
                server_client=server_client,
                runner_workspace=None,
                conversation_id=conversation_id,
            )
   ```

4. **Verify the import check passes**

   Run: `uv run python -c "from omnigent.runner.tool_dispatch import _execute_office_cli_tool; print('OK')"`

   Expected: `OK`

5. **Run existing tests to confirm no regression**

   Run: `uv run pytest tests/runner/ -v -k "voice or media"`

   Expected: all pass.

6. **Commit with DCO**

   ```bash
   git add omnigent/runner/tool_dispatch.py
   git commit -s -m "fix(runner): use conversation_id instead of args['session_id'] in doc_export

   The doc_export upload URL used args.get('session_id', '') but the
   doc_export schema has no session_id argument, so the path collapsed
   to /v1/sessions//resources/images and the server rejected it.
   Thread conversation_id from _execute_doc_tool into _execute_office_cli_tool."
   ```

## Out of scope

- Do NOT modify the `doc_export` schema in `tts.py` or `docs.py`.
- Do NOT add the `/documents/{id}/file` server endpoint (Plan 005).
- Do NOT add doc dispatch tests (Plan 003).

## STOP conditions

- If `_execute_office_cli_tool` is called from other places besides
  `_execute_doc_tool` — STOP and report all call sites so they can be updated.
- If the function signature already has `conversation_id` — someone already
  fixed this. STOP and verify the fix is correct.

## Maintenance note

When the server's `/documents/{id}/file` binary endpoint is added (Plan 005),
the `doc_export` upload destination may change from `/resources/images` to
`/resources/documents/{id}/file`. Keep this in mind when implementing 005.