"""Speech-to-speech WebSocket proxy.

Proxies the browser's WebSocket connection to the speech-to-speech server
at ws://localhost:8765/v1/realtime, so the browser connects to the agent-meow
server (same origin) instead of a cross-origin WebSocket.

The S2S_SERVER_URL env var overrides the default (http://localhost:8765).
"""

import os

import httpx
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import Response

from agent_meow.server.auth import AuthProvider

_DEFAULT_S2S_URL = "http://localhost:8765"


def create_s2s_proxy_router(auth_provider: AuthProvider) -> APIRouter:
    router = APIRouter()

    @router.websocket("/realtime")
    async def proxy_realtime(websocket: WebSocket) -> None:
        """Bidirectional WebSocket proxy for the OpenAI Realtime API."""
        s2s_url = os.environ.get("S2S_SERVER_URL", _DEFAULT_S2S_URL)
        # Convert http(s):// to ws(s)://
        ws_url = s2s_url.replace("http://", "ws://").replace("https://", "wss://")
        target_url = f"{ws_url}/v1/realtime"

        await websocket.accept()

        import websockets

        try:
            async with websockets.connect(target_url) as upstream:
                async def browser_to_upstream():
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
                        pass

                async def upstream_to_browser():
                    try:
                        while True:
                            msg = await upstream.recv()
                            if isinstance(msg, bytes):
                                await websocket.send_bytes(msg)
                            else:
                                await websocket.send_text(msg)
                    except Exception:
                        pass

                import asyncio

                await asyncio.gather(
                    browser_to_upstream(),
                    upstream_to_browser(),
                )
        except Exception:
            pass
        finally:
            try:
                await websocket.close()
            except Exception:
                pass

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
