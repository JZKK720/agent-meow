"""Tests for the POST /v1/services/restart/{name} endpoint."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from agent_meow.server.stack_status import router


def _make_app() -> FastAPI:
    app = FastAPI()
    app.include_router(router)
    return app


def test_restart_unknown_service_returns_error() -> None:
    """Restarting an unknown service name returns ok=false."""
    app = _make_app()
    client = TestClient(app)
    resp = client.post("/v1/services/restart/unknown")
    assert resp.status_code == 200
    data = resp.json()
    assert data["ok"] is False
    assert "unknown" in data["error"]


def test_restart_without_supervisor_returns_error() -> None:
    """Restarting when no supervisor is active returns ok=false."""
    app = _make_app()
    client = TestClient(app)
    with patch("agent_meow.server.app._active_service_supervisor", None):
        resp = client.post("/v1/services/restart/tts_server")
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is False
        assert "not active" in data["error"]


def test_restart_tts_server_calls_spawn_tts() -> None:
    """Restarting tts_server terminates the old process and calls _spawn_tts."""
    app = _make_app()
    client = TestClient(app)

    mock_sup = MagicMock()
    mock_sup._spawn_tts = AsyncMock()

    # Mock a running process
    mock_proc = MagicMock()
    mock_proc.poll.return_value = None  # still running
    mock_proc.pid = 12345
    mock_sup._services = {
        "tts_server": MagicMock(
            process=mock_proc,
            restart_count=3,
            state="degraded",
        ),
    }

    with patch("agent_meow.server.app._active_service_supervisor", mock_sup):
        resp = client.post("/v1/services/restart/tts_server")
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        assert data["name"] == "tts_server"
        mock_proc.terminate.assert_called_once()
        mock_sup._spawn_tts.assert_called_once()


def test_restart_tts_server_calls_spawn_tts_no_process() -> None:
    """Restarting tts_server calls _spawn_tts."""
    app = _make_app()
    client = TestClient(app)

    mock_sup = MagicMock()
    mock_sup._spawn_tts = AsyncMock()

    mock_sup._services = {
        "tts_server": MagicMock(
            process=None,
            restart_count=3,
            state="degraded",
        ),
    }

    with patch("agent_meow.server.app._active_service_supervisor", mock_sup):
        resp = client.post("/v1/services/restart/tts_server")
        assert resp.status_code == 200
        data = resp.json()
        assert data["ok"] is True
        mock_sup._spawn_tts.assert_called_once()
