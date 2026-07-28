"""Voicebox proxy route — forwards browser requests to the local Voicebox TTS server.

The browser can't call Voicebox directly (http://127.0.0.1:17493) because of
CORS. This proxy routes through the agent-meow server (same origin) so the
browser's fetch calls work without CORS headers.

The VOICEBOX_URL env var overrides the default (http://127.0.0.1:17493).
"""

import os
from typing import Any

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

from agent_meow.server.auth import AuthProvider

_DEFAULT_VOICEBOX_URL = "http://127.0.0.1:17493"


def create_voicebox_router(auth_provider: AuthProvider) -> APIRouter:
    router = APIRouter()

    @router.api_route("/voicebox/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def proxy_voicebox(path: str, request: Request) -> Response:
        voicebox_url = os.environ.get("VOICEBOX_URL", _DEFAULT_VOICEBOX_URL)
        target_url = f"{voicebox_url}/{path}"

        # Forward query params
        if request.url.query:
            target_url = f"{target_url}?{request.url.query}"

        # Forward headers (except host)
        headers = dict(request.headers)
        headers.pop("host", None)
        headers.pop("content-length", None)

        # Get body
        body = await request.body()

        async with httpx.AsyncClient(timeout=30.0) as client:
            if request.method == "GET":
                resp = await client.get(target_url, headers=headers)
            elif request.method == "POST":
                resp = await client.post(target_url, content=body, headers=headers)
            elif request.method == "PUT":
                resp = await client.put(target_url, content=body, headers=headers)
            elif request.method == "DELETE":
                resp = await client.delete(target_url, headers=headers)
            else:
                return Response(status_code=405)

        # Return the response with appropriate content type
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=dict(resp.headers),
            media_type=resp.headers.get("content-type"),
        )

    return router
