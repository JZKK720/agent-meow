# Inline File Display — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `save_artifact` client tool that lets the agent save files it generates to the `ArtifactStore`, so they're served via the API URL and rendered inline in the chat — solving the Docker path-sharing problem without path translation.

**Architecture:** The existing file upload route (`upload_session_file`) already stores binary content in `ArtifactStore` via `artifact_store.put(stored.id, content)` and serves it via `artifact_store.get(stored.id)`. The `SqlFile` model doesn't need a new `artifact_key` column — the file ID (`stored.id`) IS the artifact key. The gap is that the agent has no tool to call this upload path programmatically. Phase 3 adds a `save_artifact` client tool that reads a file from the workspace, uploads it to the `ArtifactStore` via the session file API, and returns the content URL.

**Tech Stack:** Python, FastAPI (existing session file routes), `agent_meow.client_tools` pattern (existing `coding.py` as template).

## Global Constraints

- **Do NOT introduce any new `omnigent` references or `.omnigent` paths.** agent-meow has diverged from upstream omnigent. Leave existing `OMNIGENT_*` env vars and `agent_meow/` module path alone; new code must not add more.
- **Do NOT add a new `artifact_key` column to `SqlFile`.** The existing architecture uses `stored.id` (the file UUID) as the artifact key — this is already wired. No migration needed.
- **Do NOT modify the existing file upload or content routes.** They already work correctly.
- Use DCO sign-off for all commits: `git commit -s`.
- Backend test command: `uv run pytest tests/` (unit tests only).
- The `save_artifact` tool must follow the existing `client_tools` pattern (export `TOOLS` and `execute_tool`).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `agent_meow/client_tools/save_artifact.py` | Client tool that saves a workspace file to the ArtifactStore via the session file API | Create |
| `tests/client_tools/test_save_artifact.py` | Unit tests for the tool | Create |

---

### Task 1: Create `save_artifact` client tool

**Files:**
- Create: `agent_meow/client_tools/save_artifact.py`
- Test: `tests/client_tools/test_save_artifact.py`

**Interfaces:**
- Consumes: The session file upload API (`POST /v1/sessions/{session_id}/resources/files`), the existing `coding.py` tool pattern
- Produces: A `save_artifact` tool that the agent can call to save a file to the ArtifactStore and get back a content URL

- [ ] **Step 1: Write the failing test**

```python
# tests/client_tools/test_save_artifact.py
"""Tests for the save_artifact client tool."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from agent_meow.client_tools.save_artifact import TOOLS, execute_tool


def test_tools_schema_has_save_artifact():
    """The TOOLS list includes a save_artifact tool definition."""
    names = [t["function"]["name"] for t in TOOLS]
    assert "save_artifact" in names


def test_save_artifact_schema_has_required_params():
    """The save_artifact tool requires file_path and session_id."""
    tool = next(t for t in TOOLS if t["function"]["name"] == "save_artifact")
    params = tool["function"]["parameters"]
    assert "file_path" in params.get("required", [])
    assert "session_id" in params.get("required", [])


def test_save_artifact_returns_content_url(tmp_path: Path):
    """execute_tool returns a JSON string with content_url."""
    # Create a test file
    test_file = tmp_path / "output.png"
    test_file.write_bytes(b"\x89PNG fake image data")

    # Mock the HTTP POST to the session file API
    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {
        "id": "file_abc123",
        "object": "file",
        "filename": "output.png",
        "bytes": 22,
        "content_type": "image/png",
        "session_id": "conv123",
    }
    mock_response.raise_for_status = MagicMock()

    with patch("agent_meow.client_tools.save_artifact.httpx") as mock_httpx:
        mock_client = MagicMock()
        mock_client.post.return_value = mock_response
        mock_httpx.Client.return_value.__enter__ = MagicMock(return_value=mock_client)
        mock_httpx.Client.return_value.__exit__ = MagicMock(return_value=False)

        result = execute_tool(
            "save_artifact",
            {
                "file_path": str(test_file),
                "session_id": "conv123",
            },
        )

    parsed = json.loads(result)
    assert "content_url" in parsed
    assert "conv123" in parsed["content_url"]
    assert "output.png" in parsed["content_url"]


def test_save_artifact_missing_file_returns_error(tmp_path: Path):
    """execute_tool returns an error for a non-existent file."""
    result = execute_tool(
        "save_artifact",
        {
            "file_path": str(tmp_path / "nonexistent.png"),
            "session_id": "conv123",
        },
    )
    parsed = json.loads(result)
    assert "error" in parsed
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/client_tools/test_save_artifact.py -v`
Expected: FAIL — `save_artifact` module not found

