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
        name="lemonade",
        pid=12345,
        port=13305,
        state="running",
        uptime_s=120.0,
        restart_count=0,
        last_error=None,
    )
    assert status.name == "lemonade"
    assert status.state == "running"
    assert status.restart_count == 0
    assert status.as_dict()["name"] == "lemonade"


def test_supervisor_initial_state_is_unconfigured() -> None:
    sup = ServiceSupervisor()
    statuses = sup.status()
    assert len(statuses) == 3
    assert all(s.state == "unconfigured" for s in statuses)


def test_supervisor_names() -> None:
    sup = ServiceSupervisor()
    names = {s.name for s in sup.status()}
    assert names == {"lemonade", "tts_server", "tts_wrapper"}


@pytest.mark.asyncio
async def test_supervisor_start_spawns_configured_services(tmp_path) -> None:
    """When the lemonade exe exists and env vars are set, start() spawns all."""
    tts_exe = tmp_path / "tts-server.exe"
    tts_exe.write_bytes(b"\x4d\x5a")  # minimal MZ header
    lemon_exe = tmp_path / "lemond.exe"
    lemon_exe.write_bytes(b"\x4d\x5a")  # minimal MZ header

    with patch.dict(
        os.environ,
        {
            "LEMONADE_STT_URL": "http://127.0.0.1:13305",
            "QWEN_TTS_URL": "http://127.0.0.1:8890",
        },
    ):
        sup = ServiceSupervisor(
            lemonade_exe=str(lemon_exe),
            tts_server_exe=str(tts_exe),
            tts_wrapper_python="python",
        )
        with patch.object(sup, "_spawn_lemonade", new_callable=AsyncMock) as mock_lemon, patch.object(
            sup, "_spawn_tts", new_callable=AsyncMock
        ) as mock_tts:
            await sup.start()
            mock_lemon.assert_called_once()
            mock_tts.assert_called_once()


@pytest.mark.asyncio
async def test_supervisor_start_skips_unconfigured(tmp_path) -> None:
    """When the lemonade exe is not found, start() does not spawn it."""
    with patch.dict(os.environ, {}, clear=True):
        sup = ServiceSupervisor(lemonade_exe=str(tmp_path / "nonexistent.exe"))
        with patch.object(sup, "_spawn_lemonade", new_callable=AsyncMock) as mock_lemon, patch.object(
            sup, "_spawn_tts", new_callable=AsyncMock
        ) as mock_tts:
            await sup.start()
            mock_lemon.assert_not_called()
            mock_tts.assert_not_called()


@pytest.mark.asyncio
async def test_supervisor_start_spawns_lemonade_when_exe_found(tmp_path) -> None:
    """When the lemonade exe exists on disk, start() spawns it."""
    lemon_exe = tmp_path / "lemond.exe"
    lemon_exe.write_bytes(b"\x4d\x5a")
    with patch.dict(os.environ, {"LEMONADE_STT_URL": "http://127.0.0.1:13305"}):
        sup = ServiceSupervisor(lemonade_exe=str(lemon_exe))
        with patch.object(sup, "_spawn_lemonade", new_callable=AsyncMock) as mock_lemon:
            await sup.start()
            mock_lemon.assert_called_once()


@pytest.mark.asyncio
async def test_supervisor_start_skips_when_no_exe_and_no_env(tmp_path) -> None:
    """When no lemonade exe is resolved and no env override, start() does nothing."""
    with patch.dict(os.environ, {}, clear=True):
        sup = ServiceSupervisor(lemonade_exe=None)
        with patch.object(sup, "_spawn_lemonade", new_callable=AsyncMock) as mock_lemon:
            await sup.start()
            mock_lemon.assert_not_called()
            assert sup._services["lemonade"].state == "unconfigured"


@pytest.mark.asyncio
async def test_supervisor_restart_on_crash_increments_count(tmp_path) -> None:
    """When a child exits unexpectedly, restart_count increments."""
    lemon_exe = tmp_path / "lemond.exe"
    lemon_exe.write_bytes(b"\x4d\x5a")
    with patch.dict(os.environ, {"LEMONADE_STT_URL": "http://127.0.0.1:13305"}):
        sup = ServiceSupervisor(lemonade_exe=str(lemon_exe))
        # Simulate a crash: child exits with code 1
        # Patch the sleep so the test doesn't wait
        with patch("agent_meow.server.service_supervisor.asyncio.sleep", new_callable=AsyncMock):
            with patch.object(sup, "_spawn_lemonade", new_callable=AsyncMock):
                await sup._on_child_exit("lemonade", exit_code=1)
                assert sup._services["lemonade"].restart_count == 1
                assert sup._services["lemonade"].state in ("restarting", "running")


@pytest.mark.asyncio
async def test_supervisor_degraded_after_max_restarts(tmp_path) -> None:
    """After 3 failed restart attempts, service is marked degraded."""
    lemon_exe = tmp_path / "lemond.exe"
    lemon_exe.write_bytes(b"\x4d\x5a")
    with patch.dict(os.environ, {"LEMONADE_STT_URL": "http://127.0.0.1:13305"}):
        sup = ServiceSupervisor(lemonade_exe=str(lemon_exe))
        handle = sup._services["lemonade"]
        handle.restart_count = 3  # already at max
        with patch("agent_meow.server.service_supervisor.asyncio.sleep", new_callable=AsyncMock):
            await sup._on_child_exit("lemonade", exit_code=1)
            assert handle.restart_count == 4
            assert handle.state == "degraded"


@pytest.mark.asyncio
async def test_supervisor_stop_terminates_children() -> None:
    """stop() terminates running children and marks them stopped."""
    sup = ServiceSupervisor()
    handle = sup._services["lemonade"]
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
    handle = sup._services["lemonade"]
    original_count = handle.restart_count
    await sup._on_child_exit("lemonade", exit_code=1)
    assert handle.restart_count == original_count
