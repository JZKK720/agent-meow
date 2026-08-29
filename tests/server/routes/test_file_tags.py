"""Tests for the file tags route — GET /resources/tags endpoint."""

from __future__ import annotations

from typing import Any
from unittest.mock import MagicMock

import pytest
from fastapi import FastAPI
from starlette.responses import JSONResponse
from httpx import ASGITransport, AsyncClient

from agent_meow.entities import Conversation
from agent_meow.entities.file_tag import FileTag, TagSummary
from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.routes.file_tags import create_file_tags_router


def _register_error_handler(app: FastAPI) -> None:
    """Register the AgentMeowError handler so tests get proper HTTP status codes."""

    @app.exception_handler(AgentMeowError)
    async def _handle_error(request: Any, exc: AgentMeowError) -> JSONResponse:
        status_map = {
            ErrorCode.NOT_FOUND: 404,
            ErrorCode.INVALID_INPUT: 400,
            ErrorCode.INTERNAL_ERROR: 500,
        }
        status = status_map.get(exc.code, 500)
        return JSONResponse(
            status_code=status,
            content={"error": {"code": exc.code, "message": exc.message}},
        )


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
    _register_error_handler(app)
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
