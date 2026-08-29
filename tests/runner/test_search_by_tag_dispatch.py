"""Tests for the search_by_tag runner dispatch handler."""

import json

import pytest

from agent_meow.entities.file_tag import FileTag
from agent_meow.runner.tool_dispatch import _execute_search_by_tag


class _FakeTagStore:
    def __init__(self, tags=None):
        self._tags = tags or []

    def list_for_conversation(self, conversation_id):
        return [t for t in self._tags if t.conversation_id == conversation_id]


@pytest.mark.asyncio
async def test_search_by_tag_returns_matching_files():
    store = _FakeTagStore(
        tags=[
            FileTag(
                id="1",
                conversation_id="c1",
                file_path="/a.png",
                tag="cat",
                confidence=0.9,
                description="A cat",
                model="m",
                analyzed_at=1,
            ),
            FileTag(
                id="2",
                conversation_id="c1",
                file_path="/b.png",
                tag="dog",
                confidence=0.8,
                description=None,
                model="m",
                analyzed_at=1,
            ),
            FileTag(
                id="3",
                conversation_id="c1",
                file_path="/c.png",
                tag="cat",
                confidence=0.7,
                description=None,
                model="m",
                analyzed_at=1,
            ),
        ]
    )
    result = await _execute_search_by_tag(
        "search_by_tag",
        json.dumps({"session_id": "c1", "tag": "cat"}),
        conversation_id="c1",
        server_client=None,
        file_tag_store=store,
    )
    data = json.loads(result)
    assert data["count"] == 2
    assert all(f["tag"] == "cat" for f in data["files"])


@pytest.mark.asyncio
async def test_search_by_tag_returns_empty_for_no_match():
    store = _FakeTagStore()
    result = await _execute_search_by_tag(
        "search_by_tag",
        json.dumps({"session_id": "c1", "tag": "cat"}),
        conversation_id="c1",
        server_client=None,
        file_tag_store=store,
    )
    data = json.loads(result)
    assert data["count"] == 0
    assert data["files"] == []


@pytest.mark.asyncio
async def test_search_by_tag_returns_error_without_store():
    result = await _execute_search_by_tag(
        "search_by_tag",
        json.dumps({"tag": "cat"}),
        conversation_id="c1",
        server_client=None,
        file_tag_store=None,
    )
    data = json.loads(result)
    assert "error" in data
