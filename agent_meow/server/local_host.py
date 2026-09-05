"""Spawn + supervise the server's own local host daemon (1.0).

In local single-user mode the server adopts the CLI's spawn-and-supervise
role so a browser lands on a server with a ready local host (no CLI, no
connect-a-host CTA). Best-effort: a spawn failure logs and never blocks
startup. See designs/SERVER_LOCAL_HOST.md.

The host daemon is supervised with event-driven crash restart: if the child
exits (killed externally by sleep/logoff/OOM/etc.), it is respawned with
backoff. This closes the recurring "runner offline" gap where a dead host
stayed dead until the whole server restarted.
"""

from __future__ import annotations

import asyncio
import logging
import os
import secrets
import subprocess
import sys
import time
from dataclasses import dataclass
from typing import Any

from agent_meow.db.utils import now_epoch
from agent_meow.host.identity import (
    HOST_ID_ENV_VAR,
    HOST_NAME_ENV_VAR,
    HOST_TOKEN_ENV_VAR,
)
from agent_meow.server.auth import RESERVED_USER_LOCAL, local_single_user_enabled
from agent_meow.stores.host_store import HostStore

# Token TTL for the local host's launch credential. Startup-scoped: the token
# is minted fresh each boot and dies with the server process, so a generous
# TTL simply outlasts the session.
_LOCAL_HOST_TOKEN_TTL_S = 24 * 60 * 60

# Backoff schedule for host-daemon crash restart, mirroring
# ServiceSupervisor. 3 attempts with increasing delay, then the host is left
# offline (the UI reflects it) rather than burning CPU retrying forever.
_HOST_BACKOFF_SCHEDULE_S: tuple[float, ...] = (5.0, 10.0, 30.0)
_HOST_MAX_RESTART_ATTEMPTS = len(_HOST_BACKOFF_SCHEDULE_S)

# Windows: create no console window for the host child process.
# 0x08000000 = CREATE_NO_WINDOW
_NO_WINDOW = 0x08000000


@dataclass
class LocalHostHandle:
    """Handle to the spawned local host child process."""

    proc: subprocess.Popen[bytes] | None


def os_environ() -> dict[str, str]:
    """Return the parent environment (seam for tests)."""
    return dict(os.environ)


def _build_host_env(
    *,
    host_id: str,
    host_name: str,
    accounts_mode: bool,
    host_store: HostStore | None,
) -> dict[str, str] | None:
    """Build the child environment, pre-registering the managed host row in
    accounts mode. Returns ``None`` when the host is not single-user (caller
    should not spawn)."""
    env = {**os_environ(), HOST_ID_ENV_VAR: host_id, HOST_NAME_ENV_VAR: host_name}
    if accounts_mode and host_store is not None:
        token = secrets.token_urlsafe(32)
        host_store.register_managed_host(
            host_id=host_id,
            name=host_name,
            user_id=RESERVED_USER_LOCAL,
            token=token,
            provider="local",
            sandbox_id="local",
            token_expires_at=now_epoch() + _LOCAL_HOST_TOKEN_TTL_S,
        )
        env[HOST_TOKEN_ENV_VAR] = token
    return env


def _spawn_host_process(
    env: dict[str, str],
    *,
    server_url: str | None,
    log: logging.Logger,
) -> subprocess.Popen[bytes] | None:
    """Spawn the host daemon child process. Returns ``None`` on spawn failure.

    Connect to the running server when its URL is known; otherwise fall back
    to ``--local`` (the daemon starts/reuses the canonical local server).
    """
    if server_url:
        mode_args = ["--server", server_url]
    else:
        mode_args = ["--local"]
    try:
        return subprocess.Popen(
            [sys.executable, "-m", "agent_meow.host._daemon_entry", *mode_args],
            env=env,
            creationflags=_NO_WINDOW,
        )
    except OSError as exc:  # missing interpreter etc. — never block startup
        log.warning("local host daemon failed to spawn: %s", exc)
        return None


def start_local_host(
    *,
    host_store: HostStore | None,
    host_id: str,
    host_name: str,
    accounts_mode: bool,
    log: logging.Logger,
    server_url: str | None = None,
) -> LocalHostHandle | None:
    """Spawn the local host daemon as a supervised child, best-effort.

    Accounts mode pre-registers the host row with a hashed launch token the
    child presents via the managed-host header; no-auth mode relies on the
    tunnel's RESERVED_USER_LOCAL path and registers nothing.

    :param server_url: The running server's URL. When provided, the daemon
        connects to this server via ``--server``. When ``None``, falls back
        to ``--local`` (the daemon starts/reuses the canonical local server).
    :returns: A handle, or ``None`` when not single-user or spawn failed.
    """
    if not local_single_user_enabled():
        return None
    env = _build_host_env(
        host_id=host_id,
        host_name=host_name,
        accounts_mode=accounts_mode,
        host_store=host_store,
    )
    proc = _spawn_host_process(env, server_url=server_url, log=log)
    if proc is None:
        return None
    return LocalHostHandle(proc=proc)


def stop_local_host(handle: LocalHostHandle | None, *, log: logging.Logger) -> None:
    """Terminate the local host child, best-effort."""
    if handle is None or handle.proc is None:
        return
    handle.proc.terminate()
    try:
        handle.proc.wait(timeout=5.0)
    except subprocess.TimeoutExpired:
        log.warning("local host daemon did not exit on terminate; killing")
        handle.proc.kill()


