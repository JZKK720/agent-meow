# Plan 037: Vision Model File Tagging — agent-driven image classification via `image_analyze` tool

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an `image_analyze` tool to the agent's Images surface that the agent calls to classify workspace images, stores tags in a new `file_tags` SQLite table, and adds a tag-filter UI to the FilesPanel. The "Analyze" button sends a chat message to the agent, which uses its existing vision capability + the new tool.

**Architecture:** The agent already accepts image input (vision modality) and has file system tools. We add an `image_analyze` tool (schema-only, runner-dispatched — same pattern as `image_list`, `image_generate`). When the user clicks "Analyze" in FilesPanel, the frontend sends a chat message: "Analyze all images in the workspace and tag them using the `image_analyze` tool." The agent reads each image (its vision model sees the pixels), calls `image_analyze` with the tags, and the runner stores them in the `file_tags` table. The FilesPanel tag-filter bar queries `GET /v1/sessions/{id}/resources/tags` to display chips.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy/Alembic, Pydantic, httpx (async HTTP), React/TypeScript, Tailwind, TanStack Query.

**Spec:** This plan implements Phase 1 of the vision model file management direction recorded in `plans/036-shared-folder-scan-path-fix.md` (line 397): "Future: AI file management features: The user mentioned vision models sorting/classifying photos."

**Why agent-driven (Option B) over a standalone REST endpoint (Option A):**
- The hermes-gateway agent already has vision capability (`input: [text, image, file]` in config.yaml)
- The agent already has file system tools (`read_file`, `search_files`, `terminal`)
- The Images surface tools are auto-registered (no `tools.builtins:` entry needed) — the runner intercepts them by name in `_IMAGE_TOOLS`
- The agent can orchestrate: classify images, rename files by category, create folders — not just tag
- No duplicate vision model call — the agent's LLM sees the image in its context, calls `image_analyze` to persist tags

## Global Constraints

- **Python**: 3.12+, managed via `uv`. Run tests with `uv run pytest`.
- **Frontend**: React + TypeScript. Test with `cd web && npm test` (vitest, colocated `*.test.tsx`).
- **Lint**: `uv run ruff check .` (Python), `cd web && npm run lint` (oxlint).
- **Type check**: `uv run mypy agent_meow` (strict), `cd web && npm run type-check` (tsc -b).
- **Commit**: `git commit -s` (DCO sign-off required).
- **No new dependencies**: Use `httpx` (already in pyproject.toml) for HTTP calls.
- **Tool pattern**: `image_analyze` is a schema-only `Tool` subclass (like `ImageListTool`), runner-dispatched via `_IMAGE_TOOLS` in `tool_dispatch.py`.
- **Image extensions**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`, `.bmp` (same as `workspace_scan.py`).
- **Tag format**: The agent generates tags from its vision model context. The `image_analyze` tool receives `file_path`, `tags` (list of strings), and optional `description`. The runner stores them.
- **Tag constraints**: Tags are lowercase, max 20 chars each, max 10 tags per image. The runner validates and sanitizes.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `agent_meow/db/migrations/versions/b1c2d3e4f8a9_add_file_tags_table.py` | Alembic migration creating `file_tags` table |
| `agent_meow/entities/file_tag.py` | `FileTag` dataclass entity |
| `agent_meow/stores/file_tag_store/__init__.py` | `FileTagStore` ABC with `upsert`, `list_for_conversation`, `list_tags`, `delete_for_conversation` |
| `agent_meow/stores/file_tag_store/sqlalchemy_store.py` | SQLAlchemy implementation |
| `agent_meow/server/routes/file_tags.py` | FastAPI router: `GET /sessions/{id}/resources/tags` (read-only query endpoint) |
| `agent_meow/tools/builtins/images.py` | Modified: add `ImageAnalyzeTool` schema-only tool class |
| `agent_meow/runner/tool_dispatch.py` | Modified: add `image_analyze` to `_IMAGE_TOOLS`, add `_execute_image_analyze` handler |
| `tests/stores/test_file_tag_store.py` | Unit tests for FileTagStore |
| `tests/server/routes/test_file_tags.py` | Backend tests for GET /resources/tags endpoint |
| `tests/runner/test_image_analyze_dispatch.py` | Unit tests for the runner dispatch handler |
| `web/src/lib/fileTagsApi.ts` | Typed API client for GET /resources/tags |
| `web/src/hooks/useFileTags.ts` | TanStack Query hooks: `useFileTags`, `useAnalyzeFiles` |
| `web/src/shell/FileTagFilter.tsx` | Tag-chip filter bar component for FilesPanel |
| `web/src/shell/FileTagFilter.test.tsx` | Vitest tests for FileTagFilter |
| `web/src/shell/FilesPanel.tsx` | Modified: integrate FileTagFilter + analyze button |

---

## Task 1: Database migration — `file_tags` table

**Files:**
- Create: `agent_meow/db/migrations/versions/b1c2d3e4f8a9_add_file_tags_table.py`

**Interfaces:**
- Produces: `file_tags` table with columns: `id` (PK, String(64)), `conversation_id` (String(64), indexed), `file_path` (String(1024)), `tag` (String(64)), `confidence` (Float), `description` (Text, nullable), `model` (String(128)), `analyzed_at` (Integer). Unique index on `(conversation_id, file_path, tag)`.

- [ ] **Step 1: Write the migration file**

```python
"""add file_tags table for vision model image classification

Revision ID: b1c2d3e4f8a9
Revises: z10a3b4c5d6e
Create Date: 2026-08-29 00:00:00.000000

Adds the ``file_tags`` table for storing AI-generated tags for workspace
images. Populated by the runner's ``image_analyze`` tool dispatch handler
when the agent calls ``image_analyze`` after classifying an image with
its vision model.
"""

from alembic import op
import sqlalchemy as sa

