"""Tests for the file index route — GET /resources/file-index endpoint (plan 039 P0)."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from starlette.responses import JSONResponse

from agent_meow.entities import Conversation
from agent_meow.entities.file_index import KIND_IMAGE, STATUS_INDEXED, classify_kind
from agent_meow.errors import AgentMeowError, ErrorCode
from agent_meow.server.routes.file_index import create_file_index_router
from agent_meow.stores.file_index_store.sqlalchemy_store import SqlAlchemyFileIndexStore

_WS = "/tmp/ws"


def _register_error_handler(app: FastAPI) -> None:
    @app.exception_handler(AgentMeowError)
    async def _handle_error(request: Any, exc: AgentMeowError) -> JSONResponse:
        status_map = {
            ErrorCode.NOT_FOUND: 404,
            ErrorCode.INVALID_INPUT: 400,
            ErrorCode.INTERNAL_ERROR: 500,
        }
        return JSONResponse(
            status_code=status_map.get(exc.code, 500),
            content={"error": {"code": exc.code, "message": exc.message}},
        )


class _FakeConvStore:
    def __init__(self, workspace: str | None = _WS):
        self._conv = Conversation(
            id="sess1",
            created_at=1,
            updated_at=1,
            root_conversation_id="sess1",
            agent_id="a",
            workspace=workspace,
        )

    def get_conversation(self, session_id: str) -> Conversation | None:
        return self._conv if session_id == "sess1" else None


def _make_store(tmp_path: Path) -> SqlAlchemyFileIndexStore:
    # tmp_path (not TemporaryDirectory) — the SQLAlchemy engine holds the
    # SQLite file open past the test body, so an auto-cleanup context
    # manager would hit a Windows PermissionError on rmtree.
    return SqlAlchemyFileIndexStore(f"sqlite:///{tmp_path / 'idx.db'}")


def _seed(store: SqlAlchemyFileIndexStore) -> None:
    fid = store.upsert_pending(
        host_id="",
        workspace=_WS,
        path=f"{_WS}/a.jpg",
        kind=KIND_IMAGE,
        size=10,
        mtime_ns=1,
    )
    store.claim_pending()
    store.mark_indexed(
        fid, content_hash="abc", meta={"camera_make": "Canon"}, thumb_path=None
    )


def _make_app(store: SqlAlchemyFileIndexStore, conv_store: _FakeConvStore) -> FastAPI:
    app = FastAPI()
    _register_error_handler(app)
    app.include_router(
        create_file_index_router(
            file_index_store=store,
            conversation_store=conv_store,
            auth_provider=None,
            permission_store=None,
        ),
        prefix="/v1",
    )
    return app


@pytest.mark.asyncio
async def test_get_file_index_returns_files_and_counts(tmp_path: Path):
    store = _make_store(tmp_path)
    _seed(store)
    app = _make_app(store, _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        resp = await c.get("/v1/sessions/sess1/resources/file-index")
    assert resp.status_code == 200
    data = resp.json()
    assert data["workspace"] == _WS
    assert data["counts"].get(STATUS_INDEXED) == 1
    assert len(data["files"]) == 1
    assert data["files"][0]["meta"]["camera_make"] == "Canon"


@pytest.mark.asyncio
async def test_get_file_index_filters_by_kind(tmp_path: Path):
    store = _make_store(tmp_path)
    _seed(store)
    store.upsert_pending(
        host_id="",
        workspace=_WS,
        path=f"{_WS}/r.pdf",
        kind=classify_kind("r.pdf"),
        size=5,
        mtime_ns=1,
    )
    app = _make_app(store, _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        resp = await c.get("/v1/sessions/sess1/resources/file-index?kind=image")
    assert resp.status_code == 200
    assert [f["kind"] for f in resp.json()["files"]] == ["image"]


@pytest.mark.asyncio
async def test_get_file_index_404_for_missing_session(tmp_path: Path):
    store = _make_store(tmp_path)
    app = _make_app(store, _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        resp = await c.get("/v1/sessions/nope/resources/file-index")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_file_index_empty_when_workspace_unbound(tmp_path: Path):
    store = _make_store(tmp_path)
    app = _make_app(store, _FakeConvStore(workspace=None))
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        resp = await c.get("/v1/sessions/sess1/resources/file-index")
    assert resp.status_code == 200
    assert resp.json()["files"] == []
    assert resp.json()["workspace"] is None


@pytest.mark.asyncio
async def test_stats_endpoint_returns_counts(tmp_path: Path):
    store = _make_store(tmp_path)
    _seed(store)
    app = _make_app(store, _FakeConvStore())
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://t") as c:
        resp = await c.get("/v1/sessions/sess1/resources/file-index/stats")
    assert resp.status_code == 200
    assert resp.json()["counts"].get(STATUS_INDEXED) == 1
