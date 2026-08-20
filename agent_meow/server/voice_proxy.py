"""Reverse proxy for Hermes voice gateway endpoints.

In dev mode, the Vite dev server proxies /v1/audio/* to the Hermes gateway
(see web/vite.config.ts). In production (Docker / PaaS), there's no Vite —
the agent-meow server serves the SPA directly. This module adds the same
proxy as a FastAPI route so the browser's relative /v1/audio/* requests
reach Hermes in production too.

Activated when HERMES_VOICE_URL is set (the compose stack sets it to
http://hermes-gateway:8642). When unset, the routes are not mounted —
voice features simply don't work without Hermes.
"""

from __future__ import annotations

import os
from typing import Any

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import StreamingResponse

_router: APIRouter | None = None


def _hermes_url() -> str | None:
    """Return the Hermes gateway base URL, or None if not configured."""
    url = os.environ.get("HERMES_VOICE_URL", "").strip()
    return url or None


def get_voice_proxy_router() -> APIRouter | None:
    """Build (once) and return the voice proxy router, or None if no Hermes URL."""
    global _router
    if _router is not None:
        return _router

    base_url = _hermes_url()
    if not base_url:
        return None

    router = APIRouter(tags=["voice-proxy"])

    # Endpoints the browser calls (relative URLs served by the SPA):
    #   POST /v1/audio/transcriptions  — STT (faster-whisper)
    #   POST /v1/audio/speech          — TTS (Edge TTS via Hermes)
    #   POST /v1/audio/speech/edge     — Edge TTS explicit
    #   POST /v1/chat/completions      — LLM chat (Hermes as OpenAI API)
    #
    # We forward all of them to the Hermes gateway, streaming the response
    # body back so large audio / SSE chat deltas pass through untouched.
    voice_paths = [
        "/v1/audio/transcriptions",
        "/v1/audio/speech",
        "/v1/audio/speech/edge",
        "/v1/chat/completions",
    ]

    async def _proxy(request: Request, path: str) -> Response:
        target = f"{base_url}{path}"
        # Read the request body once — we need to forward it.
        body = await request.body()
        # Forward relevant headers, drop hop-by-hop ones.
        headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in ("host", "content-length", "transfer-encoding")
        }
        # Hermes expects the Authorization header (Bearer <API_SERVER_KEY>).
        # The browser sends it via the hermesVoice client, so it's already
        # in the forwarded headers.

        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0)) as client:
            resp = await client.request(
                request.method,
                target,
                content=body,
                headers=headers,
                params=request.query_params,
            )
        # Stream the response body back, preserving content-type.
        return StreamingResponse(
            iter([resp.content]),
            status_code=resp.status_code,
            headers={
                k: v
                for k, v in resp.headers.items()
                if k.lower() not in ("transfer-encoding", "content-encoding")
            },
            media_type=resp.headers.get("content-type"),
        )

    for path in voice_paths:
        # Capture path in closure correctly.
        def _make_handler(p: str) -> Any:
            async def _h(request: Request) -> Response:
                return await _proxy(request, p)
            return _h
        router.add_api_route(path, _make_handler(path), methods=["POST"])

    _router = router
    return router