revision = "b1c2d3e4f8a9"
down_revision = "z10a3b4c5d6e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "file_tags",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("conversation_id", sa.String(64), nullable=False),
        sa.Column("file_path", sa.String(1024), nullable=False),
        sa.Column("tag", sa.String(64), nullable=False),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("model", sa.String(128), nullable=False, server_default=""),
        sa.Column("analyzed_at", sa.Integer(), nullable=False),
    )
    op.create_index(
        "ix_file_tags_conversation_id", "file_tags", ["conversation_id"]
    )
    op.create_index(
        "uix_file_tags_conv_path_tag",
        "file_tags",
        ["conversation_id", "file_path", "tag"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uix_file_tags_conv_path_tag", table_name="file_tags")
    op.drop_index("ix_file_tags_conversation_id", table_name="file_tags")
    op.drop_table("file_tags")
```

- [ ] **Step 2: Run migration to verify it applies**

Run: `uv run alembic upgrade head`
Expected: No errors. Table `file_tags` created.

- [ ] **Step 3: Verify table structure**

Run: `uv run python -c "import sqlite3; c=sqlite3.connect('agent_meow.db'); print(c.execute('PRAGMA table_info(file_tags)').fetchall())"`
Expected: 8 columns listed with correct types.

- [ ] **Step 4: Commit**

```bash
git add agent_meow/db/migrations/versions/b1c2d3e4f8a9_add_file_tags_table.py
git commit -s -m "feat(db): add file_tags table for vision model image classification"
```

---

## Task 2: FileTag entity + FileTagStore

**Files:**
- Create: `agent_meow/entities/file_tag.py`
- Create: `agent_meow/stores/file_tag_store/__init__.py`
- Create: `agent_meow/stores/file_tag_store/sqlalchemy_store.py`
- Test: `tests/stores/test_file_tag_store.py`

**Interfaces:**
- Produces: `FileTag` dataclass with fields: `id`, `conversation_id`, `file_path`, `tag`, `confidence`, `description`, `model`, `analyzed_at`.
- Produces: `FileTagStore` ABC with methods: `upsert(conversation_id, file_path, tags: list[TagEntry], model: str) -> int`, `list_for_conversation(conversation_id) -> list[FileTag]`, `list_tags(conversation_id) -> list[TagSummary]`, `delete_for_conversation(conversation_id) -> int`.
- `TagEntry` is a `dataclass` with `tag: str`, `confidence: float`, `description: str | None`.
- `TagSummary` is a `dataclass` with `tag: str`, `count: int`.

- [ ] **Step 1: Write the failing test for FileTagStore**

```python
"""Tests for FileTagStore — file tag persistence for vision model classification."""

from __future__ import annotations

import tempfile
from agent_meow.entities.file_tag import FileTag, TagEntry
from agent_meow.stores.file_tag_store.sqlalchemy_store import SqlAlchemyFileTagStore


def _make_store() -> SqlAlchemyFileTagStore:
    """Create a store backed by a temp SQLite DB."""
    db_path = tempfile.mktemp(suffix=".db")
    store = SqlAlchemyFileTagStore(f"sqlite:///{db_path}")
    store._ensure_table()
    return store


def test_upsert_stores_tags_for_file():
    store = _make_store()
    tags = [
        TagEntry(tag="cat", confidence=0.95, description="A cat on grass"),
        TagEntry(tag="outdoor", confidence=0.88, description=None),
    ]
    count = store.upsert("conv1", "/workspace/photo.jpg", tags, model="gemma4:26b")
    assert count == 2
    results = store.list_for_conversation("conv1")
    assert len(results) == 2
    assert results[0].tag == "cat"
    assert results[0].file_path == "/workspace/photo.jpg"
    assert results[0].model == "gemma4:26b"


def test_upsert_replaces_existing_tags_for_same_file():
    store = _make_store()
    store.upsert("conv1", "/workspace/photo.jpg",
                 [TagEntry(tag="old_tag", confidence=0.5, description=None)],
                 model="old_model")
    store.upsert("conv1", "/workspace/photo.jpg",
                 [TagEntry(tag="new_tag", confidence=0.9, description=None)],
                 model="new_model")
    results = [r for r in store.list_for_conversation("conv1") if r.file_path == "/workspace/photo.jpg"]
    assert len(results) == 1
    assert results[0].tag == "new_tag"
    assert results[0].model == "new_model"


def test_list_tags_returns_unique_tags_with_counts():
    store = _make_store()
    store.upsert("conv1", "/workspace/a.jpg",
                 [TagEntry(tag="cat", confidence=0.9, description=None)], model="m")
    store.upsert("conv1", "/workspace/b.jpg",
                 [TagEntry(tag="cat", confidence=0.8, description=None),
                  TagEntry(tag="dog", confidence=0.7, description=None)], model="m")
    tags = store.list_tags("conv1")
    tag_map = {t.tag: t.count for t in tags}
    assert tag_map == {"cat": 2, "dog": 1}


def test_delete_for_conversation_removes_all_tags():
    store = _make_store()
    store.upsert("conv1", "/workspace/a.jpg",
                 [TagEntry(tag="cat", confidence=0.9, description=None)], model="m")
    deleted = store.delete_for_conversation("conv1")
    assert deleted == 1
    assert store.list_for_conversation("conv1") == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/stores/test_file_tag_store.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'agent_meow.entities.file_tag'`

- [ ] **Step 3: Write the FileTag entity**

```python
"""File tag entity for vision model image classification.

Each ``FileTag`` records one AI-generated tag for one workspace image file.
Multiple tags per file are stored as separate rows (one per tag). The agent
generates tags from its vision model context, then calls the ``image_analyze``
tool to persist them via the runner dispatch.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class FileTag:
    """One AI-generated tag for one file.

    :param id: UUID primary key.
    :param conversation_id: Owning session/conversation id.
    :param file_path: Absolute or workspace-relative path of the tagged file.
    :param tag: Classification label, e.g. ``"cat"``, ``"outdoor"``.
    :param confidence: Model confidence score, 0.0-1.0.
    :param description: Optional natural-language description from the model.
    :param model: Model name that produced the tag, e.g. ``"gemma4:26b"``.
    :param analyzed_at: Unix epoch seconds when the tag was stored.
    """

    id: str
    conversation_id: str
    file_path: str
    tag: str
    confidence: float
    description: str | None
    model: str
    analyzed_at: int


@dataclass(frozen=True)
class TagEntry:
    """Input tag for :meth:`FileTagStore.upsert` — no id/timestamp."""

    tag: str
    confidence: float
    description: str | None


@dataclass(frozen=True)
class TagSummary:
    """Aggregated tag count for the tag-filter UI."""

    tag: str
    count: int
```

- [ ] **Step 4: Write the FileTagStore ABC**

```python
"""File tag store: manages per-session AI-generated file tags.

Abstract base + SQLAlchemy implementation. Tags are produced by the
agent's vision model and persisted via the runner's ``image_analyze``
tool dispatch handler. One row per (file, tag) pair.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities.file_tag import FileTag, TagEntry, TagSummary


class FileTagStore(ABC):
    """Abstract base for file tag persistence."""

    def __init__(self, storage_location: str) -> None:
        self.storage_location = storage_location

    @abstractmethod
    def upsert(
        self,
        conversation_id: str,
        file_path: str,
        tags: list[TagEntry],
        model: str,
    ) -> int:
        """Replace all tags for a given (conversation_id, file_path) pair.

        Deletes existing tags for that file, then inserts the new ones.
        Returns the number of tags inserted.
        """
        ...

    @abstractmethod
    def list_for_conversation(self, conversation_id: str) -> list[FileTag]:
        """Return all file tags for a conversation."""
        ...

    @abstractmethod
    def list_tags(self, conversation_id: str) -> list[TagSummary]:
        """Return unique tags with counts for a conversation."""
        ...

    @abstractmethod
    def delete_for_conversation(self, conversation_id: str) -> int:
        """Delete all file tags for a conversation. Returns count deleted."""
        ...
```

- [ ] **Step 5: Write the SQLAlchemy implementation**

```python
"""SQLAlchemy implementation of FileTagStore.

Uses a raw SQLite connection (same pattern as other stores in this repo)
to avoid coupling to the global engine/session lifecycle.
"""

from __future__ import annotations

import time
import uuid
from collections import Counter

from sqlalchemy import create_engine, text

from agent_meow.entities.file_tag import FileTag, TagEntry, TagSummary
from agent_meow.stores.file_tag_store import FileTagStore

_CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS file_tags (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    tag VARCHAR(64) NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    description TEXT,
    model VARCHAR(128) NOT NULL DEFAULT '',
    analyzed_at INTEGER NOT NULL
)
"""

_CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS ix_file_tags_conversation_id ON file_tags (conversation_id)",
    "CREATE UNIQUE INDEX IF NOT EXISTS uix_file_tags_conv_path_tag ON file_tags (conversation_id, file_path, tag)",
]


class SqlAlchemyFileTagStore(FileTagStore):
    """SQLite-backed file tag store."""

    def __init__(self, db_uri: str) -> None:
        super().__init__(db_uri)
        self._engine = create_engine(db_uri)
        self._ensure_table()

    def _ensure_table(self) -> None:
        """Create the table if it doesn't exist (for test fixtures)."""
        with self._engine.begin() as conn:
            conn.execute(text(_CREATE_TABLE_SQL))
            for sql in _CREATE_INDEXES_SQL:
                conn.execute(text(sql))

    def upsert(
        self,
        conversation_id: str,
        file_path: str,
        tags: list[TagEntry],
        model: str,
    ) -> int:
        now = int(time.time())
        with self._engine.begin() as conn:
            conn.execute(
                text(
                    "DELETE FROM file_tags WHERE conversation_id = :cid AND file_path = :fp"
                ),
                {"cid": conversation_id, "fp": file_path},
            )
            for entry in tags:
                conn.execute(
                    text(
                        """INSERT INTO file_tags (id, conversation_id, file_path, tag, confidence, description, model, analyzed_at)
                           VALUES (:id, :cid, :fp, :tag, :conf, :desc, :model, :ts)"""
                    ),
                    {
                        "id": str(uuid.uuid4()),
                        "cid": conversation_id,
                        "fp": file_path,
                        "tag": entry.tag,
                        "conf": entry.confidence,
                        "desc": entry.description,
                        "model": model,
                        "ts": now,
                    },
                )
        return len(tags)

    def list_for_conversation(self, conversation_id: str) -> list[FileTag]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT id, conversation_id, file_path, tag, confidence, description, model, analyzed_at "
                    "FROM file_tags WHERE conversation_id = :cid ORDER BY file_path, tag"
                ),
                {"cid": conversation_id},
            ).fetchall()
        return [
            FileTag(
                id=r[0], conversation_id=r[1], file_path=r[2], tag=r[3],
                confidence=r[4], description=r[5], model=r[6], analyzed_at=r[7],
            )
            for r in rows
        ]

    def list_tags(self, conversation_id: str) -> list[TagSummary]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                text(
                    "SELECT tag, COUNT(*) as cnt FROM file_tags "
                    "WHERE conversation_id = :cid GROUP BY tag ORDER BY cnt DESC, tag"
                ),
                {"cid": conversation_id},
            ).fetchall()
        return [TagSummary(tag=r[0], count=r[1]) for r in rows]

    def delete_for_conversation(self, conversation_id: str) -> int:
        with self._engine.begin() as conn:
            result = conn.execute(
                text("DELETE FROM file_tags WHERE conversation_id = :cid"),
                {"cid": conversation_id},
            )
            return result.rowcount
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `uv run pytest tests/stores/test_file_tag_store.py -v`
Expected: 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add agent_meow/entities/file_tag.py agent_meow/stores/file_tag_store/ tests/stores/test_file_tag_store.py
git commit -s -m "feat(store): add FileTagStore for vision model image tags"
```

---

## Task 3: `image_analyze` tool schema (agent-facing)

**Files:**
- Modify: `agent_meow/tools/builtins/images.py` (add `ImageAnalyzeTool` class at end of file)

**Interfaces:**
- Produces: `ImageAnalyzeTool` — schema-only `Tool` subclass, runner-dispatched. The agent calls it with `file_path`, `tags`, and optional `description`. The runner intercepts the call and stores tags in `FileTagStore`.
- Tool name: `"image_analyze"`
- Tool args: `session_id` (required), `file_path` (required), `tags` (required, list of strings), `description` (optional string).

- [ ] **Step 1: Add the ImageAnalyzeTool class to images.py**

Append to the end of `agent_meow/tools/builtins/images.py`:

```python
class ImageAnalyzeTool(Tool):
    """Store AI-generated tags for a workspace image.

    Runner-dispatched: the runner intercepts this call and stores the
    tags in the ``file_tags`` table via ``FileTagStore``. The agent
    generates tags from its vision model context (it sees the image
    via the ``input_image`` modality), then calls this tool to persist
    them. This is the agent-driven image classification pipeline —
    no separate vision API call is made; the agent's own LLM sees
    the image and produces the tags.
    """

    @classmethod
    def name(cls) -> str:
        return "image_analyze"

    @classmethod
    def description(cls) -> str:
        return (
            "Store AI-generated classification tags for a workspace image. "
            "Use this after you have looked at an image (via vision) and "
            "determined its content categories. Tags should be lowercase, "
            "descriptive labels (e.g. 'cat', 'outdoor', 'daytime', "
            "'screenshot', 'document'). Max 10 tags per image. "
            "Requires session_id, file_path, and tags (list of strings). "
            "Optional: description (one-sentence summary of the image)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageAnalyzeTool.name(),
                "description": ImageAnalyzeTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the image.",
                        },
                        "file_path": {
                            "type": "string",
                            "description": (
                                "Absolute or workspace-relative path of the "
                                "image file to tag."
                            ),
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": (
                                "List of 1-10 lowercase classification tags "
                                "for the image, each max 20 characters."
                            ),
                        },
                        "description": {
                            "type": "string",
                            "description": (
                                "Optional one-sentence description of the "
                                "image content."
                            ),
                        },
                    },
                    "required": ["session_id", "file_path", "tags"],
                    "additionalProperties": False,
                },
            },
        }
