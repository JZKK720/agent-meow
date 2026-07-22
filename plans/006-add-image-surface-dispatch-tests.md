# Plan 006: Add image surface dispatch tests

> **Executor instructions**: Follow this plan step by step.

> **Drift check**: `git diff --stat 1090799b..HEAD -- omnigent/runner/tool_dispatch.py`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001 (surface frozensets must be in _ALL_LOCAL_TOOLS)
- **Category**: tests
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

`test_tool_dispatch_media.py` has 8 image-related tests, but all cover
**error/edge cases** (`image_generate` with no provider, `image_remove_bg`
with no rembg). The REST-proxy happy paths (`image_list`, `image_get`,
`image_upload`, `image_edit`) are untested. A regression in the
`server_client.get/post/patch` calls would not be caught.

## Current state

**Existing tests** in `tests/runner/test_tool_dispatch_media.py`:
- `test_resolve_image_provider_*` (5 tests) — provider resolution
- `test_image_generate_no_provider_returns_helpful_error`
- `test_image_generate_requires_prompt`
- `test_image_remove_bg_no_rembg_returns_install_error`

**Missing tests** (the REST proxy happy paths):
- `image_list` — GET from `/v1/sessions/{id}/resources/images`
- `image_get` — GET list + filter (or per-id GET once optimized)
- `image_upload` — POST multipart `files={"file": ...}`
- `image_edit` — PATCH JSON with edit params

**Pattern**: `tests/runner/test_voice_tool_dispatch.py` — mock `httpx.AsyncClient`
as `AsyncMock`, return canned `httpx.Response` objects.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run image tests | `uv run pytest tests/runner/test_tool_dispatch_media.py -v -k "image_list or image_get or image_upload or image_edit"` | all pass |

## Steps

1. **Add 4 tests to `tests/runner/test_tool_dispatch_media.py`**

   Add these tests at the end of the file, mirroring the voice test pattern:

   - `test_image_list_returns_rows` — mock `server_client.get` returns
     `{"data": [{"id": "img1", ...}, ...]}`, verify tool returns
     `{"images": [...]}`
   - `test_image_get_filters_list` — mock `server_client.get` returns list,
     verify tool filters to the requested `image_id`
   - `test_image_upload_posts_multipart` — mock `server_client.post` returns
     `{"id": "img_new", ...}`, verify `files=` kwarg is passed
   - `test_image_edit_patches_json` — mock `server_client.patch` returns
     updated image, verify JSON payload

2. **Run the tests**

   Run: `uv run pytest tests/runner/test_tool_dispatch_media.py -v -k "image_list or image_get or image_upload or image_edit"`

   Expected: 4 passed.

3. **Commit with DCO**

   ```bash
   git add tests/runner/test_tool_dispatch_media.py
   git commit -s -m "test(runner): add image surface REST-proxy happy-path tests

   Adds 4 tests for image_list, image_get, image_upload, image_edit
   covering the server_client REST proxy paths that were previously
   untested. Mirrors test_voice_tool_dispatch.py mock pattern."
   ```

## Out of scope

- Do NOT test `image_generate` or `image_remove_bg` — already covered.
- Do NOT add doc tests (Plan 003).

## STOP conditions

- If `_execute_image_tool` signature doesn't match expected
  `(tool_name, args, *, conversation_id, server_client, runner_workspace)` —
  STOP and update the test calls.