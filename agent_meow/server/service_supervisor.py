"""Layer 2 voice service supervisor.

Spawns and supervises Lemonade STT (:13305) and tts-server.exe (:8891) +
qwentts_wrapper (:8890) as child processes. Event-driven crash detection
via subprocess exit callbacks — instant restart, no polling.

Restart policy: 3 attempts with backoff (5s, 10s, 30s). After 3 failed
attempts, marks the service as "degraded" and stops retrying. The
watchdog (Layer 1) and monitoring dashboard pick up the degraded state
via :meth:`ServiceSupervisor.status`.

Extends the ``SERVER_LOCAL_HOST.md`` pattern: the server lifespan spawns
supervised children, same as it spawns the host daemon.
"""

from __future__ import annotations

import asyncio
import logging
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Any

_logger = logging.getLogger(__name__)

# Backoff schedule: 3 attempts, increasing delay.
_BACKOFF_SCHEDULE_S: tuple[float, ...] = (5.0, 10.0, 30.0)
_MAX_RESTART_ATTEMPTS = len(_BACKOFF_SCHEDULE_S)

# Windows: create no console window for child processes.
# 0x08000000 = CREATE_NO_WINDOW
_NO_WINDOW = 0x08000000


@dataclass
class ServiceStatus:
    """Health status of one supervised service."""

    name: str
    pid: int | None
    port: int
    state: str  # "running" | "starting" | "restarting" | "degraded" | "unconfigured" | "stopped"
    uptime_s: float
    restart_count: int
    last_error: str | None = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "pid": self.pid,
            "port": self.port,
            "state": self.state,
            "uptime_s": round(self.uptime_s, 1),
            "restart_count": self.restart_count,
            "last_error": self.last_error,
        }


@dataclass
class _ServiceHandle:
    """Internal handle for a supervised child process."""

    name: str
    process: subprocess.Popen[bytes] | None = None
    port: int = 0
    start_time: float = 0.0
    restart_count: int = 0
    state: str = "unconfigured"
    last_error: str | None = None


