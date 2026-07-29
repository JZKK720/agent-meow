# Server Self-Registers a Local Host on Startup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the packaged 1.0 server boots in local single-user mode, it spawns and supervises the existing host daemon as a child so a browser lands on a server with a ready local host — no connect-a-host CTA, no CLI.

**Architecture:** Option A of `designs/SERVER_LOCAL_HOST.md`. The server adopts the CLI's spawn-and-supervise role. In accounts mode it reuses the existing managed-host launch-token machinery (`HostStore.register_managed_host` / `resolve_launch_token`, `OMNIGENT_HOST_TOKEN` → `MANAGED_HOST_TOKEN_HEADER`); in no-auth mode the host rides the existing `RESERVED_USER_LOCAL` path. No changes to `host/connect.py` or `server/routes/host_tunnel.py`.

**Tech Stack:** Python 3.12, FastAPI lifespan, asyncio, `uv` + `pytest`, `secrets`, `subprocess`.

**Spec:** `designs/SERVER_LOCAL_HOST.md` (commit `3924d968`). Read it first.

## Global Constraints

- Repo: `uv sync --extra all --extra dev`, run tests via `uv run pytest`.
- Python 3.12+. Type-check is `uv run mypy agent_meow` (strict). Lint `uv run ruff check .`.
- Commit with DCO sign-off: `git commit -s`.
- Gate self-host on `agent_meow.server.auth.local_single_user_enabled()` (`OMNIGENT_LOCAL_SINGLE_USER`) — never spawn on multi-user servers.
- Self-host is **best-effort**: a spawn failure logs and never blocks server startup.
- Do **not** modify `agent_meow/host/connect.py`, `agent_meow/server/routes/host_tunnel.py`, or `agent_meow/stores/host_store.py` — they are reused as-is.
- 1.0 scope: no auto-respawn, lazy Hermes readiness, CTA stays as fallback.
- Keep comments short (≤3 lines), describe the scenario not the PR, no ticket refs.

---

### Task 1: `local_host` module — spawn/supervise/terminate the child

**Files:**
- Create: `agent_meow/server/local_host.py`
- Test: `tests/server/test_local_host.py`

**Interfaces:**
- Consumes: `agent_meow.server.auth.local_single_user_enabled()`; `agent_meow.stores.host_store.HostStore.register_managed_host(...)`; `agent_meow.host.identity` env var names (`HOST_TOKEN_ENV_VAR`, `HOST_ID_ENV_VAR`, `HOST_NAME_ENV_VAR`); `agent_meow.db.utils.now_epoch()`.
- Produces:
  - `@dataclass LocalHostHandle` with field `proc: subprocess.Popen | None`.
  - `start_local_host(*, host_store: HostStore | None, host_id: str, host_name: str, accounts_mode: bool, log: logging.Logger) -> LocalHostHandle | None`
  - `stop_local_host(handle: LocalHostHandle | None, *, log: logging.Logger) -> None`

- [ ] **Step 1: Write the failing tests**

Create `tests/server/test_local_host.py`. Follow `tests/server/test_managed_hosts.py` conventions (module docstring, `from __future__ import annotations`, pytest). Test the pure decision logic and the child-env builder without spawning real processes — monkeypatch `subprocess.Popen`.

