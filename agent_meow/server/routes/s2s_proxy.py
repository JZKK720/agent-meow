"""Speech-to-speech WebSocket proxy.

Proxies the browser's WebSocket connection to the speech-to-speech server
at ws://localhost:8765/v1/realtime, so the browser connects to the agent-meow
server (same origin) instead of a cross-origin WebSocket.

The S2S_SERVER_URL env var overrides the default (http://localhost:8765).

Distribution-stability notes
----------------------------
The proxy is the middle hop of a three-node voice path
(browser → gateway → S2S server). For production use it must:

  - authenticate the browser handshake (identity check via auth_provider),
  - log every drop with a reason (no silent ``except: pass``),
  - keep the upstream connection alive with WebSocket pings so an idle
    proxy doesn't die a silent half-open death,
  - cancel both pump tasks cleanly when either side closes,
  - propagate the upstream close code/reason to the browser so the client
    can distinguish a server restart from an idle timeout, and
  - bound the upstream connect/handshake so a dead S2S server fails fast
    instead of hanging the browser socket.
"""

import asyncio
import logging
import os

import httpx
import websockets
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect, WebSocketException
from fastapi.responses import Response
from starlette import status

from agent_meow.server.auth import AuthProvider

_logger = logging.getLogger(__name__)

_DEFAULT_S2S_URL = "http://localhost:8765"
# Upstream connect + first-frame handshake timeout. A dead S2S server
# must fail fast so the browser gets a 1011 instead of a hung socket.
_UPSTREAM_CONNECT_TIMEOUT = 5.0
# WebSocket ping interval/timeout for the upstream link. Keeps idle
# proxies alive and detects a half-open upstream. The ping timeout must
# be generous — while the S2S server is processing a long LLM request
# (Hermes can take 30-90s for complex coding prompts) it may not respond
# to pings promptly. A 20s timeout killed upstream connections mid-turn,
# causing "SESSION_END not drained" on the S2S side.
_UPSTREAM_PING_INTERVAL = 15.0
_UPSTREAM_PING_TIMEOUT = 110.0


def _ws_url(s2s_url: str) -> str:
    """Convert an http(s):// S2S URL to its ws(s):// equivalent."""
    return s2s_url.replace("http://", "ws://").replace("https://", "wss://")


