# Plan 003: Add doc surface dispatch tests

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result.

> **Drift check**: `git diff --stat 1090799b..HEAD -- omnigent/runner/tool_dispatch.py`
> If the file changed, compare excerpts against live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001, plans/002 (tests should verify those fixes)
- **Category**: tests
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

The `_execute_doc_tool` function (~200 lines covering 9 tool names) and
`_execute_office_cli_tool` (~250 lines) have zero test coverage. This is
where the `doc_export` empty-session-id bug (Plan 002) and the
`_ALL_LOCAL_TOOLS` omission (Plan 001) live — both would have been caught by
a basic happy-path test. The repo's copilot-instructions.md requires a test
for behaviour changes under `agent_meow/runner/` (now `omnigent/runner/`).

## Current state

**Pattern to follow**: `tests/runner/test_voice_tool_dispatch.py` (343 lines,
11 tests) — uses `AsyncMock`, `MagicMock`, `patch`, `httpx`, `pytest`,
monkeypatches env vars, mocks `server_client` as an `AsyncMock` returning
canned `httpx.Response` objects.

**File to test**: `omnigent/runner/tool_dispatch.py` — `_execute_doc_tool`
function (line ~4625) and `_execute_office_cli_tool` (line ~4870).

**Key functions to test**:
- `doc_create` — POST to `/v1/sessions/{id}/resources/documents`
- `doc_list` — GET from same base
- `doc_get` — GET from `{base}/{document_id}`
- `doc_update` — PATCH to `{base}/{document_id}`
- `doc_generate` — POST with placeholder content
- `doc_export` — the fixed version (Plan 002) uploads to `/v1/sessions/{conversation_id}/resources/images`
- `doc_convert` — shells out to `markitdown` CLI
- Error cases: missing `server_client`, missing `conversation_id`, missing `document_id`, server 4xx/5xx

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run doc tests | `uv run pytest tests/runner/test_doc_tool_dispatch.py -v` | all pass |
| Import check | `uv run python -c "from omnigent.runner.tool_dispatch import _execute_doc_tool; print('OK')"` | OK |

## Steps

1. **Create the test file** `tests/runner/test_doc_tool_dispatch.py`

   Mirror the structure of `tests/runner/test_voice_tool_dispatch.py`:
   - Import `_execute_doc_tool` from `omnigent.runner.tool_dispatch`
   - Create a `_mock_httpx_response` helper (copy from voice test)
   - Create mock `server_client` as `AsyncMock` with `.get`, `.post`, `.patch` returning mock responses
   - Write tests for:
     - `test_doc_list_returns_documents` — GET returns `{"data": [...]}`, tool returns `{"documents": [...]}`
     - `test_doc_create_posts_payload` — POST receives title/format/content_md
     - `test_doc_generate_creates_placeholder` — POST receives topic as title + outline in content
     - `test_doc_get_returns_document` — GET to `{base}/{document_id}` returns document
     - `test_doc_get_404_returns_error` — 404 response returns error JSON
     - `test_doc_update_patches_payload` — PATCH receives title or content_md
     - `test_doc_update_requires_field` — empty update payload returns error
     - `test_doc_missing_server_client` — `server_client=None` returns error
     - `test_doc_missing_conversation_id` — `conversation_id=None` returns error
     - `test_doc_get_missing_document_id` — `document_id` absent returns error
     - `test_doc_export_uses_conversation_id` — verify the upload POST goes to `/v1/sessions/{conversation_id}/resources/images` (this validates Plan 002's fix)
     - `test_doc_convert_shells_out_to_markitdown` — mock `asyncio.create_subprocess_exec`, verify `markitdown` is called

2. **Run the tests**

   Run: `uv run pytest tests/runner/test_doc_tool_dispatch.py -v`

   Expected: all tests pass.

3. **Commit with DCO**

   ```bash
   git add tests/runner/test_doc_tool_dispatch.py
   git commit -s -m "test(runner): add doc surface dispatch tests (12 tests)

   Covers _execute_doc_tool happy paths (doc_create/list/get/update/generate),
   error cases (missing server_client/conversation_id/document_id, 4xx),
   and the doc_export conversation_id fix. Mirrors test_voice_tool_dispatch.py
   pattern with mocked httpx.AsyncClient and asyncio subprocess."
   ```

## Out of scope

- Do NOT test `_execute_office_cli_tool`'s officecli subprocess in detail —
  mock the subprocess and verify the command is assembled correctly, don't
  test officecli itself.
- Do NOT add image surface tests (Plan 006).

## STOP conditions

- If `_execute_doc_tool` signature doesn't match the expected
  `(tool_name, args, arguments, *, conversation_id, server_client)` —
  the function may have been modified. STOP and update the test calls.
- If Plan 001 or 002 haven't been applied yet — the `doc_export` test will
  fail. Apply 001 and 002 first.