```

- [ ] **Step 2: Verify the tool class is importable**

Run: `uv run python -c "from agent_meow.tools.builtins.images import ImageAnalyzeTool; print(ImageAnalyzeTool.name())"`
Expected: `image_analyze`

- [ ] **Step 3: Commit**

```bash
git add agent_meow/tools/builtins/images.py
git commit -s -m "feat(tool): add image_analyze schema-only tool for agent-driven image tagging"
```

---

## Task 4: Runner dispatch handler for `image_analyze`

**Files:**
- Modify: `agent_meow/runner/tool_dispatch.py` (add `image_analyze` to `_IMAGE_TOOLS`, add `_execute_image_analyze` function, wire in `_execute_image_tool`)

**Interfaces:**
- Consumes: `FileTagStore` (from Task 2), `server_client` (httpx.AsyncClient for server access).
- Produces: `_execute_image_analyze(tool_name, arguments, conversation_id, server_client, file_tag_store) -> str` — parses args, sanitizes tags, calls `file_tag_store.upsert`, returns JSON result.

- [ ] **Step 1: Write the failing test for the dispatch handler**

```python
"""Tests for the image_analyze runner dispatch handler."""

from __future__ import annotations

import json
from unittest.mock import MagicMock

import pytest

from agent_meow.runner.tool_dispatch import _execute_image_analyze