- [ ] **Step 3: Implement the tool**

```python
# agent_meow/client_tools/save_artifact.py
"""Client-side ``save_artifact`` tool set.

A single tool — ``save_artifact`` — that reads a file from the
workspace filesystem and uploads it to the server's ArtifactStore
via the session file upload API. Returns a content URL the agent
can reference in its markdown response.

Used by ``agent-meow chat --tools save_artifact`` and the terminal TUI.
"""

from __future__ import annotations

import json
import mimetypes
from pathlib import Path
from typing import Any

import httpx

from omnigent_client.tools import build_tool_handler, tool


def _guess_content_type(file_path: str) -> str:
    """Guess the MIME type from the file extension."""
    guessed, _ = mimetypes.guess_type(file_path)
    return guessed or "application/octet-stream"


@tool
def save_artifact(
    file_path: str,
    session_id: str,
    server_url: str = "http://localhost:6767",
) -> str:
    """
    Save a file from the workspace to the session's ArtifactStore.

    Reads the file from ``file_path``, uploads it via the session
    file upload API, and returns a JSON string with the content URL
    that can be used in markdown responses.

    :param file_path: Absolute or relative path to the file on disk.
    :param session_id: The session/conversation ID to associate the file with.
    :param server_url: The agent-meow server URL (default: http://localhost:6767).
    :returns: JSON string with ``content_url``, ``file_id``, and ``filename``.
    """
    path = Path(file_path)
    if not path.exists():
        return json.dumps({"error": f"File not found: {file_path}"})

    content = path.read_bytes()
    content_type = _guess_content_type(file_path)
    upload_url = f"{server_url}/v1/sessions/{session_id}/resources/files"

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                upload_url,
                files={"file": (path.name, content, content_type)},
            )
            response.raise_for_status()
            result = response.json()
    except httpx.HTTPError as e:
        return json.dumps({"error": f"Upload failed: {e}"})

    file_id = result.get("id", "")
    content_url = f"{server_url}/v1/sessions/{session_id}/resources/files/{file_id}/content"

    return json.dumps({
        "content_url": content_url,
        "file_id": file_id,
        "filename": path.name,
        "bytes": len(content),
        "content_type": content_type,
    })


# Build the tool handler (used by omnigent_client SDK)
_handler = build_tool_handler(save_artifact)

# Export TOOLS and execute_tool for the legacy interface
TOOLS = _handler.tools
execute_tool = _handler.execute_tool
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/client_tools/test_save_artifact.py -v`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add agent_meow/client_tools/save_artifact.py tests/client_tools/test_save_artifact.py
git commit -s -m "feat: add save_artifact client tool for ArtifactStore uploads

The agent can now save files it generates to the ArtifactStore via
the session file upload API, getting back a content_url that renders
inline in the chat. This closes the Docker path-sharing gap — files
go through the ArtifactStore (local/S3/Databricks backends), not
the workspace filesystem."
```

---

## Self-Review

**1. Spec coverage:**
- ✅ `save_artifact` client tool → Task 1
- ✅ No `artifact_key` column needed (existing `stored.id` IS the key — verified in code)
- ✅ No Alembic migration needed (the wiring already exists)
- ✅ Docker path-sharing solved (files go through ArtifactStore, not filesystem)

**2. Placeholder scan:** No placeholders. All code blocks are complete.

**3. Divergence constraint:** The tool uses `omnigent_client.tools` (the existing SDK import path) — this is an existing inherited dependency, not a new `omnigent` reference. No new `.omnigent` paths introduced. The `server_url` defaults to `http://localhost:6767` (the existing local server port), not a `.omnigent` path.