class LocalHostSupervisor:
    """Supervise the server's local host daemon with crash auto-restart.

    Mirrors :class:`agent_meow.server.service_supervisor.ServiceSupervisor`:
    spawns the host child, registers an event-driven exit callback, and on a
    non-zero exit restarts it with backoff. After
    :data:`_HOST_MAX_RESTART_ATTEMPTS` crashes the host is left offline (the
    UI reflects it) rather than retrying forever.

    ``start()`` is called from the server lifespan; ``stop()`` on teardown.
    """

    def __init__(self, *, log: logging.Logger | None = None) -> None:
        self._log = log or logging.getLogger(__name__)
        self._process: subprocess.Popen[bytes] | None = None
        self._restart_count = 0
        self._start_time = 0.0
        self._state = "stopped"  # "running" | "restarting" | "degraded" | "stopped"
        self._stopped = False
        self._watch_task: asyncio.Task[Any] | None = None
        # Last spawn parameters, captured so a crash can be respawned with the
        # same identity/auth-mode/url (the accounts token is re-minted fresh).
        self._last_params: dict[str, Any] | None = None

    @property
    def status(self) -> dict[str, Any]:
        """Current status, for diagnostics / the dashboard."""
        pid = self._process.pid if self._process is not None else None
        uptime = time.monotonic() - self._start_time if self._start_time else 0.0
        return {
            "state": self._state,
            "pid": pid,
            "uptime_s": round(uptime, 1),
            "restart_count": self._restart_count,
        }

    def start(
        self,
        *,
        host_store: HostStore | None,
        host_id: str,
        host_name: str,
        accounts_mode: bool,
        server_url: str | None = None,
    ) -> None:
        """Spawn the host daemon and start supervising it. Best-effort."""
        self._stopped = False
        self._restart_count = 0
        self._last_params = {
            "host_store": host_store,
            "host_id": host_id,
            "host_name": host_name,
            "accounts_mode": accounts_mode,
            "server_url": server_url,
        }
        if not local_single_user_enabled():
            self._state = "stopped"
            return
        env = _build_host_env(
            host_id=host_id,
            host_name=host_name,
            accounts_mode=accounts_mode,
            host_store=host_store,
        )
        self._spawn(env, server_url=server_url)

    def _spawn(
        self,
        env: dict[str, str],
        *,
        server_url: str | None,
    ) -> None:
        """Spawn (or respawn) the host child and arm the exit watcher."""
        self._state = "starting"
        proc = _spawn_host_process(env, server_url=server_url, log=self._log)
        if proc is None:
            self._state = "degraded"
            return
        self._process = proc
        self._start_time = time.monotonic()
        self._state = "running"
        self._log.info("local host daemon started (pid=%s)", proc.pid)
        self._arm_exit_watcher(proc)

    def _arm_exit_watcher(self, proc: subprocess.Popen[bytes]) -> None:
        """Register an async callback for when the child process exits."""
        loop = asyncio.get_event_loop()

        async def _watch() -> None:
            await loop.run_in_executor(None, proc.wait)
            exit_code = proc.returncode or 0
            await self._on_child_exit(exit_code)

        if self._watch_task is not None and not self._watch_task.done():
            self._watch_task.cancel()
        self._watch_task = asyncio.ensure_future(_watch())

    async def _on_child_exit(self, exit_code: int) -> None:
        """Called when the host child exits. Restarts with backoff."""
        if self._stopped:
            return
        self._process = None
        if exit_code == 0:
            self._state = "stopped"
            return

        self._restart_count += 1
        if self._restart_count > _HOST_MAX_RESTART_ATTEMPTS:
            self._state = "degraded"
            self._log.error(
                "local host daemon crashed %d times — left offline",
                self._restart_count,
            )
            return

        delay = _HOST_BACKOFF_SCHEDULE_S[
            min(self._restart_count - 1, len(_HOST_BACKOFF_SCHEDULE_S) - 1)
        ]
        self._state = "restarting"
        self._log.warning(
            "local host daemon crashed (exit=%d) — restarting in %.0fs (attempt %d/%d)",
            exit_code,
            delay,
            self._restart_count,
            _HOST_MAX_RESTART_ATTEMPTS,
        )
        await asyncio.sleep(delay)
        if self._stopped:
            return
        # Rebuild the env (accounts token may have rotated) and respawn.
        if local_single_user_enabled():
            # Re-derive env from the original spawn parameters captured at
            # start(); stored via a callback-free re-call path.
            self._respawn()

    def _respawn(self) -> None:
        """Respawn after a crash. The env is re-built from the identity and
        auth mode via :meth:`start`'s parameters, which we capture here."""
        # Re-call start() to rebuild env; restart_count is preserved.
        if self._last_params is None:
            self._state = "degraded"
            return
        env = _build_host_env(
            host_id=self._last_params["host_id"],
            host_name=self._last_params["host_name"],
            accounts_mode=self._last_params["accounts_mode"],
            host_store=self._last_params["host_store"],
        )
        self._spawn(env, server_url=self._last_params["server_url"])

    def stop(self) -> None:
        """Terminate the host child gracefully and stop supervising."""
        self._stopped = True
        if self._watch_task is not None and not self._watch_task.done():
            self._watch_task.cancel()
        proc = self._process
        if proc is not None and proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=5.0)
            except subprocess.TimeoutExpired:
                self._log.warning("local host daemon did not exit; killing")
                proc.kill()
        self._process = None
        self._state = "stopped"
