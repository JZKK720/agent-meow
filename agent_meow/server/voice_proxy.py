"""Reverse proxy for Hermes voice gateway endpoints.

In dev mode, the Vite dev server proxies /v1/audio/* to the Hermes gateway
(see web/vite.config.ts). In production (Docker / PaaS), there's no Vite —
the agent-meow server serves the SPA directly. This module adds the same
proxy as a FastAPI route so the browser's relative /v1/audio/* requests
reach Hermes in production too.

Activated when HERMES_VOICE_URL is set (the compose stack sets it to
http://hermes-gateway:8642). When unset, the routes are not mounted —
voice features simply don't work without Hermes.

Playback ownership contract
---------------------------
This proxy is the single voice dispatch point. It enforces:

- Exactly one playback owner may speak a given reply at a time (REQ-001).
- ``owner=autoplay`` for automatic assistant voiceback via
  ``/v1/audio/speech`` (REQ-003).
- ``owner=manual`` for explicit read-aloud via ``/v1/audio/speech/edge``
  (REQ-002).
- Manual read-aloud cancels active autoplay for the same message; autoplay
  is blocked while a manual playback is active for the same message.
- Structured ``voice-playback`` logs expose owner, provider, message key,
  overlap, and completion status (REQ-007).

Routing contract (matches web/vite.config.ts)
---------------------------------------------
- ``/v1/audio/transcriptions`` → **Lemonade STT** (Whisper-Large-v3-Turbo on
  NPU/GPU) when ``LEMONADE_STT_URL`` is set, else **Hermes** (faster-whisper).
- ``/v1/audio/speech`` → **Qwen3-TTS** (primary TTS for voice replies —
  reliable for zh/en, single voice Serena for prosody continuity).
- ``/v1/audio/speech/edge`` → **Hermes Edge TTS** (Xiaoxiao — manual
  read-aloud path).
- ``/v1/chat/completions`` → **Hermes**.

Qwen is the primary TTS, NOT a fallback: Hermes Edge TTS has a thread/
event-loop bug that fails for Chinese text, and Edge's Xiaoxiao voice
differs from Qwen's Serena — switching mid-reply sounded like two TTS
voices talking over each other.

See ``agent-meow-stack/origin-main-tts-handoff-plan.md`` for the full
requirements and runtime evidence.
"""

from __future__ import annotations

import asyncio
import hashlib
import itertools
import json
import logging
import os
import time
from typing import Any

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse

_router: APIRouter | None = None
_logger = logging.getLogger("uvicorn.error")

# --- Playback ownership registry (REQ-001, REQ-002, REQ-003, REQ-007) -------
_playback_counter = itertools.count(1)
_playback_lock = asyncio.Lock()
_active_playbacks: dict[str, dict[str, Any]] = {}


def _summarize_states(states: list[dict[str, Any]]) -> str:
    """Render active playback states into a compact log string."""
    return (
        ",".join(
            f"{other['owner']}:{other['provider']}:{other['request_id']}"
            for other in states
        )
        or "none"
    )


def _hermes_url() -> str | None:
    """Return the Hermes gateway base URL, or None if not configured."""
    url = os.environ.get("HERMES_VOICE_URL", "").strip()
    return url or None


def _qwen_tts_url() -> str | None:
    """Return the Qwen3-TTS fallback base URL, or None if not configured."""
    url = os.environ.get("QWEN_TTS_URL", "").strip()
    return url or None


def _qwentts_server_url() -> str | None:
    """Return the tts-server.exe (Vulkan C++ native) base URL, or None.

    When set, TTS requests route directly to the native Vulkan binary's
    OpenAI-compatible ``/v1/audio/speech`` endpoint instead of the Python
    wrapper's ``/tts`` endpoint. The native binary is more reliable on
    Windows + AMD GPU (no PyTorch/ROCm event-loop hang) and faster
    (RTF ~0.27 vs ~0.9 for the Python model).
    """
    url = os.environ.get("QWENTTS_SERVER_URL", "").strip()
    return url or None


