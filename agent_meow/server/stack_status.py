"""First-boot stack status endpoint: GET /v1/stack/status.

Aggregates the health of the components the Docker quickstart stack
depends on, so the web UI can show a first-boot checklist:

- agent-meow server itself (always ok — it's answering)
- Hermes gateway reachability (via HERMES_VOICE_URL)
- Ollama model availability (via the Hermes gateway's model list, or
  OLLAMA_BASE_URL directly when Hermes is external)
- Lemonade STT (optional — Whisper-Large-v3-Turbo on NPU/GPU via
  LEMONADE_STT_URL). When configured, STT routes to lemonade instead
  of Hermes's faster-whisper; the checklist shows its model status.

Each check is best-effort with a short timeout: a slow or missing
component degrades its own row, never the whole endpoint. The endpoint
always returns 200 with per-component status so the UI can render a
partial checklist while the stack is still coming up.
"""

from __future__ import annotations

import logging
import os

import httpx
from fastapi import APIRouter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["stack-status"])

# Short timeouts: this is a status probe, not a data path. A component
# that takes longer than this to answer its health endpoint is "down"
# from the checklist's perspective. The Hermes read timeout is generous
# (20s) because a 1-token completion on a cold model can take ~10s —
# flagging a healthy-but-slow gateway as "down" on first boot defeats
# the checklist's purpose.
_PROBE_TIMEOUT = httpx.Timeout(20.0, connect=3.0)


def _hermes_url() -> str | None:
    url = os.environ.get("HERMES_VOICE_URL", "").strip()
    return url or None


def _lemonade_url() -> str | None:
    """Return the lemonade STT base URL, or None if not configured."""
    url = os.environ.get("LEMONADE_STT_URL", "").strip()
    return url or None


async def _check_hermes(client: httpx.AsyncClient) -> dict[str, object]:
    """Probe the Hermes gateway's chat endpoint with a 1-token request.

    A real (tiny) completion verifies the full path: gateway up, auth
    accepted, and a model behind it. A bare /health would miss auth and
    model-availability failures that only surface on actual calls.
    """
    base = _hermes_url()
    if not base:
        return {"status": "unconfigured", "detail": "HERMES_VOICE_URL not set"}
    api_key = os.environ.get("HERMES_API_KEY", "")
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    try:
        resp = await client.post(
            f"{base}/v1/chat/completions",
            json={
                "model": "hermes-agent",
                "messages": [{"role": "user", "content": "hi"}],
                "max_tokens": 1,
            },
            headers=headers,
        )
    except httpx.HTTPError as exc:
        return {"status": "down", "detail": str(exc)}
    if resp.status_code == 401:
        return {"status": "auth_error", "detail": "API key rejected"}
    if resp.status_code >= 500:
        return {"status": "down", "detail": f"HTTP {resp.status_code}"}
    if resp.status_code == 404:
        # Model not found — gateway is up but no model is loaded.
        return {"status": "no_model", "detail": "gateway up, model missing"}
    return {"status": "ok"}


async def _check_ollama(client: httpx.AsyncClient) -> dict[str, object]:
    """List models via the Hermes gateway's OpenAI-compatible endpoint.

    Returns the model count so the checklist can show "N models ready"
    vs "pulling models...". When Hermes is external (override file),
    the probe goes through the same gateway — one URL, one auth path.
    """
    base = _hermes_url()
    if not base:
        return {"status": "unconfigured", "detail": "HERMES_VOICE_URL not set"}
    api_key = os.environ.get("HERMES_API_KEY", "")
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
    try:
        resp = await client.get(f"{base}/v1/models", headers=headers)
    except httpx.HTTPError as exc:
        return {"status": "down", "detail": str(exc)}
    if resp.status_code != 200:
        return {"status": "down", "detail": f"HTTP {resp.status_code}"}
    try:
        models = resp.json().get("data", [])
    except ValueError:
        return {"status": "down", "detail": "invalid model list response"}
    names = [m.get("id", "?") for m in models]
    if not names:
        return {"status": "empty", "detail": "no models pulled yet", "models": []}
    return {"status": "ok", "models": names, "count": len(names)}