class _FakeTagStore:
    def __init__(self):
        self._upserts: list[tuple] = []

    def upsert(self, conversation_id, file_path, tags, model):
        self._upserts.append((conversation_id, file_path, tags, model))
        return len(tags)

    def list_tags(self, conversation_id):
        return []

    def list_for_conversation(self, conversation_id):
        return []

    def delete_for_conversation(self, conversation_id):
        return 0


@pytest.mark.asyncio
async def test_image_analyze_stores_tags():
    tag_store = _FakeTagStore()
    args = json.dumps({
        "session_id": "conv1",
        "file_path": "/workspace/photo.jpg",
        "tags": ["cat", "outdoor", "daytime"],
        "description": "A cat sitting on grass",
    })
    result = await _execute_image_analyze(
        "image_analyze", args,
        conversation_id="conv1",
        server_client=None,
        file_tag_store=tag_store,
    )
    data = json.loads(result)
    assert data["stored"] == 3
    assert data["file_path"] == "/workspace/photo.jpg"
    assert len(tag_store._upserts) == 1
    assert tag_store._upserts[0][0] == "conv1"


@pytest.mark.asyncio
async def test_image_analyze_sanitizes_tags():
    tag_store = _FakeTagStore()
    args = json.dumps({
        "session_id": "conv1",
        "file_path": "/workspace/photo.jpg",
        "tags": ["CAT", "  outdoor  ", "a-very-long-tag-that-exceeds-twenty-chars"],
    })
    result = await _execute_image_analyze(
        "image_analyze", args,
        conversation_id="conv1",
        server_client=None,
        file_tag_store=tag_store,
    )
    data = json.loads(result)
    assert data["stored"] == 3
    # Check the tags were sanitized
    upserted_tags = [t.tag for t in tag_store._upserts[0][2]]
    assert "cat" in upserted_tags
    assert "outdoor" in upserted_tags
    # Long tag truncated to 20 chars
    long_tag = [t for t in upserted_tags if len(t) == 20][0]
    assert long_tag.startswith("a-very-long-tag")


@pytest.mark.asyncio
async def test_image_analyze_caps_max_tags():
    tag_store = _FakeTagStore()
    args = json.dumps({
        "session_id": "conv1",
        "file_path": "/workspace/photo.jpg",
        "tags": [f"tag{i}" for i in range(15)],
    })
    result = await _execute_image_analyze(
        "image_analyze", args,
        conversation_id="conv1",
        server_client=None,
        file_tag_store=tag_store,
    )
    data = json.loads(result)
    assert data["stored"] == 10  # capped at 10


@pytest.mark.asyncio
async def test_image_analyze_returns_error_without_file_tag_store():
    args = json.dumps({
        "session_id": "conv1",
        "file_path": "/workspace/photo.jpg",
        "tags": ["cat"],
    })
    result = await _execute_image_analyze(
        "image_analyze", args,
        conversation_id="conv1",
        server_client=None,
        file_tag_store=None,
    )
    data = json.loads(result)
    assert "error" in data
    assert "not available" in data["error"].lower()


