"""Tests for :mod:`agent_meow.server.local_host`."""

from __future__ import annotations

import logging
from typing import Any

import pytest

from agent_meow.host.identity import (
    HOST_ID_ENV_VAR,
    HOST_NAME_ENV_VAR,
    HOST_TOKEN_ENV_VAR,
)
from agent_meow.server import local_host
from agent_meow.server.local_host import (
    LocalHostHandle,
    start_local_host,
    stop_local_host,
)


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
    called: list[Any] = []
    monkeypatch.setattr(local_host.subprocess, "Popen", lambda *a, **k: called.append(a))
    handle = start_local_host(
        host_store=None,
        host_id="h",
        host_name="n",
        accounts_mode=True,
        log=logging.getLogger("t"),
    )
    assert handle is None
    assert called == []


def test_child_env_carries_identity_and_token_in_accounts_mode(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    monkeypatch.setattr(local_host, "os_environ", dict)
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
        host_store=_Store(),  # type: ignore[arg-type]
        host_id="abc",
        host_name="this-machine",
        accounts_mode=True,
        log=logging.getLogger("t"),
    )
    assert handle is not None
    env = captured["env"]
    assert env[HOST_TOKEN_ENV_VAR]
    assert env[HOST_ID_ENV_VAR] == "abc"
    assert env[HOST_NAME_ENV_VAR] == "this-machine"
    assert registered and registered[0]["host_id"] == "abc"
    assert registered[0]["user_id"] == "local"
    assert captured["args"][:2] == [local_host.sys.executable, "-m"]
    # No server_url = --local fallback.
    assert "--local" in captured["args"]


def test_server_url_uses_dash_server_arg(monkeypatch: pytest.MonkeyPatch) -> None:
    """When server_url is provided, the daemon gets --server <url> not --local."""
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    monkeypatch.setattr(local_host, "os_environ", dict)
    captured: dict[str, Any] = {}

    def _popen(args: list[str], env: dict[str, str], **kw: Any) -> _FakeProc:
        captured["args"] = args
        return _FakeProc()

    monkeypatch.setattr(local_host.subprocess, "Popen", _popen)
    handle = start_local_host(
        host_store=None,
        host_id="abc",
        host_name="n",
        accounts_mode=False,
        log=logging.getLogger("t"),
        server_url="http://127.0.0.1:9999",
    )
    assert handle is not None
    assert "--server" in captured["args"]
    assert "http://127.0.0.1:9999" in captured["args"]
    assert "--local" not in captured["args"]


def test_no_token_or_row_in_no_auth_mode(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    monkeypatch.setattr(local_host, "os_environ", dict)
    captured: dict[str, Any] = {}
    monkeypatch.setattr(
        local_host.subprocess,
        "Popen",
        lambda args, env, **kw: captured.update(env=env) or _FakeProc(),
    )

    class _Store:
        def register_managed_host(self, **kw: Any) -> None:
            raise AssertionError("must not register in no-auth mode")

    handle = start_local_host(
        host_store=_Store(),  # type: ignore[arg-type]
        host_id="abc",
        host_name="n",
        accounts_mode=False,
        log=logging.getLogger("t"),
    )
    assert handle is not None
    assert HOST_TOKEN_ENV_VAR not in captured["env"]


def test_spawn_failure_returns_none_and_never_raises(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(local_host, "local_single_user_enabled", lambda: True)
    monkeypatch.setattr(local_host, "os_environ", dict)

    def _boom(*a: Any, **k: Any) -> None:
        raise OSError("no interpreter")

    monkeypatch.setattr(local_host.subprocess, "Popen", _boom)
    handle = start_local_host(
        host_store=None,
        host_id="h",
        host_name="n",
        accounts_mode=False,
        log=logging.getLogger("t"),
    )
    assert handle is None


def test_stop_terminates_child() -> None:
    proc = _FakeProc()
    stop_local_host(LocalHostHandle(proc=proc), log=logging.getLogger("t"))  # type: ignore[arg-type]
    assert proc.terminated


@pytest.mark.asyncio
async def test_lifespan_starts_and_stops_local_host(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Any,
    runtime_init: None,
) -> None:
    from agent_meow.runtime.agent_cache import AgentCache
    from agent_meow.server import app as app_module
    from agent_meow.server.app import create_app
    from agent_meow.stores.agent_store.sqlalchemy_store import SqlAlchemyAgentStore
    from agent_meow.stores.artifact_store.local import LocalArtifactStore
    from agent_meow.stores.conversation_store.sqlalchemy_store import (
        SqlAlchemyConversationStore,
    )
    from agent_meow.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore

    db = tmp_path / "t.db"
    db_uri = f"sqlite:///{db}"
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    app = create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
    )

    calls: list[str] = []
    monkeypatch.setattr(
        app_module,
        "start_local_host",
        lambda **kw: calls.append("start") or local_host.LocalHostHandle(proc=None),
    )
    monkeypatch.setattr(
        app_module,
        "stop_local_host",
        lambda handle, **kw: calls.append("stop"),
    )

    async with app.router.lifespan_context(app):
        pass

    assert calls == ["start", "stop"]


def test_local_host_launch_token_resolves_to_local_owner(
    db_uri: str,
) -> None:
    """Accounts-mode pre-registration resolves via the existing tunnel path."""
    from agent_meow.db.utils import now_epoch
    from agent_meow.server.auth import RESERVED_USER_LOCAL
    from agent_meow.stores.host_store import HostStore

    store = HostStore(db_uri)
    token = "secret-token"
    host_id = "a1b2c3d4e5f60718293a4b5c6d7e8f90"
    store.register_managed_host(
        host_id=host_id,
        name="n",
        user_id=RESERVED_USER_LOCAL,
        token=token,
        provider="local",
        sandbox_id="local",
        token_expires_at=now_epoch() + 3600,
    )
    resolved = store.resolve_launch_token(host_id, token)
    assert resolved is not None
    assert resolved.user_id == RESERVED_USER_LOCAL
    assert store.resolve_launch_token(host_id, "wrong") is None