async def _check_lemonade_stt(client: httpx.AsyncClient) -> dict[str, object]:
    """Probe the lemonade STT server's model list.

    Lemonade exposes an OpenAI-compatible ``/v1/models`` endpoint.
    When configured (``LEMONADE_STT_URL``), STT routes to lemonade
    instead of Hermes's faster-whisper. The checklist shows whether
    the Whisper-Large-v3-Turbo model is loaded and ready.

    Returns ``unconfigured`` when ``LEMONADE_STT_URL`` is not set —
    this is NOT an error; it means STT falls back to Hermes.
    """
    base = _lemonade_url()
    if not base:
        return {"status": "unconfigured", "detail": "LEMONADE_STT_URL not set — STT uses Hermes"}
    try:
        resp = await client.get(f"{base}/v1/models")
    except httpx.HTTPError as exc:
        return {"status": "down", "detail": str(exc)}
    if resp.status_code != 200:
        return {"status": "down", "detail": f"HTTP {resp.status_code}"}
    try:
        models = resp.json().get("data", [])
    except ValueError:
        return {"status": "down", "detail": "invalid model list response"}
    # Look for the Whisper model (or any transcription-labeled model).
    whisper_models = [
        m for m in models
        if "whisper" in m.get("id", "").lower()
        or "transcription" in str(m.get("labels", [])).lower()
    ]
    if not whisper_models:
        return {"status": "no_model", "detail": "no Whisper model found", "models": [m.get("id", "?") for m in models]}
    model_id = whisper_models[0].get("id", "?")
    downloaded = whisper_models[0].get("downloaded", False)
    if not downloaded:
        return {"status": "empty", "detail": f"{model_id} not downloaded yet", "model": model_id}
    return {"status": "ok", "model": model_id, "models": [m.get("id", "?") for m in models]}


def _tts_url() -> str | None:
    """Return the Qwen3-TTS wrapper base URL, or None if not configured."""
    url = os.environ.get("QWEN_TTS_URL", "").strip()
    return url or None


async def _check_tts(client: httpx.AsyncClient) -> dict[str, object]:
    """Probe the Qwen3-TTS wrapper health endpoint.

    Returns ``unconfigured`` when ``QWEN_TTS_URL`` is not set —
    this is NOT an error; it means TTS is not available.
    """
    base = _tts_url()
    if not base:
        return {"status": "unconfigured", "detail": "QWEN_TTS_URL not set"}
    try:
        resp = await client.get(f"{base}/health")
    except httpx.HTTPError as exc:
        return {"status": "down", "detail": str(exc)}
    if resp.status_code >= 500:
        return {"status": "down", "detail": f"HTTP {resp.status_code}"}
    if resp.status_code == 404:
        return {"status": "down", "detail": "TTS health endpoint not found"}
    return {"status": "ok", "detail": "TTS wrapper responding"}


@router.get("/v1/stack/status")
async def stack_status() -> dict[str, object]:
    """Aggregate stack health for the first-boot checklist.

    :returns: ``{"server": "ok", "hermes": {...}, "ollama": {...},
        "lemonade_stt": {...}, "tts": {...}, "services": [...]}`` —
        always HTTP 200; per-component status objects carry their own
        ``status`` field (``ok`` / ``down`` / ``unconfigured`` / ``auth_error`` /
        ``no_model`` / ``empty``). The ``services`` array carries process-level
        metrics (PID, uptime, restart count) from the service supervisor.
        ``empty``).
    """
    async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT) as client:
        hermes = await _check_hermes(client)
        ollama = await _check_ollama(client)
        lemonade_stt = await _check_lemonade_stt(client)
        tts = await _check_tts(client)

    # Collect process-level metrics from the service supervisor (Layer 2).
    # Best-effort: if the supervisor isn't wired (e.g. dev mode without the
    # lifespan wiring), services is an empty list.
    services: list[dict[str, object]] = []
    try:
        from starlette.requests import Request
        from agent_meow.server.app import _get_service_supervisor_status
        services = _get_service_supervisor_status()
    except Exception:
        pass

    return {
        "server": "ok",
        "hermes": hermes,
        "ollama": ollama,
        "lemonade_stt": lemonade_stt,
        "tts": tts,
        "services": services,
    }