"""Spawn + supervise the server's own local host daemon (1.0).

In local single-user mode the server adopts the CLI's spawn-and-supervise
role so a browser lands on a server with a ready local host (no CLI, no
connect-a-host CTA). Best-effort: a spawn failure logs and never blocks
startup. See designs/SERVER_LOCAL_HOST.md.
"""

from __future__ import annotations

import logging
import os
import secrets
import subprocess
import sys
from dataclasses import dataclass

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


@dataclass
class LocalHostHandle:
    """Handle to the spawned local host child process."""

    proc: subprocess.Popen[bytes] | None


def os_environ() -> dict[str, str]:
    """Return the parent environment (seam for tests)."""
    return dict(os.environ)


def start_local_host(
    *,
    host_store: HostStore | None,
    host_id: str,
    host_name: str,
    accounts_mode: bool,
    log: logging.Logger,
) -> LocalHostHandle | None:
    """Spawn the local host daemon as a supervised child, best-effort.

    Accounts mode pre-registers the host row with a hashed launch token the
    child presents via the managed-host header; no-auth mode relies on the
    tunnel's RESERVED_USER_LOCAL path and registers nothing.

    :returns: A handle, or ``None`` when not single-user or spawn failed.
    """
    if not local_single_user_enabled():
        return None
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
    try:
        proc = subprocess.Popen(
            [sys.executable, "-m", "agent_meow.host._daemon_entry", "--local"],
            env=env,
        )
    except OSError as exc:  # missing interpreter etc. — never block startup
        log.warning("local host daemon failed to spawn: %s", exc)
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
