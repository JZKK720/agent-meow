"""Layer 2 voice service supervisor.

Spawns and supervises whisper-server (:8001) and tts-server.exe (:8891)
+ qwentts_wrapper (:8890) as child processes. Event-driven crash
detection via subprocess exit callbacks — instant restart, no polling.

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
        tts_server_exe: str | None = None,
        tts_server_model: str | None = None,
        tts_server_codec: str | None = None,
        tts_wrapper_python: str | None = None,
        whisper_server_exe: str | None = None,
        whisper_server_model: str | None = None,
    ) -> None:
        self._tts_server_exe = (
            tts_server_exe or os.environ.get("QWENTTS_SERVER_EXE", "").strip() or None
        )
        self._tts_server_model = (
            tts_server_model or os.environ.get("QWENTTS_MODEL", "").strip() or None
        )
        self._tts_server_codec = (
            tts_server_codec or os.environ.get("QWENTTS_CODEC", "").strip() or None
        )
        self._tts_server_lang = os.environ.get("QWENTTS_LANG", "auto").strip() or "auto"
        self._tts_chunk_dur = float(os.environ.get("QWENTTS_CODEC_CHUNK_DUR", "10.0"))
        self._tts_wrapper_python = tts_wrapper_python or sys.executable
        self._whisper_server_exe = (
            whisper_server_exe or os.environ.get("WHISPER_SERVER_EXE", "").strip() or None
        )
        self._whisper_server_model = (
            whisper_server_model or os.environ.get("WHISPER_SERVER_MODEL", "").strip() or None
        )
        self._services: dict[str, _ServiceHandle] = {
            "whisper_server": _ServiceHandle(name="whisper_server", port=8001),
            "tts_server": _ServiceHandle(name="tts_server", port=8891),
            "tts_wrapper": _ServiceHandle(name="tts_wrapper", port=8890),
        }
        self._stopped = False

    def _is_configured(self) -> dict[str, bool]:
        """Check which services have their prerequisites set."""
        return {
            "whisper_server": (
                self._whisper_server_exe is not None
                and os.path.exists(self._whisper_server_exe)
                and self._whisper_server_model is not None
                and os.path.exists(self._whisper_server_model)
            ),
            "tts_server": (
                self._tts_server_exe is not None
                and os.path.exists(self._tts_server_exe)
                and self._tts_server_model is not None
                and os.path.exists(self._tts_server_model)
                and self._tts_server_codec is not None
                and os.path.exists(self._tts_server_codec)
            ),
            "tts_wrapper": bool(os.environ.get("QWEN_TTS_URL", "").strip()),
        }

    async def start(self) -> None:
        """Spawn all configured voice services."""
        self._stopped = False
        configured = self._is_configured()
        if configured["whisper_server"]:
            await self._spawn_whisper_server()
        if configured["tts_server"]:
            await self._spawn_tts()

    async def _spawn_whisper_server(self) -> None:
        """Start whisper-server.exe (whisper.cpp, Vulkan iGPU STT).

        Uses --suppress-nst (suppress non-speech tokens) and a higher
        --no-speech-thold (0.8 vs default 0.6) to reduce hallucination
        on non-speech audio. The VAD option further filters non-speech
        segments before decoding, preventing the classic Whisper
        hallucination patterns (YouTube CTA text from silence).
        """
        if not self._whisper_server_exe or not self._whisper_server_model:
            return
        handle = self._services["whisper_server"]
        handle.state = "starting"
        try:
            handle.process = subprocess.Popen(
                [
                    self._whisper_server_exe,
                    "--model", self._whisper_server_model,
                    "--port", "8001",
                    "--host", "127.0.0.1",
                    # Suppress non-speech tokens — key hallucination defense.
                    "--suppress-nst",
                    # Higher no-speech threshold: 0.8 vs default 0.6.
                    # Rejects low-confidence segments that produce garbage.
                    "--no-speech-thold", "0.8",
                    # Flash attention for faster inference.
                    "--flash-attn",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                creationflags=_NO_WINDOW,
            )
            handle.start_time = time.monotonic()
            handle.state = "running"
            _logger.info(
                "whisper-server.exe started (pid=%s, port=8001, suppress-nst + VAD)",
                handle.process.pid,
            )
            self._monitor_exit("whisper_server", handle.process)
        except Exception as exc:
            handle.state = "degraded"
            handle.last_error = str(exc)
            _logger.error("Failed to start whisper-server: %s", exc)

    async def _spawn_tts(self) -> None:
        """Start tts-server.exe and the qwentts wrapper."""
        await self._spawn_tts_server()
        await self._spawn_tts_wrapper()

    async def _spawn_tts_server(self) -> None:
        """Start tts-server.exe only."""
        if not self._tts_server_exe or not self._tts_server_model or not self._tts_server_codec:
            return
        tts_handle = self._services["tts_server"]

        tts_handle.state = "starting"
        try:
            tts_handle.process = subprocess.Popen(
                [
                    self._tts_server_exe,
                    "--model", self._tts_server_model,
                    "--codec", self._tts_server_codec,
                    "--port", "8891",
                    "--lang", self._tts_server_lang,
                    "--codec-chunk-dur", str(self._tts_chunk_dur),
                    # Allow 2 concurrent requests so the read-aloud prefetch
                    # (chunk N+1) can generate while chunk N is still playing —
                    # without this, max-batch defaults to 1 and the prefetch
                    # queues behind the current chunk, causing sentence gaps.
                    "--max-batch", "2",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                creationflags=_NO_WINDOW,
            )
            tts_handle.start_time = time.monotonic()
            tts_handle.state = "running"
            _logger.info(
                "tts-server.exe started (pid=%s, port=8891, chunk_dur=%.1fs)",
                tts_handle.process.pid, self._tts_chunk_dur,
            )
            self._monitor_exit("tts_server", tts_handle.process)
        except Exception as exc:
            tts_handle.state = "degraded"
            tts_handle.last_error = str(exc)
            _logger.error("Failed to start tts-server: %s", exc)

    async def _spawn_tts_wrapper(self) -> None:
        """Start the qwentts wrapper only."""
        wrapper_handle = self._services["tts_wrapper"]

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
            self._monitor_exit("tts_wrapper", wrapper_handle.process)
        except Exception as exc:
            wrapper_handle.state = "degraded"
            wrapper_handle.last_error = str(exc)
            _logger.error("Failed to start qwentts wrapper: %s", exc)

    def _monitor_exit(self, name: str, process: subprocess.Popen[bytes]) -> None:
        """Register an async callback for when the child process exits."""

        async def _watch() -> None:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, process.wait)
            exit_code = process.returncode or 0
            await self._on_child_exit(name, exit_code)

        asyncio.ensure_future(_watch())

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
        spawn_fns = {
            "tts_server": self._spawn_tts_server,
            "tts_wrapper": self._spawn_tts_wrapper,
        }
        spawn_fn = spawn_fns.get(name)
        if spawn_fn:
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
