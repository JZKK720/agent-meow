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