def create_s2s_proxy_router(auth_provider: AuthProvider) -> APIRouter:
    """Build the S2S proxy router.

    :param auth_provider: Identity provider used to authenticate the
        browser WebSocket handshake. When ``None`` (single-user/dev mode
        with no auth wired), the proxy stays open —mirroring the
        session-updates socket's behavior in the same configuration.
    :returns: A FastAPI router mounting ``/realtime`` (WebSocket) and
        ``/s2s/{path}`` (HTTP proxy).
    """
    router = APIRouter()

    @router.websocket("/realtime")
    async def proxy_realtime(websocket: WebSocket) -> None:
        """Bidirectional WebSocket proxy for the OpenAI Realtime API.

        Authenticates the browser handshake when an auth provider is
        configured, then opens a pinged upstream connection and pumps
        frames both ways until either side closes. All failures are
        logged with a reason; the browser receives a close code that
        distinguishes auth rejection (1008) from an upstream failure
        (1011) from a normal close (1000).
        """
        # ── Auth gate ───────────────────────────────────────────────
        # Mirrors terminal_attach: when auth is wired, require an
        # identity; otherwise (single-user/dev) stay open. Rejecting
        # before accept() lets Starlette send a proper 1008 close.
        if auth_provider is not None:
            user_id = auth_provider.get_user_id(websocket)
            if user_id is None:
                _logger.warning("S2S proxy: rejected unauthenticated WS handshake")
                raise WebSocketException(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason="authentication required",
                )

        s2s_url = os.environ.get("S2S_SERVER_URL", _DEFAULT_S2S_URL)
        target_url = f"{_ws_url(s2s_url)}/v1/realtime"

        await websocket.accept()

        # ── Upstream connect (bounded) ──────────────────────────────
        try:
            upstream = await asyncio.wait_for(
                websockets.connect(
                    target_url,
                    open_timeout=_UPSTREAM_CONNECT_TIMEOUT,
                    ping_interval=_UPSTREAM_PING_INTERVAL,
                    ping_timeout=_UPSTREAM_PING_TIMEOUT,
                    max_size=None,  # audio frames can be large; don't cap
                ),
                timeout=_UPSTREAM_CONNECT_TIMEOUT,
            )
        except asyncio.TimeoutError:
            _logger.warning(
                "S2S proxy: upstream connect timed out after %.1fs (%s)",
                _UPSTREAM_CONNECT_TIMEOUT,
                target_url,
            )
            await _safe_close(websocket, code=1011, reason="S2S server connect timeout")
            return
        except Exception as exc:
            _logger.warning("S2S proxy: upstream connect failed: %s", exc)
            await _safe_close(websocket, code=1011, reason="S2S server unavailable")
            return

        # ── Bidirectional pump with clean cancellation ──────────────
        # When either pump ends (peer closed or errored), gather returns
        # and we propagate the upstream close code to the browser.
        upstream_close_code: int | None = None
        upstream_close_reason: str = ""

        async def browser_to_upstream() -> None:
            """Pump browser → upstream until either side closes."""
            try:
                while True:
                    data = await websocket.receive()
                    if data.get("type") == "websocket.disconnect":
                        break
                    if "bytes" in data and data["bytes"]:
                        await upstream.send(data["bytes"])
                    elif "text" in data and data["text"]:
                        await upstream.send(data["text"])
            except WebSocketDisconnect:
                pass  # browser closed — normal
            except websockets.ConnectionClosed:
                pass  # upstream closed first — normal
            except Exception:
                _logger.exception("S2S proxy: browser→upstream pump error")

        async def upstream_to_browser() -> None:
            """Pump upstream → browser, capturing the upstream close code."""
            nonlocal upstream_close_code, upstream_close_reason
            try:
                async for msg in upstream:
                    if isinstance(msg, bytes):
                        await websocket.send_bytes(msg)
                    else:
                        await websocket.send_text(msg)
            except websockets.ConnectionClosed as exc:
                # websockets >=13 deprecated .code/.reason in favor of
                # .rcvd.code/.rcvd.reason; fall back for older versions.
                close = getattr(exc, "rcvd", None)
                if close is not None:
                    upstream_close_code = close.code
                    upstream_close_reason = close.reason or ""
                else:  # pragma: no cover — websockets <13
                    upstream_close_code = exc.code  # type: ignore[union-attr]
                    upstream_close_reason = exc.reason or ""  # type: ignore[union-attr]
            except WebSocketDisconnect:
                pass  # browser closed first
            except Exception:
                _logger.exception("S2S proxy: upstream→browser pump error")

        # Run both pumps concurrently, but stop as soon as EITHER one
        # finishes — otherwise the surviving pump blocks forever waiting
        # on a peer that already closed (classic half-close deadlock).
        b_task = asyncio.ensure_future(browser_to_upstream())
        u_task = asyncio.ensure_future(upstream_to_browser())
        done, pending = await asyncio.wait({b_task, u_task}, return_when=asyncio.FIRST_COMPLETED)
        for t in pending:
            t.cancel()
        # Surface any unexpected exceptions from the completed tasks.
        for t in done:
            exc = t.exception()
            if exc is not None and not isinstance(
                exc, (WebSocketDisconnect, websockets.ConnectionClosed)
            ):
                _logger.exception("S2S proxy: pump task error", exc_info=exc)

        # ── Coordinated teardown ────────────────────────────────────
        # Close the upstream first (idempotent), then the browser with a
        # propagated code. 1000 = normal; anything else from the upstream
        # is forwarded so the client can decide whether to reconnect.
        try:
            await upstream.close()
        except Exception:
            pass

        if upstream_close_code is not None and upstream_close_code != 1000:
            # A non-normal upstream close (restart, crash, protocol error)
            # → tell the browser so it can surface "session dropped" and
            # the client can auto-reconnect with backoff.
            await _safe_close(
                websocket,
                code=1011,
                reason=f"upstream closed ({upstream_close_code}): {upstream_close_reason}"[:123],
            )
        else:
            await _safe_close(websocket, code=1000, reason="")

    @router.api_route("/s2s/{path:path}", methods=["GET", "POST"])
    async def proxy_http(path: str, request: Request) -> Response:
        """HTTP proxy for S2S health checks and non-WebSocket endpoints."""
        s2s_url = os.environ.get("S2S_SERVER_URL", _DEFAULT_S2S_URL)
        target_url = f"{s2s_url}/{path}"

        if request.url.query:
            target_url = f"{target_url}?{request.url.query}"

        headers = dict(request.headers)
        headers.pop("host", None)
        headers.pop("content-length", None)

        body = await request.body()

        async with httpx.AsyncClient(timeout=30.0) as client:
            if request.method == "GET":
                resp = await client.get(target_url, headers=headers)
            elif request.method == "POST":
                resp = await client.post(target_url, content=body, headers=headers)
            else:
                return Response(status_code=405)

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=dict(resp.headers),
            media_type=resp.headers.get("content-type"),
        )

    return router


async def _safe_close(websocket: WebSocket, *, code: int, reason: str) -> None:
    """Close a WebSocket, swallowing the "already closed" error.

    :param websocket: The browser-side socket to close.
    :param code: WebSocket close code (1000 normal, 1008 policy, 1011
        server error, etc.).
    :param reason: Short close reason (truncated to 123 bytes by the
        protocol).
    """
    try:
        await websocket.close(code=code, reason=reason)
    except Exception:
        # Already closed by the peer — nothing to do.
        pass
