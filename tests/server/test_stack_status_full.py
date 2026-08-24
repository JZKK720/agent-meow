"""Verify stack_status includes TTS and supervisor process metrics."""

from __future__ import annotations

import os
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest


@pytest.mark.asyncio
async def test_check_tts_unconfigured_when_url_not_set() -> None:
    """_check_tts returns unconfigured when QWEN_TTS_URL is not set."""
    from agent_meow.server.stack_status import _check_tts

    with patch.dict(os.environ, {}, clear=True):
        client = MagicMock(spec=httpx.AsyncClient)
        result = await _check_tts(client)
        assert result["status"] == "unconfigured"


@pytest.mark.asyncio
async def test_check_tts_ok_when_responding() -> None:
    """_check_tts returns ok when the TTS health endpoint responds 200."""
    from agent_meow.server.stack_status import _check_tts

    with patch.dict(os.environ, {"QWEN_TTS_URL": "http://127.0.0.1:8890"}):
        client = MagicMock(spec=httpx.AsyncClient)
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        client.get = AsyncMock(return_value=mock_resp)
        result = await _check_tts(client)
        assert result["status"] == "ok"


@pytest.mark.asyncio
async def test_check_tts_down_on_connection_error() -> None:
    """_check_tts returns down when the TTS server is unreachable."""
    from agent_meow.server.stack_status import _check_tts

    with patch.dict(os.environ, {"QWEN_TTS_URL": "http://127.0.0.1:8890"}):
        client = MagicMock(spec=httpx.AsyncClient)
        client.get = AsyncMock(side_effect=httpx.ConnectError("refused"))
        result = await _check_tts(client)
        assert result["status"] == "down"


def test_get_service_supervisor_status_empty_when_no_supervisor() -> None:
    """_get_service_supervisor_status returns [] when no supervisor is active."""
    from agent_meow.server.app import _get_service_supervisor_status

    with patch("agent_meow.server.app._active_service_supervisor", None):
        result = _get_service_supervisor_status()
        assert result == []


def test_get_service_supervisor_status_returns_metrics() -> None:
    """_get_service_supervisor_status returns metrics when supervisor is active."""
    from agent_meow.server.app import _get_service_supervisor_status
    from agent_meow.server.service_supervisor import ServiceSupervisor

    sup = ServiceSupervisor()
    with patch("agent_meow.server.app._active_service_supervisor", sup):
        result = _get_service_supervisor_status()
        assert len(result) == 4
        assert all("name" in s for s in result)
        assert all("state" in s for s in result)