```python
"""Tests for :mod:`agent_meow.server.local_host`."""

from __future__ import annotations

import logging
from typing import Any

import pytest

from agent_meow.server import local_host
from agent_meow.server.local_host import LocalHostHandle, start_local_host, stop_local_host


class _FakeProc:
    def __init__(self) -> None:
        self.terminated = False
        self.killed = False

    def terminate(self) -> None:
        self.terminated = True

    def wait(self, timeout: float | None = None) -> int:
        return 0

    def kill(self) -> None:
        self.killed = True


def test_start_skipped_when_not_single_user(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: False)
    called = []
    monkeypatch.setattr(local_host.subprocess, "Popen", lambda *a, **k: called.append(a))
    handle = start_local_host(
        host_store=None, host_id="h", host_name="n",
        accounts_mode=True, log=logging.getLogger("t"),
    )
    assert handle is None
    assert called == []


def test_child_env_carries_identity_and_token_in_accounts_mode(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    captured: dict[str, Any] = {}

    def _popen(args: list[str], env: dict[str, str], **kw: Any) -> _FakeProc:
        captured["args"] = args
        captured["env"] = env
        return _FakeProc()

    monkeypatch.setattr(local_host.subprocess, "Popen", _popen)
    registered: list[dict[str, Any]] = []

    class _Store:
        def register_managed_host(self, **kw: Any) -> None:
            registered.append(kw)

    handle = start_local_host(
        host_store=_Store(), host_id="abc", host_name="this-machine",
        accounts_mode=True, log=logging.getLogger("t"),
    )
    assert handle is not None
    env = captured["env"]
    assert env["OMNIGENT_HOST_TOKEN"]  # token present, non-empty
    assert env["OMNIGENT_HOST_ID"] == "abc"
    assert env["OMNIGENT_HOST_NAME"] == "this-machine"
    assert registered and registered[0]["host_id"] == "abc"
    assert registered[0]["user_id"] == "local"


def test_no_token_or_row_in_no_auth_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    captured: dict[str, Any] = {}
    monkeypatch.setattr(
        local_host.subprocess, "Popen",
        lambda args, env, **kw: captured.update(env=env) or _FakeProc(),
    )

    class _Store:
        def register_managed_host(self, **kw: Any) -> None:  # pragma: no cover
            raise AssertionError("must not register in no-auth mode")

    handle = start_local_host(
        host_store=_Store(), host_id="abc", host_name="n",
        accounts_mode=False, log=logging.getLogger("t"),
    )
    assert handle is not None
    assert "OMNIGENT_HOST_TOKEN" not in captured["env"]


def test_spawn_failure_returns_none_and_never_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)

    def _boom(*a: Any, **k: Any) -> None:
        raise OSError("no interpreter")

    monkeypatch.setattr(local_host.subprocess, "Popen", _boom)
    handle = start_local_host(
        host_store=None, host_id="h", host_name="n",
        accounts_mode=False, log=logging.getLogger("t"),
    )
    assert handle is None


def test_stop_terminates_child() -> None:
    proc = _FakeProc()
    stop_local_host(LocalHostHandle(proc=proc), log=logging.getLogger("t"))  # type: ignore[arg-type]
    assert proc.terminated
```

Note: the test references env var *names* as string literals (`OMNIGENT_HOST_TOKEN`, `OMNIGENT_HOST_ID`, `OMNIGENT_HOST_NAME`). Confirm the exact constant values in `agent_meow/host/identity.py` (`HOST_TOKEN_ENV_VAR`, `HOST_ID_ENV_VAR`, `HOST_NAME_ENV_VAR`) and match them — do not guess. If the constant values differ from these literals, use the constants in the test instead.

- [ ] **Step 2: Run tests to verify they fail**

Run: `uv run pytest tests/server/test_local_host.py -v`
Expected: FAIL — `ModuleNotFoundError: agent_meow.server.local_host`.

- [ ] **Step 3: Implement `agent_meow/server/local_host.py`**

Create the module. Keep it small and single-purpose. Import the env-var constant *names* from `agent_meow.host.identity` and the reserved owner from `agent_meow.server.auth` (verify `RESERVED_USER_LOCAL` import path — it lives in `agent_meow/server/auth.py`).

