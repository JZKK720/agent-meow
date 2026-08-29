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