# --- Whisper.cpp server (Vulkan/iGPU STT) ----------------------------------
#: When set, STT requests route to a whisper-server instance instead of
#: Hermes. whisper-server (from whisper.cpp, built with GGML_VULKAN=1) uses
#: the /inference endpoint (NOT OpenAI-compatible /v1/audio/transcriptions).
#: The proxy translates the route. No ``model`` field needed — the server
#: was started with a fixed model. Response format is {"text": "..."} which
#: matches the OpenAI format the browser expects.
WHISPER_SERVER_URL_ENV = "WHISPER_SERVER_URL"


def _whisper_server_url() -> str | None:
    """Return the whisper-server base URL, or None if not configured."""
    url = os.environ.get(WHISPER_SERVER_URL_ENV, "").strip()
    return url or None


# --- Lemonade STT (Whisper-Large-v3-Turbo on NPU/GPU) ----------------------
#: When set, STT requests route to the lemonade server instead of Hermes.
#: Lemonade exposes an OpenAI-compatible /v1/audio/transcriptions endpoint
#: but REQUIRES a ``model`` field (Hermes doesn't). The proxy injects it.
LEMONADE_STT_URL_ENV = "LEMONADE_STT_URL"
LEMONADE_STT_MODEL_ENV = "LEMONADE_STT_MODEL"
LEMONADE_STT_MODEL_DEFAULT = "Whisper-Large-v3-Turbo"


def _lemonade_stt_url() -> str | None:
    """Return the lemonade STT base URL, or None if not configured."""
    url = os.environ.get(LEMONADE_STT_URL_ENV, "").strip()
    return url or None


def _lemonade_stt_model() -> str:
    """Return the lemonade model id to inject into STT requests."""
    return os.environ.get(LEMONADE_STT_MODEL_ENV, "").strip() or LEMONADE_STT_MODEL_DEFAULT


def _inject_model_into_multipart(body: bytes, model: str) -> bytes:
    """Inject a ``model`` field into a multipart/form-data body.

    Lemonade's OpenAI-compatible STT endpoint requires a ``model`` field
    that Hermes's faster-whisper endpoint doesn't. The browser doesn't
    send one (it was built for Hermes), so the proxy injects it here.

    The body starts with ``--<boundary>\\r\\n`` followed by the first
    part's headers. We insert the model part's headers + value right
    after the first boundary delimiter, then add a new ``--<boundary>``
    delimiter to separate it from the original first part.

    If the body already contains a ``model`` field, it's left unchanged.
    """
    if not body or b'name="model"' in body:
        return body
    # Extract the boundary from the first line: "--<boundary>\r\n"
    first_crlf = body.find(b"\r\n")
    if first_crlf < 0:
        return body
    boundary_line = body[:first_crlf]  # e.g. b"------WebKitFormBoundary..."
    if not boundary_line.startswith(b"--"):
        return body
    boundary = boundary_line[2:].decode("ascii", errors="replace")

    # The model part: headers + value + closing boundary delimiter.
    # After the first "--boundary\r\n", we insert:
    #   Content-Disposition: form-data; name="model"\r\n\r\n
    #   <model>\r\n
    #   --boundary\r\n
    # Then the original first part's headers follow.
    model_part = (
        f'Content-Disposition: form-data; name="model"\r\n'
        f"\r\n"
        f"{model}\r\n"
        f"--{boundary}\r\n"
    ).encode()

    # Insert right after the first boundary line + CRLF.
    insert_pos = first_crlf + 2
    return body[:insert_pos] + model_part + body[insert_pos:]


# --- JSON body handling (REQ-006) ------------------------------------------
def _load_json_body(body: bytes) -> dict[str, Any] | None:
    """Parse a JSON request body, tolerating a UTF-8 BOM when present."""
    if not body:
        return None
    try:
        payload = json.loads(body.decode("utf-8-sig"))
    except (UnicodeDecodeError, ValueError, TypeError):
        return None
    if not isinstance(payload, dict):
        return None
    return payload


def _dump_json_body(payload: dict[str, Any]) -> bytes:
    """Serialize a JSON request body back to UTF-8 bytes."""
    return json.dumps(payload).encode()


def _normalize_json_body(body: bytes) -> bytes:
    """Strip a BOM from JSON request bytes while preserving the same payload."""
    payload = _load_json_body(body)
    if payload is None:
        return body
    return _dump_json_body(payload)


