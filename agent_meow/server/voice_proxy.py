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
- ``/v1/audio/transcriptions`` → **whisper-server** (whisper.cpp with
  Vulkan iGPU) when ``WHISPER_STT_URL`` is set, else **Hermes**
  (faster-whisper).
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
WHISPER_STT_URL_ENV = "WHISPER_STT_URL"


def _whisper_server_url() -> str | None:
    """Return the whisper-server base URL, or None if not configured."""
    url = os.environ.get(WHISPER_STT_URL_ENV, "").strip()
    return url or None


# --- Lemonade STT (Whisper-Large-v3-Turbo on NPU/GPU) ----------------------
# REMOVED: Lemonade STT has been retired. STT now routes to whisper-server
# (WHISPER_STT_URL) or falls back to Hermes (HERMES_VOICE_URL). The
# lemonade-specific ``model`` field injection was only needed by lemonade's
# OpenAI-compatible endpoint; whisper-server and Hermes don't require it.


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

    Also replaces commas/semicolons (both fullwidth and ASCII) with
    periods — the native tts-server hangs for 46s producing 7.8MB audio
    when commas/semicolons appear between short Chinese text segments.
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
    # Replace commas/semicolons with periods — tts-server.exe hangs on them.
    # Fullwidth: ，(U+FF0C) ；(U+FF1B)  ASCII: , ;
    text = text.replace("\uff0c", "\u3002").replace(",", "\u3002")
    text = text.replace("\uff1b", "\u3002").replace(";", "\u3002")
    # Collapse consecutive periods.
    while "\u3002\u3002" in text:
        text = text.replace("\u3002\u3002", "\u3002")
    # Accept both "speaker" and "voice" as the voice field.
    voice = payload.get("speaker") or payload.get("voice") or "Serena"
    # Request WAV format (RIFF container) instead of the default raw PCM
    # stream — the browser's decodeAudioData needs a container format
    # (WAV/MP3) and cannot decode raw s16le PCM bytes directly.
    # temperature=0 selects greedy decoding in tts-server.exe (argmax only,
    # no sampling) — matches the Python wrapper's GREEDY_MODE=True for
    # deterministic output: no random laughs, breaths, or prosody shifts.
    return _dump_json_body({
        "input": text,
        "voice": voice,
        "response_format": "wav",
        "temperature": 0,
    })


def _force_edge_voice(body: bytes) -> bytes:
    """Force the Hermes Edge route to use the expected Edge voice."""
    if not body:
        return body
    payload = _load_json_body(body)
    if payload is None:
        return body
    payload["voice"] = "zh-CN-XiaoxiaoNeural"
    return _dump_json_body(payload)


#: OpenAPI summaries for the proxied voice routes — the schema consumers
#: (the SPA's /docs page and external webhook clients) need real titles;
#: bare handler names collapsed to a single " H" entry per route.
_ROUTE_SUMMARIES: dict[str, str] = {
    "/v1/audio/transcriptions": "Speech-to-text (VAD-segmented WAV)",
    "/v1/audio/speech": "Text-to-speech (voice replies)",
    "/v1/audio/speech/stream": "Text-to-speech (streaming)",
    "/v1/audio/speech/edge": "Edge TTS (manual read-aloud)",
    "/v1/chat/completions": "Chat completions (Hermes LLM)",
}

