"""Unit tests for the voice service supervisor."""

from __future__ import annotations

import os
from unittest.mock import AsyncMock, patch

import pytest

from agent_meow.server.service_supervisor import (
    ServiceStatus,
    ServiceSupervisor,
)


def test_service_status_dataclass() -> None:
    status = ServiceStatus(
        name="tts_server",
        pid=12345,
        port=8891,
        state="running",
        uptime_s=120.0,
        restart_count=0,
        last_error=None,
    )
    assert status.name == "tts_server"
    assert status.state == "running"
    assert status.restart_count == 0
    assert status.as_dict()["name"] == "tts_server"


def test_supervisor_initial_state_is_unconfigured() -> None:
    sup = ServiceSupervisor()
    statuses = sup.status()
    assert len(statuses) == 3
    assert all(s.state == "unconfigured" for s in statuses)


def test_supervisor_names() -> None:
    sup = ServiceSupervisor()
    names = {s.name for s in sup.status()}
    assert names == {"whisper_server", "tts_server", "tts_wrapper"}


@pytest.mark.asyncio
async def test_supervisor_start_spawns_configured_services(tmp_path) -> None:
    """When env vars are set, start() spawns the configured services."""
    tts_exe = tmp_path / "tts-server.exe"
    tts_exe.write_bytes(b"\x4d\x5a")  # minimal MZ header
    tts_model = tmp_path / "qwen-talker.gguf"
    tts_model.write_bytes(b"\x47\x47\x55\x46")  # minimal GGUF magic
    tts_codec = tmp_path / "qwen-tokenizer.gguf"
    tts_codec.write_bytes(b"\x47\x47\x55\x46")

    with patch.dict(
        os.environ,
        {
            "QWEN_TTS_URL": "http://127.0.0.1:8890",
        },
    ):
        sup = ServiceSupervisor(
            tts_server_exe=str(tts_exe),
            tts_server_model=str(tts_model),
            tts_server_codec=str(tts_codec),
            tts_wrapper_python="python",
        )
        with patch.object(
            sup, "_spawn_tts", new_callable=AsyncMock
        ) as mock_tts:
            await sup.start()
            mock_tts.assert_called_once()


@pytest.mark.asyncio
async def test_supervisor_start_skips_unconfigured() -> None:
    """When env vars are not set, start() does nothing."""
    with patch.dict(os.environ, {}, clear=True):
        sup = ServiceSupervisor()
        with patch.object(
            sup, "_spawn_tts", new_callable=AsyncMock
        ) as mock_tts:
            await sup.start()
            mock_tts.assert_not_called()


@pytest.mark.asyncio
async def test_supervisor_restart_on_crash_increments_count() -> None:
    """When a child exits unexpectedly, restart_count increments."""
    with patch.dict(os.environ, {"QWEN_TTS_URL": "http://127.0.0.1:8890"}):
        sup = ServiceSupervisor()
        # Simulate a crash: child exits with code 1
        # Patch the sleep so the test doesn't wait
        with patch("agent_meow.server.service_supervisor.asyncio.sleep", new_callable=AsyncMock):
            with patch.object(sup, "_spawn_tts_server", new_callable=AsyncMock):
                await sup._on_child_exit("tts_server", exit_code=1)
                assert sup._services["tts_server"].restart_count == 1
                assert sup._services["tts_server"].state in ("restarting", "running")


@pytest.mark.asyncio
async def test_supervisor_degraded_after_max_restarts() -> None:
    """After 3 failed restart attempts, service is marked degraded."""
    with patch.dict(os.environ, {"QWEN_TTS_URL": "http://127.0.0.1:8890"}):
        sup = ServiceSupervisor()
        handle = sup._services["tts_server"]
        handle.restart_count = 3  # already at max
        with patch("agent_meow.server.service_supervisor.asyncio.sleep", new_callable=AsyncMock):
            await sup._on_child_exit("tts_server", exit_code=1)
            assert handle.restart_count == 4
            assert handle.state == "degraded"


@pytest.mark.asyncio
async def test_supervisor_stop_terminates_children() -> None:
    """stop() terminates running children and marks them stopped."""
    sup = ServiceSupervisor()
    handle = sup._services["tts_server"]
    # Mock a running process
    from unittest.mock import MagicMock

    mock_proc = MagicMock()
    mock_proc.poll.return_value = None  # still running
    mock_proc.pid = 12345
    handle.process = mock_proc
    handle.state = "running"

    await sup.stop()
    mock_proc.terminate.assert_called_once()
    assert handle.state == "stopped"
    assert sup._stopped is True


@pytest.mark.asyncio
async def test_supervisor_stop_does_not_restart_after_stop() -> None:
    """After stop(), _on_child_exit does not trigger a restart."""
    sup = ServiceSupervisor()
    await sup.stop()
    handle = sup._services["tts_server"]
    original_count = handle.restart_count
    await sup._on_child_exit("tts_server", exit_code=1)
    assert handle.restart_count == original_count