# --- Owner inference (REQ-001, REQ-002, REQ-003) ---------------------------
def _normalize_owner(value: Any) -> str | None:
    """Normalize owner hints into stable playback-owner values."""
    if not isinstance(value, str):
        return None
    token = value.strip().lower()
    if not token:
        return None
    if token in {
        "autoplay",
        "auto",
        "automatic",
        "framework",
        "voiceback",
        "autopilot",
    }:
        return "autoplay"
    if token in {
        "manual",
        "read-aloud",
        "read_aloud",
        "replay",
        "user",
        "session-surface",
    }:
        return "manual"
    return token


def _infer_owner(request: Request, path: str, payload: dict[str, Any] | None) -> str:
    """Infer the playback owner from explicit hints or the route contract."""
    explicit = (
        _normalize_owner(request.headers.get("x-agent-meow-playback-owner"))
        or _normalize_owner(request.headers.get("x-playback-owner"))
        or _normalize_owner(request.query_params.get("playback_owner"))
        or _normalize_owner(request.query_params.get("owner"))
    )
    if explicit:
        return explicit
    if payload is not None:
        explicit = _normalize_owner(
            payload.get("playback_owner") or payload.get("owner")
        )
        if explicit:
            return explicit
    if path == "/v1/audio/speech/edge":
        return "manual"
    if path == "/v1/audio/speech":
        return "autoplay"
    return "unknown"