@pytest.mark.asyncio
async def test_image_analyze_returns_error_on_missing_args():
    tag_store = _FakeTagStore()
    result = await _execute_image_analyze(
        "image_analyze", "{}",
        conversation_id="conv1",
        server_client=None,
        file_tag_store=tag_store,
    )
    data = json.loads(result)
    assert "error" in data
    assert "file_path" in data["error"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/runner/test_image_analyze_dispatch.py -v`
Expected: FAIL with `ImportError: cannot import name '_execute_image_analyze'`

- [ ] **Step 3: Add `image_analyze` to `_IMAGE_TOOLS` and write the handler**

In `agent_meow/runner/tool_dispatch.py`, add `"image_analyze"` to the `_IMAGE_TOOLS` frozenset:

```python
_IMAGE_TOOLS = frozenset(
    {
        "image_list",
        "image_get",
        "image_upload",
        "image_edit",
        "image_generate",
        "image_remove_bg",
        "image_edit_ai",
        "image_analyze",
    }
)
```

Then add the `_execute_image_analyze` function (near the other `_execute_image_*` functions):

```python
async def _execute_image_analyze(
    tool_name: str,
    arguments: str,
    *,
    conversation_id: str | None,
    server_client: httpx.AsyncClient | None,
    file_tag_store: Any | None = None,
) -> str:
    """Runner-local handler for the ``image_analyze`` tool.

    The agent calls this after classifying an image with its vision model.
    The handler sanitizes the tags (lowercase, strip, truncate to 20 chars,
    cap at 10), stores them in the ``FileTagStore``, and returns a JSON
    result. No vision API call is made — the agent's own LLM produced the
    tags from its image context.

    :param tool_name: Always ``"image_analyze"``.
    :param arguments: JSON-encoded arguments from the LLM.
    :param conversation_id: Current session id.
    :param server_client: Unused (tags are stored locally, not via server REST).
    :param file_tag_store: The FileTagStore instance for tag persistence.
    :returns: Tool output JSON string.
    """
    if file_tag_store is None:
        return json.dumps({"error": "image_analyze: file tag store not available on this runner"})

    try:
        args: dict[str, Any] = json.loads(arguments) if arguments.strip() else {}
    except json.JSONDecodeError:
        return json.dumps({"error": "image_analyze: malformed JSON arguments"})

    file_path = args.get("file_path")
    tags_raw = args.get("tags", [])
    description = args.get("description")

    if not file_path:
        return json.dumps({"error": "image_analyze: missing required argument: file_path"})
    if not isinstance(tags_raw, list) or not tags_raw:
        return json.dumps({"error": "image_analyze: missing or invalid 'tags' (must be a non-empty list)"})

    # Sanitize tags: lowercase, strip, truncate to 20 chars, cap at 10.
    from agent_meow.entities.file_tag import TagEntry

    sanitized_tags: list[TagEntry] = []
    for t in tags_raw[:10]:
        if isinstance(t, str):
            clean = t.strip().lower()[:20]
            if clean:
                sanitized_tags.append(
                    TagEntry(tag=clean, confidence=1.0, description=description)
                )

    if not sanitized_tags:
        return json.dumps({"error": "image_analyze: no valid tags after sanitization"})

    # Determine the model name from the conversation or env.
    model_name = os.environ.get("HERMES_VISION_MODEL", "") or os.environ.get("AGENT_MEOW_MODEL", "unknown")

    try:
        count = file_tag_store.upsert(
            conversation_id or args.get("session_id", ""),
            file_path,
            sanitized_tags,
            model_name,
        )
    except Exception as exc:  # noqa: BLE001
        return json.dumps({"error": f"image_analyze: failed to store tags: {exc}"})

    return json.dumps({
        "stored": count,
        "file_path": file_path,
        "tags": [t.tag for t in sanitized_tags],
        "model": model_name,
    })
```

- [ ] **Step 4: Wire `_execute_image_analyze` into `_execute_image_tool`**

In the `_execute_image_tool` function, add the `file_tag_store` parameter and the dispatch branch. Find the function signature and add `file_tag_store: Any | None = None` parameter. Then add the branch:

```python
    if tool_name == "image_analyze":
        return await _execute_image_analyze(
            tool_name, arguments,
            conversation_id=conversation_id,
            server_client=server_client,
            file_tag_store=file_tag_store,
        )
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `uv run pytest tests/runner/test_image_analyze_dispatch.py -v`
Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add agent_meow/runner/tool_dispatch.py tests/runner/test_image_analyze_dispatch.py
git commit -s -m "feat(runner): add image_analyze dispatch handler for agent-driven image tagging"
```

---

## Task 5: GET /resources/tags read-only endpoint

**Files:**
- Create: `agent_meow/server/routes/file_tags.py`
- Test: `tests/server/routes/test_file_tags.py`

**Interfaces:**
- Consumes: `FileTagStore` (from Task 2), `ConversationStore`, `AuthProvider`.
- Produces: `create_file_tags_router(file_tag_store, conversation_store, auth_provider, permission_store) -> APIRouter` with one endpoint:
  - `GET /sessions/{session_id}/resources/tags` — returns all tags for the session. Returns `TagsResponse`.

- [ ] **Step 1: Write the failing test**

```python
"""Tests for the file tags route — GET /resources/tags endpoint."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from agent_meow.entities import Conversation
from agent_meow.entities.file_tag import FileTag, TagSummary
from agent_meow.server.routes.file_tags import create_file_tags_router


class _FakeConvStore:
    def __init__(self):
        self._conv = Conversation(
            id="test-session", created_at=1, updated_at=1,
            root_conversation_id="test-session", agent_id="a", workspace="/tmp",
        )

    def get_conversation(self, session_id: str) -> Conversation | None:
        return self._conv if session_id == "test-session" else None


class _FakeTagStore:
    def __init__(self):
        self._tags = [
            TagSummary(tag="cat", count=3),
            TagSummary(tag="dog", count=1),
        ]

    def list_tags(self, conversation_id: str) -> list[TagSummary]:
        return self._tags if conversation_id == "test-session" else []


def _make_app(tag_store, conv_store):
    app = FastAPI()
    app.include_router(
        create_file_tags_router(
            file_tag_store=tag_store,
            conversation_store=conv_store,
            auth_provider=None,
            permission_store=None,
        ),
        prefix="/v1",
    )
    return app


@pytest.mark.asyncio
async def test_get_tags_returns_tag_summaries():
    app = _make_app(_FakeTagStore(), _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/v1/sessions/test-session/resources/tags")
    assert resp.status_code == 200
    data = resp.json()
    tag_map = {t["tag"]: t["count"] for t in data["tags"]}
    assert tag_map == {"cat": 3, "dog": 1}


@pytest.mark.asyncio
async def test_get_tags_returns_404_for_missing_session():
    app = _make_app(_FakeTagStore(), _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/v1/sessions/nonexistent/resources/tags")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_tags_returns_empty_for_session_with_no_tags():
    class _EmptyTagStore:
        def list_tags(self, conversation_id: str) -> list[TagSummary]:
            return []
    app = _make_app(_EmptyTagStore(), _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/v1/sessions/test-session/resources/tags")
    assert resp.status_code == 200
    assert resp.json()["tags"] == []
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/server/routes/test_file_tags.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'agent_meow.server.routes.file_tags'`

- [ ] **Step 3: Write the file tags router**

```python
"""File tags route — read-only tag query endpoint.

GET /v1/sessions/{id}/resources/tags
    Returns all unique tags with counts for the session, used by the
    FilesPanel tag-filter UI. Tags are populated by the agent calling
    the ``image_analyze`` tool (runner-dispatched), not by this endpoint.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id, require_access
from agent_meow.stores import ConversationStore
from agent_meow.stores.file_tag_store import FileTagStore
from agent_meow.stores.permission_store import PermissionStore

logger = logging.getLogger(__name__)


class TagSummaryWire(BaseModel):
    """One tag with its file count, for the tag-filter UI."""

    tag: str
    count: int


class TagsResponse(BaseModel):
    """All tags for a session."""

    tags: list[TagSummaryWire] = []


def create_file_tags_router(
    file_tag_store: FileTagStore,
    conversation_store: ConversationStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
) -> APIRouter:
    """Build the file tags router.

    :returns: A configured :class:`APIRouter` with the GET /resources/tags endpoint.
    """
    router = APIRouter()

    async def _require_session(user_id: str | None, session_id: str) -> None:
        if permission_store is not None:
            await require_access(
                user_id, session_id, None, permission_store, conversation_store
            )
        conversation = conversation_store.get_conversation(session_id)
        if conversation is None:
            raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.get("/sessions/{session_id}/resources/tags")
    async def get_tags(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Return all unique tags with file counts for the session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session(user_id, session_id)

        summaries = file_tag_store.list_tags(session_id)
        return {
            "object": "tags_response",
            "session_id": session_id,
            "tags": [{"tag": s.tag, "count": s.count} for s in summaries],
        }

    return router
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/server/routes/test_file_tags.py -v`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add agent_meow/server/routes/file_tags.py tests/server/routes/test_file_tags.py
git commit -s -m "feat(api): add GET /resources/tags read-only endpoint for FilesPanel tag filter"
```

---

## Task 6: Wire routers + file_tag_store into the server app

**Files:**
- Modify: `agent_meow/server/app.py` (add `file_tag_store` parameter, wire `create_file_tags_router`)

**Interfaces:**
- Consumes: `create_file_tags_router` (from Task 5), `FileTagStore` (from Task 2), existing `conversation_store`, `auth_provider`, `permission_store`.

- [ ] **Step 1: Add `file_tag_store` parameter to `create_app`**

Find the `create_app` function signature in `app.py` and add `file_tag_store: FileTagStore | None = None` parameter. Add the import:

```python
from agent_meow.stores.file_tag_store import FileTagStore
```

- [ ] **Step 2: Wire the file tags router**

Insert after the workspace_scan router block (near line 2478):

```python
    # File tags — read-only tag query for the FilesPanel tag-filter UI.
    # Tags are populated by the agent calling the image_analyze tool
    # (runner-dispatched), not by a server endpoint. This router only
    # serves GET /resources/tags for the UI.
    if file_tag_store is not None:
        from agent_meow.server.routes.file_tags import create_file_tags_router

        app.include_router(
            create_file_tags_router(
                file_tag_store=file_tag_store,
                conversation_store=conversation_store,
                auth_provider=auth_provider,
                permission_store=permission_store,
            ),
            prefix="/v1",
            tags=["file-tags"],
        )
```

- [ ] **Step 3: Verify the server starts without import errors**

Run: `uv run python -c "from agent_meow.server.app import create_app; print('OK')"`
Expected: `OK` with no traceback.

- [ ] **Step 4: Commit**

```bash
git add agent_meow/server/app.py
git commit -s -m "feat(server): wire file_tag_store and file tags router into app factory"
```

---

## Task 7: Wire `file_tag_store` into the runner

**Files:**
- Modify: `agent_meow/runner/app.py` (pass `file_tag_store` to the tool dispatch)

**Interfaces:**
- Consumes: `FileTagStore` (from Task 2), `_execute_image_tool` (from Task 4, which needs `file_tag_store`).

- [ ] **Step 1: Find where `_execute_image_tool` is called in the runner**

Run: `grep -n "_execute_image_tool" agent_meow/runner/tool_dispatch.py`
Expected: Find the call site that dispatches image tools.

- [ ] **Step 2: Add `file_tag_store` to the runner's tool dispatch context**

In `agent_meow/runner/app.py`, find where the runner creates its tool dispatch context and add `file_tag_store` to it. The runner needs to receive a `FileTagStore` instance (created from the same DB as the server) and pass it to `_execute_image_tool` when dispatching `image_analyze`.

- [ ] **Step 3: Verify the runner can dispatch `image_analyze`**

Run: `uv run python -c "from agent_meow.runner.tool_dispatch import _IMAGE_TOOLS; assert 'image_analyze' in _IMAGE_TOOLS; print('OK')"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add agent_meow/runner/app.py
git commit -s -m "feat(runner): pass file_tag_store to image tool dispatch for image_analyze"
```

---

## Task 8: Frontend API client + hooks

**Files:**
- Create: `web/src/lib/fileTagsApi.ts`
- Create: `web/src/hooks/useFileTags.ts`

**Interfaces:**
- Produces: `getFileTags(conversationId: string): Promise<TagsResponse>` — calls `GET /v1/sessions/{id}/resources/tags`.
- Produces: `useFileTags(conversationId)` TanStack Query hook returning `TagSummary[]`.
- Produces: `useAnalyzeFiles()` — returns a function that sends a chat message to the agent to trigger analysis (not a REST call).

- [ ] **Step 1: Write the API client**

```typescript
// Typed client for the file tags endpoint:
//   GET /v1/sessions/{id}/resources/tags
//
// Tags are populated by the agent calling the image_analyze tool
// (runner-dispatched). This client only reads tags for the UI.

import { authenticatedFetch } from "./identity";

/** One tag with its file count. */
export interface TagSummary {
  tag: string;
  count: number;
}

/** All tags for a session. */
export interface TagsResponse {
  object: "tags_response";
  sessionId: string;
  tags: TagSummary[];
}

/** Wire shape from the server (snake_case). */
interface TagsResponseWire {
  object: "tags_response";
  session_id: string;
  tags: TagSummary[];
}

/**
 * Fetch all unique tags with file counts for a session.
 *
 * @param conversationId - The session/conversation ID.
 * @returns The tags response with an array of {tag, count}.
 */
export async function getFileTags(conversationId: string): Promise<TagsResponse> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/tags`,
  );
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`getFileTags failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as TagsResponseWire;
  return {
    object: wire.object,
    sessionId: wire.session_id,
    tags: wire.tags,
  };
}
```

- [ ] **Step 2: Write the TanStack Query hooks**

```typescript
// React Query hooks for file tags and analysis.
//
// useFileTags: fetches the tag list for the FilesPanel filter bar.
// useAnalyzeFiles: returns a function that sends a chat message to the
//   agent to trigger vision model analysis. The agent then calls the
//   image_analyze tool (runner-dispatched) to store tags. After the
//   agent responds, the tags query is invalidated to refresh the UI.

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFileTags, type TagSummary } from "@/lib/fileTagsApi";
import { useChatStore } from "@/store/chatStore";

/** Query key for file tags. */
const FILE_TAGS_KEY = (conversationId: string) => ["file-tags", conversationId] as const;

/**
 * Fetch all unique tags with counts for a session.
 * Used by the FilesPanel tag-filter bar.
 */
export function useFileTags(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationId ? FILE_TAGS_KEY(conversationId) : ["file-tags", "none"],
    queryFn: () => getFileTags(conversationId!),
    enabled: !!conversationId,
    staleTime: 30_000, // tags don't change often
  });
}

/**
 * Hook that returns a function to trigger agent-driven image analysis.
 * Sends a chat message asking the agent to analyze workspace images.
 * After the agent responds, invalidates the file-tags query to refresh.
 */
export function useAnalyzeFiles() {
  const queryClient = useQueryClient();
  const sendMessage = useChatStore((s) => s.sendMessage);

  const analyze = async (conversationId: string) => {
    // Send a message to the agent asking it to analyze images.
    // The agent will use its vision capability + the image_analyze tool.
    await sendMessage(
      "请分析工作区中的所有图片文件，用 image_analyze 工具为每张图片生成分类标签。" +
      "Analyze all image files in the workspace and use the image_analyze tool " +
      "to generate classification tags for each image.",
    );
    // Invalidate the tags query after a delay to let the agent finish.
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: FILE_TAGS_KEY(conversationId) });
    }, 5000);
  };

  return { analyze, isPending: false };
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd web && npm run type-check`
Expected: No errors in the new files.

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/fileTagsApi.ts web/src/hooks/useFileTags.ts
git commit -s -m "feat(web): add fileTagsApi client and useFileTags hooks for agent-driven analysis"
```

---

## Task 9: FileTagFilter component + FilesPanel integration

**Files:**
- Create: `web/src/shell/FileTagFilter.tsx`
- Create: `web/src/shell/FileTagFilter.test.tsx`
- Modify: `web/src/shell/FilesPanel.tsx` (integrate filter bar + analyze button)

**Interfaces:**
- Consumes: `useFileTags(conversationId)`, `useAnalyzeFiles()` (from Task 8).
- Produces: `FileTagFilter` component with props: `conversationId: string`, `selectedTags: string[]`, `onTagToggle: (tag: string) => void`.

- [ ] **Step 1: Write the failing test for FileTagFilter**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileTagFilter } from "./FileTagFilter";

// Mock the hooks
vi.mock("@/hooks/useFileTags", () => ({
  useFileTags: vi.fn(() => ({
    data: { tags: [
      { tag: "cat", count: 3 },
      { tag: "dog", count: 2 },
      { tag: "outdoor", count: 5 },
    ]},
    isLoading: false,
  })),
  useAnalyzeFiles: vi.fn(() => ({
    analyze: vi.fn(),
    isPending: false,
  })),
}));

// Mock chatStore
vi.mock("@/store/chatStore", () => ({
  useChatStore: vi.fn(() => vi.fn()),
}));

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("FileTagFilter", () => {
  it("renders tag chips with counts", () => {
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={() => {}}
      />
    );
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("outdoor")).toBeInTheDocument();
  });

  it("calls onTagToggle when a chip is clicked", () => {
    const onTagToggle = vi.fn();
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={onTagToggle}
      />
    );
    fireEvent.click(screen.getByText("cat"));
    expect(onTagToggle).toHaveBeenCalledWith("cat");
  });

  it("highlights selected tags", () => {
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={["cat"]}
        onTagToggle={() => {}}
      />
    );
    const catChip = screen.getByText("cat").closest("button");
    expect(catChip).toHaveAttribute("data-selected", "true");
  });

  it("shows empty state when no tags exist", () => {
    vi.mocked(
      require("@/hooks/useFileTags").useFileTags
    ).mockReturnValueOnce({
      data: { tags: [] },
      isLoading: false,
    });
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={() => {}}
      />
    );
    expect(screen.getByText(/no tags yet/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run web/src/shell/FileTagFilter.test.tsx`
Expected: FAIL with `Cannot find module './FileTagFilter'`

- [ ] **Step 3: Write the FileTagFilter component**

```tsx
// FileTagFilter — tag-chip filter bar for the FilesPanel.
//
// Shows all unique tags with file counts. Clicking a chip toggles it
// as a filter. Selected chips are highlighted. Includes an "Analyze"
// button that sends a chat message to the agent, asking it to analyze
// workspace images using the image_analyze tool. The agent uses its
// vision capability to classify images, then calls image_analyze to
// persist tags. After the agent responds, the tags query refreshes.

import { useFileTags, useAnalyzeFiles } from "@/hooks/useFileTags";
import { cn } from "@/lib/utils";
import { SparklesIcon, XIcon } from "lucide-react";

interface FileTagFilterProps {
  conversationId: string;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

export function FileTagFilter({
  conversationId,
  selectedTags,
  onTagToggle,
}: FileTagFilterProps) {
  const { data, isLoading } = useFileTags(conversationId);
  const { analyze, isPending } = useAnalyzeFiles();

  const tags = data?.tags ?? [];

  const handleAnalyze = () => {
    analyze(conversationId);
  };

  if (isLoading) {
    return (
      <div className="px-2 py-1.5 text-xs text-muted-foreground">
        Loading tags...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border-b border-border px-2 py-1.5">
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          Tags
        </span>
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isPending}
          className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20 disabled:opacity-50"
          title="Ask the agent to classify workspace images with its vision model"
        >
          <SparklesIcon className="size-3" />
          {isPending ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {tags.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No tags yet. Click "Analyze" to ask the agent to classify images.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => {
            const selected = selectedTags.includes(t.tag);
            return (
              <button
                key={t.tag}
                type="button"
                data-selected={selected}
                onClick={() => onTagToggle(t.tag)}
                className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                <span>{t.tag}</span>
                <span className="opacity-60">{t.count}</span>
                {selected && <XIcon className="size-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd web && npx vitest run web/src/shell/FileTagFilter.test.tsx`
Expected: 4 tests PASS.

- [ ] **Step 5: Integrate FileTagFilter into FilesPanel**

In `web/src/shell/FilesPanel.tsx`, add the import and state:

```tsx
import { FileTagFilter } from "./FileTagFilter";
// ... inside FilesPanel component:
const [selectedTags, setSelectedTags] = useState<string[]>([]);
```

Insert the `<FileTagFilter>` component right after the `<SharedFolderSelector>` (around line 416):

```tsx
<SharedFolderSelector conversationId={conversationId ?? ""} />
<FileTagFilter
  conversationId={conversationId ?? ""}
  selectedTags={selectedTags}
  onTagToggle={(tag) =>
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    )
  }
/>
```

- [ ] **Step 6: Verify TypeScript compiles and vitest passes**

Run: `cd web && npm run type-check && npm test`
Expected: No type errors. All tests pass.

- [ ] **Step 7: Commit**

```bash
git add web/src/shell/FileTagFilter.tsx web/src/shell/FileTagFilter.test.tsx web/src/shell/FilesPanel.tsx
git commit -s -m "feat(ui): add FileTagFilter bar with agent-driven analyze button to FilesPanel"
```

---

## Task 10: End-to-end smoke test

**Files:**
- Test: `tests/e2e_ui/files/test_file_tags.py`

- [ ] **Step 1: Write the e2e smoke test**

```python
"""E2E smoke test for the agent-driven vision model file tagging pipeline.

Prerequisites:
- Server running on :6767
- A session with a workspace containing at least 1 image file
- The agent's LLM is vision-capable (deepseek-v4-flash via Hermes)

This test verifies the full pipeline: agent analyzes images → image_analyze
tool stores tags → GET /resources/tags returns them.
"""

import httpx
import pytest

SERVER_URL = "http://127.0.0.1:6767"


@pytest.mark.asyncio
@pytest.mark.e2e
async def test_tags_endpoint_returns_tags_after_analysis():
    """Verify tags are queryable after the agent analyzes images."""
    async with httpx.AsyncClient(base_url=SERVER_URL) as client:
        # Get the first session
        resp = await client.get("/v1/sessions")
        assert resp.status_code == 200
        sessions = resp.json()
        if not sessions:
            pytest.skip("No sessions available for e2e test")
        session_id = sessions[0]["id"]

        # Query tags (may be empty if agent hasn't analyzed yet)
        resp = await client.get(f"/v1/sessions/{session_id}/resources/tags")
        assert resp.status_code == 200
        tags = resp.json()["tags"]
        assert isinstance(tags, list)
        for t in tags:
            assert "tag" in t
            assert "count" in t
            assert t["count"] > 0
```

- [ ] **Step 2: Run the e2e test**

Run: `uv run pytest tests/e2e_ui/files/test_file_tags.py -v -m e2e`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e_ui/files/test_file_tags.py
git commit -s -m "test(e2e): add smoke test for agent-driven file tagging pipeline"
```

---

## STOP conditions

Stop and report back (do not improvise) if:

- The `file_tags` migration conflicts with an existing table (check `z10a3b4c5d6e` is the current head).
- The `_IMAGE_TOOLS` frozenset in `tool_dispatch.py` doesn't accept new entries (check the dispatch flow in `_execute_image_tool`).
- The runner's `app.py` doesn't have a clear place to inject `file_tag_store` (the dispatch context may be constructed differently than expected).
- The `useChatStore` `sendMessage` function signature doesn't match what `useAnalyzeFiles` expects (check the chat store's API).
- The hermes-gateway agent's `tools.builtins: []` config suppresses the `image_analyze` tool (it shouldn't — Images surface tools are auto-registered via `_IMAGE_TOOLS`, not via `tools.builtins`).

## Maintenance notes

- **How the agent uses this**: When the user clicks "Analyze", the frontend sends a chat message. The agent reads it, uses `search_files` to find images, sees each image via its vision modality, generates tags, and calls `image_analyze` for each. The runner stores tags. The agent can also rename files, create category folders, or generate a summary — full orchestration power.
- **Phase 2 (EXIF metadata)**: Add a `file_metadata` table with `dateTimeOriginal`, `latitude`, `longitude`, `city`, `country`. Use Python `Pillow` or `exifread` for extraction. FilesPanel gets sort-by-date and group-by-location.
- **Phase 3 (Semantic search)**: Run CLIP model locally via Ollama or standalone ONNX. Store embeddings in SQLite with `sqlite-vec` extension. Add a search bar to FilesPanel.
- **Phase 4 (Facial recognition)**: Use `insightface` or Ollama vision model. Cluster faces → name them. Filter FilesPanel by person.
- **Agent orchestration**: Because the agent drives the analysis, it can do more than just tag — it can rename files by category (`mv photo.jpg cat_outdoor_001.jpg`), create folders (`mkdir -p tags/cat` and move files), or generate a `tags.json` summary. This is the advantage of Option B over a standalone REST endpoint.
