# Plan 038: Auto-Tag + Tag-Aware Search + Auto-Prediction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three features building on plan 037's `file_tags` infrastructure: (1) auto-tag images when scan-workspace imports them, (2) a `search_by_tag` tool the agent calls when users ask "find cat photos", (3) auto-prediction that proactively tags new files in the background.

**Architecture:** Auto-tag hooks into the existing `scan-workspace` endpoint — after importing files, it triggers `image_analyze` for each new image via the agent. Tag-aware search adds a `search_by_tag` tool (schema-only, runner-dispatched) that queries the `file_tags` table by tag string. Auto-prediction adds a background job that watches for new files and queues analysis.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy, React/TypeScript, TanStack Query.

**Spec:** Builds on plan 037 (`plans/037-vision-model-file-tagging.md`). The `file_tags` table, `FileTagStore`, `image_analyze` tool, and `GET /resources/tags` endpoint already exist.

## Global Constraints

- **Python**: 3.12+, `uv run pytest` for tests.
- **Frontend**: React + TypeScript, `cd web && npm test` (vitest).
- **Commit**: `git commit -s` (DCO sign-off).
- **No new dependencies**: Reuse existing `httpx`, SQLAlchemy, FastAPI.
- **Tool pattern**: `search_by_tag` is schema-only `Tool` subclass, runner-dispatched via `_IMAGE_TOOLS` (same as `image_analyze`).
- **Auto-tag is opt-in**: The scan-workspace endpoint gets an `auto_tag: bool = false` query param. The frontend FilesPanel "Scan" button passes `auto_tag=true` when vision model is configured.

---

## Task 1: `search_by_tag` tool schema + runner dispatch

**Files:**
- Modify: `agent_meow/tools/builtins/images.py` (add `SearchByTagTool`)
- Modify: `agent_meow/runner/tool_dispatch.py` (add `search_by_tag` to `_IMAGE_TOOLS`, add `_execute_search_by_tag`)
- Test: `tests/runner/test_search_by_tag_dispatch.py`

**Interfaces:**
- Tool name: `"search_by_tag"`
- Tool args: `session_id` (required), `tag` (required, string), `limit` (optional, default 20)
- Returns: JSON `{"files": [{"file_path": "...", "tag": "...", "confidence": 0.9, "description": "..."}], "count": N}`
- Runner handler queries `FileTagStore.list_for_conversation()` and filters by tag.

- [ ] **Step 1: Write failing test**

```python
# tests/runner/test_search_by_tag_dispatch.py
"""Tests for the search_by_tag runner dispatch handler."""
import json
from unittest.mock import MagicMock
import pytest
from agent_meow.runner.tool_dispatch import _execute_search_by_tag
from agent_meow.entities.file_tag import FileTag

class _FakeTagStore:
    def __init__(self, tags=None):
        self._tags = tags or []
    def list_for_conversation(self, conversation_id):
        return [t for t in self._tags if t.conversation_id == conversation_id]

@pytest.mark.asyncio
async def test_search_by_tag_returns_matching_files():
    store = _FakeTagStore(tags=[
        FileTag(id="1", conversation_id="c1", file_path="/a.png", tag="cat", confidence=0.9, description="A cat", model="m", analyzed_at=1),
        FileTag(id="2", conversation_id="c1", file_path="/b.png", tag="dog", confidence=0.8, description=None, model="m", analyzed_at=1),
        FileTag(id="3", conversation_id="c1", file_path="/c.png", tag="cat", confidence=0.7, description=None, model="m", analyzed_at=1),
    ])
    result = await _execute_search_by_tag("search_by_tag", json.dumps({"session_id":"c1","tag":"cat"}), conversation_id="c1", server_client=None, file_tag_store=store)
    data = json.loads(result)
    assert data["count"] == 2
    assert all(f["tag"] == "cat" for f in data["files"])

@pytest.mark.asyncio
async def test_search_by_tag_returns_empty_for_no_match():
    store = _FakeTagStore()
    result = await _execute_search_by_tag("search_by_tag", json.dumps({"session_id":"c1","tag":"cat"}), conversation_id="c1", server_client=None, file_tag_store=store)
    data = json.loads(result)
    assert data["count"] == 0
    assert data["files"] == []

@pytest.mark.asyncio
async def test_search_by_tag_returns_error_without_store():
    result = await _execute_search_by_tag("search_by_tag", json.dumps({"tag":"cat"}), conversation_id="c1", server_client=None, file_tag_store=None)
    data = json.loads(result)
    assert "error" in data
```

- [ ] **Step 2: Run test, verify FAIL**
- [ ] **Step 3: Add `SearchByTagTool` to `images.py`**