def _extract_playback_text(payload: dict[str, Any] | None) -> str:
    """Return the request text when present for correlation/logging."""
    if payload is None:
        return ""
    for key in ("text", "input", "content"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return ""


def _extract_message_key(path: str, payload: dict[str, Any] | None) -> str:
    """Build a stable message key for overlap detection across owners."""
    if payload is not None:
        for key in ("message_id", "item_id", "response_id", "turn_id"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return f"{key}:{value.strip()}"
    text = _extract_playback_text(payload)
    if text:
        digest = hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
        return f"text:{digest}:{len(text)}"
    return f"route:{path}:empty"


async def _register_playback(
    *,
    owner: str,
    route: str,
    payload: dict[str, Any] | None,
    provider: str,
) -> dict[str, Any] | None:
    """Register one active playback request for overlap logging.

    Returns the playback state dict, or None if blocked by an active
    owner for the same message (caller returns 409).
    """
    request_id = f"vp-{next(_playback_counter):06d}"
    message_key = _extract_message_key(route, payload)
    text = _extract_playback_text(payload)
    voice_hint = None
    if payload is not None:
        for key in ("voice", "speaker"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                voice_hint = value.strip()
                break

    state = {
        "request_id": request_id,
        "owner": owner,
        "route": route,
        "provider": provider,
        "message_key": message_key,
        "text_length": len(text),
        "voice_hint": voice_hint,
        "started_monotonic": time.monotonic(),
        "cancel_event": asyncio.Event(),
        "cancel_reason": None,
        "cancel_requested_by": None,
    }

    blocked_by: list[dict[str, Any]] = []
    cancelled: list[dict[str, Any]] = []
    async with _playback_lock:
        overlaps = [
            other
            for other in _active_playbacks.values()
            if other["message_key"] == message_key
        ]
        # Manual-wins overlap policy (REQ-001, REQ-002, REQ-003):
        # - manual cancels active autoplay for the same message
        # - manual is blocked by an active manual for the same message
        # - autoplay is blocked by any active owner for the same message
        if owner == "manual":
            for other in overlaps:
                if other["owner"] == "autoplay":
                    other["cancel_reason"] = "manual_override"
                    other["cancel_requested_by"] = request_id
                    other["cancel_event"].set()
                    cancelled.append(other.copy())
                elif other["owner"] == "manual":
                    blocked_by.append(other.copy())
        elif owner == "autoplay":
            blocked_by.extend(other.copy() for other in overlaps)
        else:
            blocked_by.extend(
                other.copy() for other in overlaps if other["owner"] == owner
            )
        if not blocked_by:
            _active_playbacks[request_id] = state

    overlap_summary = _summarize_states([other.copy() for other in overlaps])

    if blocked_by:
        _logger.warning(
            "voice-playback blocked request_id=%s owner=%s route=%s provider=%s "
            "message_key=%s blocked_by=%s",
            request_id,
            owner,
            route,
            provider,
            message_key,
            _summarize_states(blocked_by),
        )
        return None

    for other in cancelled:
        _logger.warning(
            "voice-playback cancel request_id=%s owner=%s route=%s provider=%s "
            "reason=%s requested_by=%s requested_by_owner=%s message_key=%s",
            other["request_id"],
            other["owner"],
            other["route"],
            other["provider"],
            other.get("cancel_reason") or "manual_override",
            request_id,
            owner,
            other["message_key"],
        )

    _logger.info(
        "voice-playback start request_id=%s owner=%s route=%s provider=%s "
        "message_key=%s text_length=%s voice_hint=%s overlaps=%s",
        request_id,
        owner,
        route,
        provider,
        message_key,
        len(text),
        voice_hint or "-",
        overlap_summary,
    )
    return state


async def _finish_playback(
    state: dict[str, Any] | None,
    *,
    status: str,
    http_status: int | None = None,
    detail: str | None = None,
) -> None:
    """Remove an active playback request and emit a completion log."""
    if state is None:
        return
    duration_ms = int((time.monotonic() - state["started_monotonic"]) * 1000)
    async with _playback_lock:
        removed = _active_playbacks.pop(state["request_id"], None)
    if removed is None:
        return
    _logger.info(
        "voice-playback stop request_id=%s owner=%s route=%s provider=%s status=%s "
        "http_status=%s duration_ms=%s message_key=%s detail=%s",
        state["request_id"],
        state["owner"],
        state["route"],
        state["provider"],
        status,
        http_status if http_status is not None else "-",
        duration_ms,
        state["message_key"],
        detail or "-",
    )


# --- Qwen payload normalization --------------------------------------------
def _normalize_qwen_language(value: Any) -> str:
    """Map framework/OpenAI language hints onto Qwen's accepted names."""
    if not isinstance(value, str) or not value.strip():
        return "Auto"
    mapping = {
        "auto": "Auto",
        "zh": "Chinese",
        "zh-cn": "Chinese",
        "chinese": "Chinese",
        "en": "English",
        "en-us": "English",
        "english": "English",
        "fr": "French",
        "french": "French",
        "de": "German",
        "german": "German",
        "it": "Italian",
        "italian": "Italian",
        "ja": "Japanese",
        "japanese": "Japanese",
        "ko": "Korean",
        "korean": "Korean",
        "pt": "Portuguese",
        "portuguese": "Portuguese",
        "ru": "Russian",
        "russian": "Russian",
        "es": "Spanish",
        "spanish": "Spanish",
    }
    token = value.strip().lower()
    return mapping.get(token, value.strip())


def _normalize_qwen_speaker(value: Any, *, language: str) -> str:
    """Map framework/OpenAI voice hints onto Qwen's speaker ids."""
    if isinstance(value, str) and value.strip():
        token = value.strip().lower()
        if token in {"serena", "speaker_1"} or "xiaoxiao" in token or token.startswith("zh-"):
            return "Serena"
        if token in {
            "vivian",
            "speaker_2",
            "alloy",
            "ash",
            "coral",
            "echo",
            "fable",
            "nova",
            "onyx",
            "sage",
            "shimmer",
        } or token.startswith("en-"):
            return "Vivian"
        return value.strip()
    if language == "English":
        return "Vivian"
    return "Serena"


def _rewrite_qwen_tts_body(body: bytes) -> bytes:
    """Translate OpenAI-style TTS JSON into Qwen's ``/tts`` payload shape."""
    if not body:
        return body
    payload = _load_json_body(body)
    if payload is None:
        return body
    if isinstance(payload.get("text"), str) and payload.get("text", "").strip():
        language = _normalize_qwen_language(payload.get("language", "Auto"))
        speaker = _normalize_qwen_speaker(
            payload.get("speaker") or payload.get("voice"), language=language
        )
        return _dump_json_body(
            {"text": payload["text"], "language": language, "speaker": speaker}
        )
    input_text = payload.get("input")
    if not isinstance(input_text, str) or not input_text.strip():
        return body
    language = _normalize_qwen_language(payload.get("language", "Auto"))
    speaker = _normalize_qwen_speaker(
        payload.get("speaker") or payload.get("voice"), language=language
    )
    return _dump_json_body(
        {"text": input_text, "language": language, "speaker": speaker}
    )


def _rewrite_native_tts_body(body: bytes) -> bytes:
    """Translate to OpenAI format for tts-server.exe (Vulkan native).

    The native binary expects ``{"input": "...", "voice": "..."}`` —
    convert from the browser's ``{"text": "...", "speaker": "..."}`` or
    from the OpenAI ``{"input": "...", "voice": "..."}`` format.
    """
    if not body:
        return body
    payload = _load_json_body(body)
    if payload is None:
        return body
    # Accept both "text" and "input" as the text field.
    text = payload.get("text") or payload.get("input")
    if not isinstance(text, str) or not text.strip():
        return body
    # Accept both "speaker" and "voice" as the voice field.
    voice = payload.get("speaker") or payload.get("voice") or "Serena"
    return _dump_json_body({"input": text, "voice": voice})


def _force_edge_voice(body: bytes) -> bytes:
    """Force the Hermes Edge route to use the expected Edge voice."""
    if not body:
        return body
    payload = _load_json_body(body)
    if payload is None:
        return body
    payload["voice"] = "zh-CN-XiaoxiaoNeural"
    return _dump_json_body(payload)


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
    #   POST /v1/audio/speech          — TTS (Hermes Edge primary, Qwen fallback)
    #   POST /v1/audio/speech/edge     — Edge TTS explicit (manual read-aloud)
    #   POST /v1/chat/completions      — LLM chat (Hermes as OpenAI API)
    voice_paths = [
        "/v1/audio/transcriptions",
        "/v1/audio/speech",
        "/v1/audio/speech/stream",
        "/v1/audio/speech/edge",
        "/v1/chat/completions",
    ]

    async def _proxy(request: Request, path: str) -> Response:
        qwen_base = _qwen_tts_url()
        qwentts_native = _qwentts_server_url()
        whisper_stt = _whisper_server_url()
        lemonade_stt = _lemonade_stt_url()
        body = await request.body()
        is_edge_tts = path == "/v1/audio/speech/edge"
        is_native_tts = False

        # Routing contract (matches web/vite.config.ts):
        #   /v1/audio/transcriptions → whisper-server /inference (Vulkan iGPU)
        #                             when WHISPER_SERVER_URL is set,
        #                             else Lemonade STT when LEMONADE_STT_URL
        #                             is set, else Hermes gateway (faster-whisper).
        #   /v1/audio/speech       → Qwen3-TTS /tts (primary TTS for voice
        #                            replies — reliable for zh/en, single
        #                            voice Serena for prosody continuity).
        #   /v1/audio/speech/edge  → Hermes /v1/audio/speech (Edge TTS,
        #                            Xiaoxiao — manual read-aloud path).
        #   everything else        → Hermes gateway.
        # Qwen is the primary TTS, NOT a fallback: Hermes Edge TTS has a
        # thread/event-loop bug that fails for Chinese text, and Edge's
        # Xiaoxiao voice differs from Qwen's Serena — switching mid-reply
        # sounded like two TTS voices talking over each other.
        if path == "/v1/audio/transcriptions" and whisper_stt:
            # whisper-server uses /inference (not OpenAI-compatible path).
            # The browser already sends file + language fields which
            # whisper-server accepts directly. No model field needed.
            target = f"{whisper_stt}/inference"
            is_qwen_tts = False
        elif path == "/v1/audio/transcriptions" and lemonade_stt:
            # Lemonade STT: inject the required ``model`` field (the browser
            # doesn't send one — it was built for Hermes's faster-whisper
            # endpoint which doesn't require it). Lemonade exposes an
            # OpenAI-compatible /v1/audio/transcriptions that needs it.
            target = f"{lemonade_stt}/v1/audio/transcriptions"
            body = _inject_model_into_multipart(body, _lemonade_stt_model())
            is_qwen_tts = False
        elif path == "/v1/audio/speech" and qwentts_native:
            # Native tts-server.exe (Vulkan C++) — uses OpenAI format
            # (input/voice). Rewrite the browser's text/speaker format
            # to input/voice for the native binary.
            target = f"{qwentts_native}/v1/audio/speech"
            is_qwen_tts = False
            is_native_tts = True
        elif path == "/v1/audio/speech" and qwen_base:
            target = f"{qwen_base}/tts"
            is_qwen_tts = True
        elif path == "/v1/audio/speech/stream" and qwen_base:
            target = f"{qwen_base}/tts/stream"
            is_edge_tts = False
            is_qwen_tts = True
        else:
            upstream_path = "/v1/audio/speech" if is_edge_tts else path
            is_qwen_tts = False
            target = f"{base_url}{upstream_path}"

        # BOM-tolerant JSON normalization (REQ-006).
        if path == "/v1/audio/speech" and body:
            body = _normalize_json_body(body)
        if is_edge_tts and body:
            body = _force_edge_voice(body)
        if is_qwen_tts and body:
            body = _rewrite_qwen_tts_body(body)
        if is_native_tts and body:
            body = _rewrite_native_tts_body(body)

        payload = _load_json_body(body)

        # Register playback ownership for TTS routes (REQ-001..003, REQ-007).
        if path in {"/v1/audio/speech", "/v1/audio/speech/edge"}:
            provider = "qwen" if is_qwen_tts else "hermes-edge"
            playback_state = await _register_playback(
                owner=_infer_owner(request, path, payload),
                route=path,
                payload=payload,
                provider=provider,
            )
            if playback_state is None:
                return JSONResponse(
                    status_code=409,
                    content={
                        "error": "playback blocked by active owner for the same message"
                    },
                )

        # Forward relevant headers, drop hop-by-hop ones and browser-specific
        # headers that Hermes's gateway may reject (origin/referer/sec-* cause
        # CORS/origin checks to fail with 403).
        _strip = frozenset({
            "host",
            "content-length",
            "transfer-encoding",
            "origin",
            "referer",
            "sec-ch-ua",
            "sec-ch-ua-mobile",
            "sec-ch-ua-platform",
            "sec-fetch-site",
            "sec-fetch-mode",
            "sec-fetch-dest",
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
        # Skip for lemonade STT — it runs locally without auth.
        is_whisper_stt = path == "/v1/audio/transcriptions" and bool(whisper_stt)
        is_lemonade_stt = path == "/v1/audio/transcriptions" and bool(lemonade_stt)
        api_key = os.environ.get("HERMES_API_KEY", "")
        if api_key and not is_lemonade_stt and not is_whisper_stt:
            for stale in list(headers):
                if stale.lower() == "authorization":
                    del headers[stale]
            headers["Authorization"] = f"Bearer {api_key}"
        elif is_lemonade_stt:
            # Lemonade runs locally — strip any Hermes auth header the browser
            # or server might have attached; lemonade rejects unknown bearer
            # tokens with 401.
            for stale in list(headers):
                if stale.lower() == "authorization":
                    del headers[stale]

        # Long timeouts: TTS synthesis of long text can exceed 120s; SSE chat
        # streams stay open for the whole turn. No total timeout — only a
        # connect timeout — so slow generations aren't killed mid-flight.
        # trust_env=False: never route localhost upstream calls through the
        # system proxy (WinINET/xray) — it intermittently drops them.
        timeout = httpx.Timeout(None, connect=10.0)
        client = httpx.AsyncClient(timeout=timeout, trust_env=False)
        try:
            req = client.build_request(
                request.method,
                target,
                content=body,
                headers=headers,
                params=request.query_params,
            )
            resp = await client.send(req, stream=True)
        except httpx.ConnectError as exc:
            await client.aclose()
            await _finish_playback(
                playback_state, status="error", http_status=502,
                detail=f"upstream unreachable: {exc}",
            )
            return JSONResponse(
                status_code=502,
                content={"error": f"Voice gateway unreachable at {target}: {exc}"},
            )
        except httpx.TimeoutException as exc:
            await client.aclose()
            await _finish_playback(
                playback_state, status="error", http_status=504,
                detail=f"upstream timed out: {exc}",
            )
            return JSONResponse(
                status_code=504,
                content={"error": f"Voice gateway timed out: {exc}"},
            )
        except Exception:
            await client.aclose()
            raise

        async def _stream_body():
            try:
                async for chunk in resp.aiter_bytes():
                    yield chunk
            finally:
                await resp.aclose()
                await client.aclose()
                await _finish_playback(
                    playback_state, status="completed", http_status=resp.status_code
                )

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