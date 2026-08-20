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
from fastapi.responses import JSONResponse, StreamingResponse

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
        # Hermes has /v1/audio/speech (OpenAI-compatible TTS using the
        # configured provider — Edge TTS by default). It does NOT have a
        # separate /v1/audio/speech/edge endpoint. Rewrite the Edge TTS
        # route to /v1/audio/speech so Hermes handles it with its configured
        # TTS provider (Edge TTS by default).
        upstream_path = path
        is_edge_tts = path == "/v1/audio/speech/edge"
        if is_edge_tts:
            upstream_path = "/v1/audio/speech"
        target = f"{base_url}{upstream_path}"

        # Read the request body once — we need to forward it.
        body = await request.body()

        # Edge TTS request rewrite: the browser sends {input, response_format}
        # to /v1/audio/speech/edge. Hermes expects the same shape at
        # /v1/audio/speech but needs a "voice" field. The original setup uses
        # zh-CN-XiaoxiaoNeural for both English and Chinese (Xiaoxiao handles
        # both languages natively).
        if is_edge_tts and body:
            import json as _json
            try:
                payload = _json.loads(body)
                payload["voice"] = "zh-CN-XiaoxiaoNeural"
                body = _json.dumps(payload).encode()
            except (ValueError, TypeError):
                pass  # Not JSON or malformed — forward as-is.
        # Forward relevant headers, drop hop-by-hop ones and browser-specific
        # headers that Hermes's gateway may reject (origin/referer/sec-* cause
        # CORS/origin checks to fail with 403).
        _strip = frozenset({
            "host", "content-length", "transfer-encoding",
            "origin", "referer",
            "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform",
            "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest",
        })
        headers = {
            k: v
            for k, v in request.headers.items()
            if k.lower() not in _strip
        }
        # Always override Authorization with the server-side Hermes API key.
        # The browser may send a stale/wrong key from the build-time
        # VITE_HERMES_API_KEY; the running Hermes's API_SERVER_KEY may differ.
        # Remove any existing authorization header (case-insensitive) first,
        # then inject the correct one — httpx picks the first matching key,
        # so a stale lowercase ``authorization`` would shadow the new one.
        api_key = os.environ.get("HERMES_API_KEY", "")
        if api_key:
            for stale in list(headers):
                if stale.lower() == "authorization":
                    del headers[stale]
            headers["Authorization"] = f"Bearer {api_key}"

        # Long timeouts: TTS synthesis of long text can exceed 120s; SSE chat
        # streams stay open for the whole turn. No total timeout — only a
        # connect timeout — so slow generations aren't killed mid-flight.
        timeout = httpx.Timeout(None, connect=10.0)
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                # True streaming: forward SSE deltas as they arrive instead of
                # buffering the whole body (which would burst all tokens at once).
                req = client.build_request(
                    request.method,
                    target,
                    content=body,
                    headers=headers,
                    params=request.query_params,
                )
                resp = await client.send(req, stream=True)
        except httpx.ConnectError as exc:
            return JSONResponse(
                status_code=502,
                content={"error": f"Hermes gateway unreachable at {base_url}: {exc}"},
            )
        except httpx.TimeoutException as exc:
            return JSONResponse(
                status_code=504,
                content={"error": f"Hermes gateway timed out: {exc}"},
            )

        async def _stream_body():
            try:
                async for chunk in resp.aiter_bytes():
                    yield chunk
            finally:
                await resp.aclose()

        # Stream the response body back, preserving content-type.
        return StreamingResponse(
            _stream_body(),
            status_code=resp.status_code,
            headers={
                k: v
                for k, v in resp.headers.items()
                if k.lower() not in ("transfer-encoding", "content-encoding", "content-length")
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