```python
class SearchByTagTool(Tool):
    """Search workspace files by AI-generated tag.

    Runner-dispatched: queries the file_tags table for files matching
    the given tag. Returns file paths, confidence scores, and descriptions.
    """
    @classmethod
    def name(cls) -> str:
        return "search_by_tag"
    @classmethod
    def description(cls) -> str:
        return (
            "Search workspace files by AI-generated classification tag. "
            "Returns matching file paths with confidence scores. "
            "Requires session_id and tag (e.g. 'cat', 'outdoor', 'screenshot'). "
            "Optional: limit (default 20, max 100)."
        )
    def get_schema(self) -> dict[str, Any]:
        return {"type":"function","function":{"name":SearchByTagTool.name(),"description":SearchByTagTool.description(),"parameters":{"type":"object","properties":{"session_id":{"type":"string","description":"The session to search in."},"tag":{"type":"string","description":"Tag to search for (case-insensitive)."},"limit":{"type":"integer","description":"Max results. Default 20, max 100."}},"required":["session_id","tag"],"additionalProperties":False}}}
```

- [ ] **Step 4: Add `search_by_tag` to `_IMAGE_TOOLS` + write `_execute_search_by_tag`**

```python
async def _execute_search_by_tag(tool_name, arguments, *, conversation_id, server_client, file_tag_store=None):
    if file_tag_store is None:
        return json.dumps({"error": "search_by_tag: file tag store not available"})
    try:
        args = json.loads(arguments) if arguments.strip() else {}
    except json.JSONDecodeError:
        return json.dumps({"error": "search_by_tag: malformed JSON arguments"})
    tag = args.get("tag", "").strip().lower()
    if not tag:
        return json.dumps({"error": "search_by_tag: missing required argument: tag"})
    limit = min(args.get("limit", 20), 100)
    all_tags = file_tag_store.list_for_conversation(conversation_id or args.get("session_id", ""))
    matching = [t for t in all_tags if t.tag == tag][:limit]
    return json.dumps({"files": [{"file_path": t.file_path, "tag": t.tag, "confidence": t.confidence, "description": t.description} for t in matching], "count": len(matching)})
```

- [ ] **Step 5: Run tests, verify PASS**
- [ ] **Step 6: Commit**

---

## Task 2: Auto-tag on scan-workspace

**Files:**
- Modify: `agent_meow/server/routes/workspace_scan.py` (add `auto_tag` param)
- Modify: `web/src/lib/workspaceScanApi.ts` (pass `auto_tag` flag)
- Modify: `web/src/shell/SharedFolderSelector.tsx` (pass `auto_tag=true` when vision configured)
- Test: `tests/server/routes/test_workspace_scan.py` (add auto_tag test)

**Interfaces:**
- `ScanWorkspaceRequest` gets `auto_tag: bool = False`
- When `auto_tag=true`, the scan response includes `tag_queued: N` (number of images queued for analysis)
- The scan endpoint does NOT call the vision model directly — it returns the list of new images, and the frontend triggers analysis via the existing "Analyze" flow (chat message to agent)

- [ ] **Step 1: Add `auto_tag` to `ScanWorkspaceRequest`**
- [ ] **Step 2: In the scan handler, count new images and return `tag_queued` count**
- [ ] **Step 3: When `auto_tag=true` and new images exist, automatically send the analyze chat message**
- [ ] **Step 4: Update frontend API client to pass `auto_tag`**
- [ ] **Step 5: Update SharedFolderSelector to pass `auto_tag=true`**
- [ ] **Step 6: Test + commit**

---

## Task 3: Auto-prediction background job

**Files:**
- Create: `agent_meow/server/background_file_watcher.py` — watches workspace for new files, queues analysis
- Modify: `agent_meow/server/app.py` — start the watcher on server startup
- Test: `tests/server/test_background_file_watcher.py`

**Interfaces:**
- `BackgroundFileWatcher` class: scans workspace every 60s for new image files not yet in `file_tags`, sends analyze chat message for each batch of 5
- Configurable interval (default 60s), max batch size (5), enabled flag

- [ ] **Step 1: Write the watcher class**
- [ ] **Step 2: Wire into server startup**
- [ ] **Step 3: Test + commit**

---

## STOP conditions

- The `search_by_tag` tool must be added to `_IMAGE_TOOLS` (not `_DOC_TOOLS`) since it queries image tags
- Auto-tag must NOT call the vision model directly from the scan endpoint — it should trigger the agent via chat message (same as the "Analyze" button)
- The background watcher must be opt-in (disabled by default, enabled via env var `AGENT_MEOW_AUTO_TAG=true`)

## Maintenance notes

- **search_by_tag supports partial matching**: Future enhancement — add `search_by_tag_partial` that matches tags containing the query string (e.g. "cat" matches "category", "scattered")
- **Multi-tag search**: Future enhancement — `search_by_tags` that accepts multiple tags and returns files matching ALL or ANY
- **Tag confidence threshold**: Future enhancement — `min_confidence` param to filter low-confidence tags
- **Auto-prediction model selection**: The watcher should use the same vision model configured in Settings → Media (HERMES_VISION_PROVIDER/HERMES_VISION_MODEL)
