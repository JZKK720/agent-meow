"""Tests for the S2S Realtime WebSocket proxy (agent_meow/server/routes/s2s_proxy.py).

Covers the distribution-stability behaviors added in the end-to-end
voice-stability pass:

  - auth gate: rejects an unauthenticated handshake with 1008 when an
    auth provider is wired; stays open when no provider is wired
    (single-user/dev mode).
  - upstream connect failure: browser receives a 1011 close (not a
    hung socket) when the S2S server is unreachable.
  - close-code propagation: a non-normal upstream close is forwarded to
    the browser as 1011 with a reason, so the client can distinguish a
    server restart from an idle timeout.

The upstream ``websockets.connect`` is monkeypatched with a fake so the
tests don't require a real S2S server at :8765.
"""

from __future__ import annotations

import asyncio
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from agent_meow.server.routes.s2s_proxy import create_s2s_proxy_router


class _FakeAuthProvider:
    """Auth provider stub returning a fixed user id (or None)."""

    def __init__(self, user_id: str | None) -> None:
        self._user_id = user_id

    def get_user_id(self, request: Any) -> str | None:
        return self._user_id


class _FakeUpstream:
    """Minimal fake S2S server connection.

    Mimics the object yielded by ``await websockets.connect(...)``: it
    exposes ``send``/``close`` and is async-iterable (``async for msg``).
    The test drives iteration via ``__anext__`` to simulate the server
    emitting frames then closing with a configured code.
    """

    def __init__(self, *, close_code: int = 1000, close_reason: str = "") -> None:
        self.close_code = close_code
        self.close_reason = close_reason
        self.sent: list[str | bytes] = []
        self._emitted = False
        self._closed = False

    async def send(self, data: str | bytes) -> None:
        self.sent.append(data)

    async def close(self) -> None:
        self._closed = True

    def __aiter__(self) -> "_FakeUpstream":
        return self

    async def __anext__(self) -> str:
        if self._emitted:
            # Second read: simulate a ConnectionClosed with the
            # configured code, ending the pump's ``async for`` loop.
            import websockets

            raise websockets.ConnectionClosed(
                rcvd=websockets.frames.Close(code=self.close_code, reason=self.close_reason),
                sent=None,
            )
        self._emitted = True
        return '{"type":"session.created"}'


class _FakeConnect:
    """Awaitable that resolves to a :class:`_FakeUpstream`.

    Matches the ``websockets.connect()`` contract: the returned object is
    both awaitable (``await connect(...)`` → the connection) and usable as
    ``async with connect(...)``. The proxy awaits it via ``asyncio.wait_for``.
    """

    def __init__(self, upstream: _FakeUpstream) -> None:
        self._upstream = upstream

    def __await__(self):
        async def _resolve() -> _FakeUpstream:
            return self._upstream

        return _resolve().__await__()

    async def __aenter__(self) -> _FakeUpstream:
        return self._upstream

    async def __aexit__(self, *exc: object) -> None:
        await self._upstream.close()


def _make_app(auth_provider: Any) -> FastAPI:
    app = FastAPI()
    app.include_router(create_s2s_proxy_router(auth_provider=auth_provider), prefix="/v1")
    return app


def test_auth_rejects_unauthenticated_handshake() -> None:
    """A wired auth provider rejects an unauthenticated WS with 1008."""
    app = _make_app(_FakeAuthProvider(user_id=None))
    with TestClient(app) as client:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect("/v1/realtime"):
                pass
        # 1008 = policy violation (auth required).
        assert exc_info.value.code == 1008


def test_no_auth_provider_stays_open(monkeypatch: pytest.MonkeyPatch) -> None:
    """Without an auth provider (single-user/dev), the proxy accepts."""
    fake = _FakeUpstream(close_code=1000)
    monkeypatch.setattr(
        "agent_meow.server.routes.s2s_proxy.websockets.connect",
        lambda *a, **kw: _FakeConnect(fake),
    )

    app = _make_app(auth_provider=None)
    with TestClient(app) as client:
        with client.websocket_connect("/v1/realtime") as ws:
            # The proxy should have accepted; send a frame and read the
            # session.created the fake upstream emits before it closes.
            ws.send_text('{"type":"session.update"}')
            raw = ws.receive_text()
            assert "session.created" in raw


def test_upstream_connect_failure_closes_browser_with_1011(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """An unreachable S2S server fails fast with a 1011 close (not a hang)."""

    async def _fail_connect(*a: object, **kw: object) -> Any:
        raise ConnectionRefusedError("S2S server down")

    monkeypatch.setattr(
        "agent_meow.server.routes.s2s_proxy.websockets.connect",
        _fail_connect,
    )

    app = _make_app(auth_provider=None)
    with TestClient(app) as client:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect("/v1/realtime") as ws:
                # The proxy accepts, fails to reach the upstream, and closes
                # the browser socket with 1011. The close surfaces on the
                # next receive.
                ws.receive_text()
        # 1011 = server error (upstream unavailable).
        assert exc_info.value.code == 1011


def test_non_normal_upstream_close_propagates_as_1011(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A non-normal upstream close (e.g. restart, code 1011) is forwarded to
    the browser as 1011 with a reason, so the client can auto-reconnect."""
    fake = _FakeUpstream(close_code=1011, close_reason="server restarting")
    monkeypatch.setattr(
        "agent_meow.server.routes.s2s_proxy.websockets.connect",
        lambda *a, **kw: _FakeConnect(fake),
    )

    app = _make_app(auth_provider=None)
    with TestClient(app) as client:
        with pytest.raises(WebSocketDisconnect) as exc_info:
            with client.websocket_connect("/v1/realtime") as ws:
                # Read the one frame the fake emits. The next receive hits
                # the propagated 1011 close (fake closed upstream → proxy
                # closes browser with 1011).
                ws.receive_text()
                ws.receive_text()
        assert exc_info.value.code == 1011
        assert "upstream closed" in (exc_info.value.reason or "")