```python
"""Spawn + supervise the server's own local host daemon (1.0).

In local single-user mode the server adopts the CLI's spawn-and-supervise
role so a browser lands on a server with a ready local host (no CLI, no
connect-a-host CTA). Best-effort: a spawn failure logs and never blocks
startup. See designs/SERVER_LOCAL_HOST.md.
"""

from __future__ import annotations

import logging
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

    proc: subprocess.Popen | None


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
        handle.proc.kill()


def os_environ() -> dict[str, str]:
    """Return the parent environment (seam for tests)."""
    import os

    return dict(os.environ)
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `uv run pytest tests/server/test_local_host.py -v`
Expected: PASS (5 tests).

- [ ] **Step 5: Lint + type-check**

Run: `uv run ruff check agent_meow/server/local_host.py tests/server/test_local_host.py`
Run: `uv run mypy agent_meow/server/local_host.py`
Expected: clean (fix any strict-mypy complaints, e.g. the `Popen` type param).

- [ ] **Step 6: Commit**

Run: `git add agent_meow/server/local_host.py tests/server/test_local_host.py && git commit -s -m "feat(server): add local_host spawn/supervise module (1.0 self-host)"`

---

### Task 2: Wire `start_local_host` into the server lifespan

**Files:**
- Modify: `agent_meow/server/app.py` (lifespan startup ~1370-1377 and teardown ~1505-1533)
- Test: `tests/server/test_app.py` (extend) or a focused new test in `tests/server/test_local_host.py`

**Interfaces:**
- Consumes: `start_local_host` / `stop_local_host` / `LocalHostHandle` (Task 1); `app.state.host_store`; `local_single_user_enabled()`; the app's resolved auth source.
- Produces: `app_inst.state.local_host_handle` (a `LocalHostHandle | None`) so teardown can stop the child.

- [ ] **Step 1: Write the failing test**

Add a test that boots `create_app` in local single-user mode and asserts `start_local_host` is invoked on startup and `stop_local_host` on shutdown. Monkeypatch both to record calls (do not spawn real processes). Look at `tests/server/test_app.py` for the existing `create_app(...)` fixture pattern and required store arguments.

```python
def test_lifespan_starts_and_stops_local_host(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[str] = []
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    monkeypatch.setattr(
        app_module, "start_local_host",
        lambda **kw: calls.append("start") or local_host.LocalHostHandle(proc=None),
    )
    monkeypatch.setattr(
        app_module, "stop_local_host",
        lambda handle, **kw: calls.append("stop"),
    )
    # ... build app via the existing create_app test fixture, enter+exit lifespan ...
    assert calls == ["start", "stop"]
```

Reuse the existing `create_app` invocation from `tests/server/test_app.py` — copy its required kwargs (stores, auth provider) rather than inventing new ones. If the app needs `OMNIGENT_LOCAL_SINGLE_USER=1` set, use `monkeypatch.setenv`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `uv run pytest tests/server/test_local_host.py::test_lifespan_starts_and_stops_local_host -v`
Expected: FAIL — `start_local_host` not called (attribute error / assertion).

- [ ] **Step 3: Implement the lifespan wiring**

In `agent_meow/server/app.py`:
- Import `from agent_meow.server.local_host import start_local_host, stop_local_host` and `from agent_meow.server.auth import resolve_auth_source` (verify `resolve_auth_source` is exported from `agent_meow.server.auth`).
- In `_lifespan` startup, after `set_harness_process_manager(harness_pm)` (~1377), add:

```python
        # Self-host (1.0): in local single-user mode, spawn the server's own
        # host daemon so a browser lands on a ready local host. Best-effort.
        from agent_meow.host.identity import load_or_create_host_identity

        _local_identity = load_or_create_host_identity()
        app_inst.state.local_host_handle = start_local_host(
            host_store=host_store,
            host_id=_local_identity.host_id,
            host_name=_local_identity.name,
            accounts_mode=(resolve_auth_source() == "accounts"),
            log=_logger,
        )
```

- In the teardown `finally` block (before `await harness_pm.shutdown()` ~1532), add:

```python
            stop_local_host(getattr(app_inst.state, "local_host_handle", None), log=_logger)
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `uv run pytest tests/server/test_local_host.py -v`
Expected: PASS (all, including the lifespan test).

- [ ] **Step 5: Lint + type-check**

Run: `uv run ruff check agent_meow/server/app.py`
Run: `uv run mypy agent_meow` (strict — confirm no new errors from app.py)
Expected: clean.

- [ ] **Step 6: Commit**

Run: `git add agent_meow/server/app.py tests/server/test_local_host.py && git commit -s -m "feat(server): self-register local host on startup in single-user mode (1.0)"`

---

### Task 3: Integration — accounts-mode host is accepted via the existing tunnel

**Files:**
- Test: `tests/server/test_local_host.py` (add integration test)

**Interfaces:**
- Consumes: `create_app`, `HostStore`, the spawned local host identity, `resolve_launch_token`.
- Produces: none (verification only).

- [ ] **Step 1: Write the failing integration test**

Assert the end-to-end credential path: given the server pre-registered the local host (Task 2, accounts mode), `HostStore.resolve_launch_token(host_id, token)` resolves the row to `RESERVED_USER_LOCAL`, and a wrong token returns `None`. This exercises `host_tunnel.py`'s auth path indirectly without opening a real WebSocket. Use an in-memory/real `HostStore` (see `tests/server/test_managed_hosts.py` for a `HostStore` fixture).

```python
def test_local_host_launch_token_resolves_to_local_owner(tmp_path) -> None:
    store = HostStore(f"sqlite:///{tmp_path}/t.db")  # match existing fixture pattern
    token = "secret-token"
    store.register_managed_host(
        host_id="h1", name="n", user_id="local", token=token,
        provider="local", sandbox_id="local", token_expires_at=now_epoch() + 3600,
    )
    assert store.resolve_launch_token("h1", token).user_id == "local"
    assert store.resolve_launch_token("h1", "wrong") is None
```

- [ ] **Step 2: Run to verify it fails (if the fixture pattern differs)**

Run: `uv run pytest tests/server/test_local_host.py::test_local_host_launch_token_resolves_to_local_owner -v`
Expected: PASS on first run if `HostStore` already supports it (it does — Task 3 is a characterization/verification test). If it fails on fixture setup, fix the fixture to match `test_managed_hosts.py`.

- [ ] **Step 3: Commit**

Run: `git add tests/server/test_local_host.py && git commit -s -m "test(server): verify local host launch-token resolution (1.0)"`

---

### Task 4: Full verification + repo-required e2e

**Files:**
- Test: `tests/e2e/` (add or extend a self-host e2e per repo convention)

- [ ] **Step 1: Run the full backend suite (no regressions)**

Run: `uv run pytest tests/server tests/stores -q`
Expected: PASS (no new failures vs. the pre-existing baseline).

- [ ] **Step 2: Add the repo-required e2e (new feature)**

Per `.github/copilot-instructions.md`, a new feature needs an e2e covering the happy path. Add `tests/e2e/test_local_self_host.py`: boot the app in local single-user mode → assert a host row registers online → assert the landing no longer renders `new-chat-landing-no-hosts-cta` (the landing assertion can be a lightweight API-level check that `online_host_ids` is non-empty, since driving the React landing is covered by the frontend suite). Follow the existing `tests/e2e/` conventions for how they boot a server.

- [ ] **Step 3: Lint + type-check + full test**

Run: `uv run ruff check .`
Run: `uv run mypy agent_meow`
Run: `uv run pytest -q`
Expected: clean / no new failures.

- [ ] **Step 4: Commit**

Run: `git add tests/e2e/test_local_self_host.py && git commit -s -m "test(e2e): local self-host happy path (1.0)"`

---

## Notes for the implementer

- **Verify constant values before using them.** `HOST_TOKEN_ENV_VAR`, `HOST_ID_ENV_VAR`, `HOST_NAME_ENV_VAR` live in `agent_meow/host/identity.py`; `RESERVED_USER_LOCAL` and `local_single_user_enabled` in `agent_meow/server/auth.py`; `resolve_auth_source` also in `agent_meow/server/auth.py`. Match their exact values/names — do not guess.
- **Do not** edit `host/connect.py`, `host_tunnel.py`, or `host_store.py`.
- If `load_or_create_host_identity()` has side effects (writes `config.yaml`) that are undesirable in some server contexts, pass the identity in explicitly instead — but for the packaged 1.0 app the durable identity is correct (the host re-owns across restarts).
- The `new-chat-landing-no-hosts-cta` UI disappears as a *consequence* of a host being present; no frontend change is needed for 1.0.