#: Longer descriptions for the two routes whose contract matters most.
_ROUTE_DESCRIPTIONS: dict[str, str] = {
    "/v1/audio/transcriptions": (
        "Multipart upload of a 16 kHz mono WAV segmented by the browser "
        "Silero VAD. Routed to whisper-server when WHISPER_STT_URL is set, "
        'else the Hermes gateway. Returns the OpenAI shape {"text": ...}. '
        "The mic is only captured after an explicit user gesture (paw/mic "
        "click); wake-word detection is a mode of that same VAD stream."
    ),
    "/v1/audio/speech": (
        "OpenAI-format {input, voice} TTS. Primary: Hermes Edge TTS; "
        "falls back to Qwen3-TTS when Hermes is unreachable."
    ),
}


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
    #   POST /v1/audio/transcriptions  — STT (whisper-server or Hermes)
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
        body = await request.body()
        is_edge_tts = path == "/v1/audio/speech/edge"
        is_native_tts = False
        # Initialize playback_state for ALL routes — the error handlers
        # at the bottom of this function reference it, but it was only
        # set inside the TTS routing block. STT routes hit the error
        # path with an unbound variable → UnboundLocalError → 500.
        playback_state = None

        # Routing contract (matches web/vite.config.ts):
        #   /v1/audio/transcriptions → whisper-server /inference (Vulkan iGPU)
        #                             when WHISPER_STT_URL is set,
        #                             else Hermes gateway (faster-whisper).
        #   /v1/audio/speech       → Hermes Edge TTS (primary, online,
        #                            Xiaoxiao voice — tested for quality
        #                            and accuracy);
        #                            falls back to tts-server.exe (Qwen3-TTS
        #                            Serena, Vulkan GPU) when Hermes is
        #                            unreachable.
        #   /v1/audio/speech/edge  → Hermes /v1/audio/speech (Edge TTS,
        #                            Xiaoxiao — manual read-aloud path).
        #   everything else        → Hermes gateway.
        # Edge TTS is primary (quality/accuracy verified); Qwen3-TTS is
        # the offline fallback (local GPU, Serena voice) when Edge is down.
        fallback_target: str | None = None
        if path == "/v1/audio/transcriptions" and whisper_stt:
            # whisper-server uses /inference (not OpenAI-compatible path).
            # The browser already sends file + language fields which
            # whisper-server accepts directly. No model field needed.
            # Check if whisper-server is actually reachable; if not,
            # fall through to Hermes gateway (faster-whisper) so STT
            # doesn't hard-fail when whisper-server isn't running.
            try:
                async with httpx.AsyncClient(timeout=2.0) as probe:
                    await probe.get(f"{whisper_stt}/health")
                target = f"{whisper_stt}/inference"
            except (httpx.HTTPError, OSError):
                _logger.warning(
                    "whisper-server at %s unreachable — falling back to Hermes STT",
                    whisper_stt,
                )
                target = f"{_hermes_url()}/v1/audio/transcriptions"
            is_qwen_tts = False
        elif path == "/v1/audio/speech" and qwentts_native and not is_edge_tts:
            # Hermes Edge TTS (Xiaoxiao) is the PRIMARY TTS — tested for
            # quality and accuracy. Qwen3-TTS (Serena, Vulkan GPU) is the
            # OFFLINE FALLBACK when Hermes is unreachable.
            # Route to Hermes first; if Hermes is unreachable, the
            # fallback in the exception handler retries against
            # tts-server.exe.
            fallback_target = f"{qwentts_native}/v1/audio/speech"
            upstream_path = "/v1/audio/speech"
            is_qwen_tts = False
            target = f"{base_url}{upstream_path}"
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
        # Save the original (pre-transformation) body so the offline
        # fallback can rewrite it for tts-server.exe without inheriting
        # Edge TTS transformations (e.g. _force_edge_voice overwrites
        # "voice" to XiaoxiaoNeural, which would shadow "speaker": Serena).
        original_body = body
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
        # Initialize to None for non-TTS routes (STT, chat) so the exception
        # handlers and _stream_body below can reference it unconditionally
        # without a NameError — the closure would otherwise capture an
        # unbound variable when the if-block is skipped.
        playback_state = None
        if path in {"/v1/audio/speech", "/v1/audio/speech/edge"}:
            provider = "qwen" if is_qwen_tts else "hermes-edge"
            if is_native_tts:
                # Skip playback ownership for native tts-server.exe — it
                # handles its own concurrency via --max-batch, and the
                # ownership system can leave stale entries that block
                # subsequent requests with the same text (409 Conflict).
                playback_state = None
            else:
                playback_state = await _register_playback(
                    owner=_infer_owner(request, path, payload),
                    route=path,
                    payload=payload,
                    provider=provider,
                )
            if playback_state is None and not is_native_tts:
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
        # Skip for whisper-server STT — it runs locally without auth.
        # NOTE: is_whisper_stt is only True when we're ACTUALLY routing to
        # whisper-server (target ends with /inference). When whisper-server
        # is down and we fell back to Hermes, the API key IS needed.
        is_whisper_stt = target.endswith("/inference")
        api_key = os.environ.get("HERMES_API_KEY", "")
        if api_key and not is_whisper_stt:
            for stale in list(headers):
                if stale.lower() == "authorization":
                    del headers[stale]
            headers["Authorization"] = f"Bearer {api_key}"

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
            # If Hermes returned a 5xx (Edge TTS failed inside Hermes),
            # treat it like a connection failure and retry against the
            # fallback. This covers "Hermes is up but Edge TTS can't
            # reach the internet" — the most common offline scenario.
            if (
                fallback_target is not None
                and resp.status_code >= 500
                and path == "/v1/audio/speech"
            ):
                _logger.warning(
                    "TTS primary returned HTTP %d; falling back to Qwen3-TTS at %s",
                    resp.status_code, fallback_target,
                )
                await resp.aclose()
                await client.aclose()
                if playback_state is not None:
                    await _finish_playback(
                        playback_state, status="error", http_status=resp.status_code,
                        detail=f"primary TTS returned {resp.status_code}, falling back",
                    )
                    playback_state = None
                fallback_body = original_body
                if fallback_body:
                    fallback_body = _normalize_json_body(fallback_body)
                    fallback_body = _rewrite_native_tts_body(fallback_body)
                fallback_client = httpx.AsyncClient(
                    timeout=httpx.Timeout(None, connect=10.0), trust_env=False,
                )
                try:
                    fallback_req = fallback_client.build_request(
                        request.method,
                        fallback_target,
                        content=fallback_body,
                        headers={
                            k: v for k, v in headers.items()
                            if k.lower() not in ("authorization",)
                        },
                        params=request.query_params,
                    )
                    resp = await fallback_client.send(fallback_req, stream=True)
                    client = fallback_client
                    is_native_tts = True
                except (httpx.ConnectError, httpx.TimeoutException) as fallback_exc:
                    await fallback_client.aclose()
                    return JSONResponse(
                        status_code=502,
                        content={"error": f"All TTS backends unreachable: {fallback_exc}"},
                    )
        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            await client.aclose()
            # Offline fallback: if Hermes Edge TTS (primary) failed,
            # retry against Qwen3-TTS (tts-server.exe, local GPU).
            # This handles the "Edge TTS needs internet, machine is
            # offline" case — the browser gets audio via Qwen3-TTS
            # (Serena voice) instead.
            if fallback_target is not None:
                _logger.warning(
                    "TTS primary (%s) failed (%s); falling back to Qwen3-TTS at %s",
                    target, exc, fallback_target,
                )
                # Clean up the primary's playback entry so it doesn't
                # block the next request with the same text (409 Conflict).
                if playback_state is not None:
                    await _finish_playback(
                        playback_state, status="error", http_status=502,
                        detail=f"primary TTS failed, falling back: {exc}",
                    )
                    playback_state = None
                # Rewrite the body for the native tts-server.exe format
                # (input/voice instead of text/speaker). Use the
                # original body (before Edge TTS transformations) so
                # the speaker field (Serena) is preserved.
                fallback_body = original_body
                if path == "/v1/audio/speech" and fallback_body:
                    fallback_body = _normalize_json_body(fallback_body)
                    fallback_body = _rewrite_native_tts_body(fallback_body)
                fallback_client = httpx.AsyncClient(
                    timeout=httpx.Timeout(None, connect=10.0), trust_env=False,
                )
                try:
                    fallback_req = fallback_client.build_request(
                        request.method,
                        fallback_target,
                        content=fallback_body,
                        headers={
                            k: v for k, v in headers.items()
                            if k.lower() not in ("authorization",)
                        },
                        params=request.query_params,
                    )
                    resp = await fallback_client.send(fallback_req, stream=True)
                    # Swap client so _stream_body closes the right one.
                    client = fallback_client
                    is_native_tts = True
                    playback_state = None  # native TTS skips playback ownership
                except (httpx.ConnectError, httpx.TimeoutException) as fallback_exc:
                    await fallback_client.aclose()
                    await _finish_playback(
                        playback_state, status="error", http_status=502,
                        detail=f"both primary and fallback TTS unreachable: {fallback_exc}",
                    )
                    return JSONResponse(
                        status_code=502,
                        content={"error": f"All TTS backends unreachable: {fallback_exc}"},
                    )
            else:
                if isinstance(exc, httpx.TimeoutException):
                    await _finish_playback(
                        playback_state, status="error", http_status=504,
                        detail=f"upstream timed out: {exc}",
                    )
                    return JSONResponse(
                        status_code=504,
                        content={"error": f"Voice gateway timed out: {exc}"},
                    )
                await _finish_playback(
                    playback_state, status="error", http_status=502,
                    detail=f"upstream unreachable: {exc}",
                )
                return JSONResponse(
                    status_code=502,
                    content={"error": f"Voice gateway unreachable at {target}: {exc}"},
                )
        except Exception:
            await client.aclose()
            raise

        async def _stream_body():
            try:
                total_bytes = 0
                # Guard against TTS model hallucination: the Qwen3-TTS model
                # intermittently generates extremely long audio (7.8MB / ~163s)
                # for short text input. Normal output is ~10KB per character
                # of Chinese text (~0.2s audio per char at 24kHz mono s16).
                # Cap at 15KB per input character (1.5x normal headroom) with
                # a floor of 100KB and ceiling of 2MB. This catches the
                # hallucination (7.8MB for 12 chars) while allowing normal
                # long text (40 chars → 600KB cap).
                if is_native_tts and payload:
                    _input_len = len(
                        payload.get("text", "") or payload.get("input", "")
                    )
                    _max_bytes = max(102_400, min(_input_len * 15_360, 2_097_152))
                else:
                    _max_bytes = None
                async for chunk in resp.aiter_bytes():
                    total_bytes += len(chunk)
                    if _max_bytes and total_bytes > _max_bytes:
                        _logger.warning(
                            "voice-playback TTS hallucination guard: "
                            "truncated at %d bytes (text was %d chars)",
                            total_bytes,
                            len(payload.get("text", "") or payload.get("input", "")) if payload else 0,
                        )
                        break
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
        # OpenAPI docs: the schema consumers (the SPA's /docs page and
        # external webhook clients) need real summaries — bare handler
        # names collapsed to a single " H" entry for every voice route.
        summary = _ROUTE_SUMMARIES.get(path, "Voice proxy")
        description = _ROUTE_DESCRIPTIONS.get(path)
        router.add_api_route(
            path,
            _make_handler(path),
            methods=["POST"],
            name=summary,
            summary=summary,
            description=description,
        )

    _router = router
    return router