class ServiceSupervisor:
    """Supervises voice service child processes.

    Call :meth:`start` from the server lifespan, :meth:`stop` on shutdown.
    """

    def __init__(
        self,
        *,
        lemonade_python: str | None = None,
        tts_server_exe: str | None = None,
        tts_wrapper_python: str | None = None,
    ) -> None:
        self._lemonade_python = lemonade_python or sys.executable
        self._tts_server_exe = tts_server_exe
        self._tts_wrapper_python = tts_wrapper_python or sys.executable
        self._services: dict[str, _ServiceHandle] = {
            "lemonade": _ServiceHandle(name="lemonade", port=13305),
            "tts_server": _ServiceHandle(name="tts_server", port=8891),
            "tts_wrapper": _ServiceHandle(name="tts_wrapper", port=8890),
        }
        self._stopped = False

    def _is_configured(self) -> dict[str, bool]:
        """Check which services have their prerequisites set."""
        return {
            "lemonade": bool(os.environ.get("LEMONADE_STT_URL", "").strip()),
            "tts_server": self._tts_server_exe is not None
            and os.path.exists(self._tts_server_exe),
            "tts_wrapper": bool(os.environ.get("QWEN_TTS_URL", "").strip()),
        }

    async def start(self) -> None:
        """Spawn all configured voice services."""
        self._stopped = False
        configured = self._is_configured()
        if configured["lemonade"]:
            await self._spawn_lemonade()
        if configured["tts_server"]:
            await self._spawn_tts()

    async def _spawn_lemonade(self) -> None:
        """Start the Lemonade STT server."""
        handle = self._services["lemonade"]
        handle.state = "starting"
        try:
            handle.process = subprocess.Popen(
                [self._lemonade_python, "-m", "lemonade.server", "--port", "13305"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                creationflags=_NO_WINDOW,
            )
            handle.start_time = time.monotonic()
            handle.state = "running"
            handle.last_error = None
            _logger.info("Lemonade STT started (pid=%s, port=13305)", handle.process.pid)
        except Exception as exc:
            handle.state = "degraded"
            handle.last_error = str(exc)
            _logger.error("Failed to start Lemonade: %s", exc)

    async def _spawn_tts(self) -> None:
        """Start tts-server.exe and the qwentts wrapper."""
        if not self._tts_server_exe:
            return
        tts_handle = self._services["tts_server"]
        wrapper_handle = self._services["tts_wrapper"]

        # Start tts-server.exe (native C++ Vulkan binary)
        tts_handle.state = "starting"
        try:
            tts_handle.process = subprocess.Popen(
                [self._tts_server_exe, "--port", "8891"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                creationflags=_NO_WINDOW,
            )
            tts_handle.start_time = time.monotonic()
            tts_handle.state = "running"
            _logger.info("tts-server.exe started (pid=%s, port=8891)", tts_handle.process.pid)
        except Exception as exc:
            tts_handle.state = "degraded"
            tts_handle.last_error = str(exc)
            _logger.error("Failed to start tts-server: %s", exc)
            return

        # Start the qwentts wrapper (Python FastAPI)
        wrapper_handle.state = "starting"
        try:
            wrapper_handle.process = subprocess.Popen(
                [
                    self._tts_wrapper_python,
                    "-m",
                    "uvicorn",
                    "scripts.qwentts_wrapper:app",
                    "--port",
                    "8890",
                    "--host",
                    "127.0.0.1",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                creationflags=_NO_WINDOW,
            )
            wrapper_handle.start_time = time.monotonic()
            wrapper_handle.state = "running"
            _logger.info("qwentts wrapper started (pid=%s, port=8890)", wrapper_handle.process.pid)
        except Exception as exc:
            wrapper_handle.state = "degraded"
            wrapper_handle.last_error = str(exc)
            _logger.error("Failed to start qwentts wrapper: %s", exc)

    async def _on_child_exit(self, name: str, exit_code: int) -> None:
        """Called when a supervised child exits. Restarts with backoff."""
        if self._stopped:
            return
        handle = self._services.get(name)
        if not handle:
            return
        handle.process = None
        if exit_code == 0:
            handle.state = "stopped"
            return

        handle.restart_count += 1
        if handle.restart_count > _MAX_RESTART_ATTEMPTS:
            handle.state = "degraded"
            handle.last_error = f"Exited with code {exit_code}; max restarts exceeded"
            _logger.error("%s crashed %d times — marked degraded", name, handle.restart_count)
            return

        delay = _BACKOFF_SCHEDULE_S[min(handle.restart_count - 1, len(_BACKOFF_SCHEDULE_S) - 1)]
        handle.state = "restarting"
        _logger.warning(
            "%s crashed (exit=%d) — restarting in %.0fs (attempt %d/%d)",
            name,
            exit_code,
            delay,
            handle.restart_count,
            _MAX_RESTART_ATTEMPTS,
        )
        await asyncio.sleep(delay)
        if self._stopped:
            return
        spawn_fn = self._spawn_lemonade if name == "lemonade" else self._spawn_tts
        await spawn_fn()

    async def stop(self) -> None:
        """Terminate all supervised children gracefully."""
        self._stopped = True
        for handle in self._services.values():
            if handle.process and handle.process.poll() is None:
                handle.process.terminate()
                try:
                    handle.process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    handle.process.kill()
                handle.state = "stopped"
                _logger.info("%s stopped", handle.name)

    def status(self) -> list[ServiceStatus]:
        """Return current status of all services."""
        result: list[ServiceStatus] = []
        configured = self._is_configured()
        for name, handle in self._services.items():
            is_configured = configured.get(name, False)
            if not is_configured and handle.state == "unconfigured":
                result.append(
                    ServiceStatus(
                        name=name,
                        pid=None,
                        port=handle.port,
                        state="unconfigured",
                        uptime_s=0.0,
                        restart_count=0,
                        last_error=None,
                    )
                )
                continue
            uptime = time.monotonic() - handle.start_time if handle.start_time else 0.0
            pid = handle.process.pid if handle.process else None
            result.append(
                ServiceStatus(
                    name=name,
                    pid=pid,
                    port=handle.port,
                    state=handle.state,
                    uptime_s=uptime,
                    restart_count=handle.restart_count,
                    last_error=handle.last_error,
                )
            )
        return result
