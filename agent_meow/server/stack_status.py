"""First-boot stack status endpoint: GET /v1/stack/status.

Aggregates the health of the components the Docker quickstart stack
depends on, so the web UI can show a first-boot checklist:

- agent-meow server itself (always ok — it's answering)
- Hermes gateway reachability (via HERMES_VOICE_URL)
- Ollama model availability (via the Hermes gateway's model list, or
  OLLAMA_BASE_URL directly when Hermes is external)

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


@router.get("/v1/stack/status")
async def stack_status() -> dict[str, object]:
    """Aggregate stack health for the first-boot checklist.

    :returns: ``{"server": "ok", "hermes": {...}, "ollama": {...}}`` —
        always HTTP 200; per-component status objects carry their own
        ``status`` field (``ok`` / ``down`` / ``unconfigured`` /
        ``auth_error`` / ``no_model`` / ``empty``).
    """
    async with httpx.AsyncClient(timeout=_PROBE_TIMEOUT) as client:
        hermes = await _check_hermes(client)
        ollama = await _check_ollama(client)
    return {
        "server": "ok",
        "hermes": hermes,
        "ollama": ollama,
    }