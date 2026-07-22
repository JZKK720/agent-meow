# Plan 005: Add server `/documents/{id}/file` binary endpoint

> **Executor instructions**: Follow this plan step by step.

> **Drift check**: `git diff --stat 1090799b..HEAD -- omnigent/server/routes/documents.py`
> If the file changed, compare excerpts against live code before proceeding.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (but blocks office tools from working end-to-end)
- **Category**: bug
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

The runner's `doc_create_office`, `doc_edit_office`, and `doc_export` tools
fetch and upload binary Office files (`.docx`/`.xlsx`/`.pptx`) via
`server_client.get("{base}/{document_id}/file")` and `server_client.post(base,
files=...)`. But the server's `documents.py` router has no `/file` sub-route,
no multipart handling, and no binary blob storage — the store fields are
`content_md`/`content_json` strings only. Every office tool call fails at
the first binary upload/download. The office surface is dead end-to-end.

## Current state

**Server file**: `omnigent/server/routes/documents.py` — defines 5 routes:
- POST `/sessions/{id}/resources/documents` (JSON create, line ~116)
- GET `/sessions/{id}/resources/documents` (list, line ~140)
- GET `/sessions/{id}/resources/documents/{doc_id}` (get by id, line ~155)
- PATCH `/sessions/{id}/resources/documents/{doc_id}` (JSON update, line ~170)
- DELETE `/sessions/{id}/resources/documents/{doc_id}` (delete, line ~187)

No `/file` sub-route. No `UploadFile` import. No multipart handling.

**Pattern to follow**: `omnigent/server/routes/images.py` — already has
binary handling: `GET .../images/{image_id}` returns raw binary
(`Response(content=data, media_type=...)`), `POST .../images` accepts
`UploadFile` multipart. The images router uses `ArtifactStore` for blob
storage.

**Runner call sites** (already exist, waiting for server support):
- `tool_dispatch.py:4860` — `doc_create_office` POSTs `files={"file": ...}` to the JSON-only create route
- `tool_dispatch.py:4896` — `doc_edit_office` GETs `{base}/{document_id}/file` (binary download)
- `tool_dispatch.py:4940` — `doc_edit_office` PATCHes `files={"file": ...}` to the JSON-only update route
- `tool_dispatch.py:5010` — `doc_export` POSTs rendered output to `/resources/images` (workaround)

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run doc route tests | `uv run pytest tests/server/routes/test_documents.py -v` | all pass |
| Import check | `uv run python -c "from omnigent.server.routes.documents import create_documents_router; print('OK')"` | OK |

## Steps

1. **Read the images router pattern**

   Read `omnigent/server/routes/images.py` — note how it:
   - Accepts `UploadFile` on POST
   - Stores binary via `ArtifactStore`
   - Returns raw binary on GET by id
   - Returns JSON metadata on GET list

2. **Add `GET /sessions/{id}/resources/documents/{doc_id}/file` route**

   In `omnigent/server/routes/documents.py`, add a new route that returns
   the binary content of a document (for office files stored as blobs).
   Mirror the images router's binary GET pattern.

3. **Add multipart support to POST and PATCH**

   Modify the existing POST create route to accept `UploadFile` when the
   content type is multipart (for office file uploads). Modify the PATCH
   update route similarly. Keep the JSON path working for markdown/text docs.

4. **Wire `ArtifactStore` into the documents router**

   The documents router needs access to an `ArtifactStore` for binary blob
   storage, mirroring how the images router uses it. Check the router
   factory's existing dependencies and add `artifact_store` if not present.

5. **Write tests** in `tests/server/routes/test_documents.py`

   Add tests for:
   - POST multipart creates a document with binary content
   - GET `/file` returns the binary content
   - PATCH multipart updates the binary content
   - GET list still returns JSON metadata (not binary)

6. **Run tests**

   Run: `uv run pytest tests/server/routes/test_documents.py -v`

   Expected: all pass.

7. **Commit with DCO**

   ```bash
   git add omnigent/server/routes/documents.py tests/server/routes/test_documents.py
   git commit -s -m "feat(server): add /documents/{id}/file binary endpoint + multipart

   The runner's doc_create_office, doc_edit_office, and doc_export tools
   need binary upload/download support. Adds GET /file sub-route, multipart
   POST/PATCH, and ArtifactStore linkage mirroring the images router pattern."
   ```

## Out of scope

- Do NOT modify the runner's `_execute_office_cli_tool` — it already calls
  the right endpoints (once they exist).
- Do NOT add a `/documents/{id}/file` DELETE route.
- Do NOT change the markdown/text document path (JSON create/update stays).

## STOP conditions

- If `documents.py` already has a `/file` route — someone already added it.
  STOP and verify it matches the runner's expectations.
- If `ArtifactStore` is not available in the router's dependency injection —
  trace how `images.py` gets it and replicate. If it requires an app-level
  change, STOP and report.