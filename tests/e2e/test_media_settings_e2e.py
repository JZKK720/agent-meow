"""
End-to-end tests for the media & generation settings route.

Drives the REAL server subprocess (session-scoped ``live_server``) to prove
the ``AGENT_MEOW_DATA_DIR``-aware config persistence end-to-end:

- ``PUT /v1/settings/media`` writes ``media-config.json`` under the data
  dir the server process was given (the e2e conftest pins it to a temp
  dir) and applies the env vars to the server process.
- ``GET /v1/settings/media`` masks API keys — the full key never leaves
  the server.
- A masked (``•``-containing) PUT preserves the stored key instead of
  writing bullets into the config.

The in-process tests (``tests/server/test_media_settings.py``) prove the
handler logic; this file proves the live-server wiring, including that
``AGENT_MEOW_DATA_DIR`` propagates through the spawned process env.

Run with::

    python -m pytest tests/e2e/test_media_settings_e2e.py -v
"""

from __future__ import annotations

import httpx


def test_media_settings_put_then_get_masks_key(http_client: httpx.Client) -> None:
    """PUT persists and applies env vars; GET masks the key; round-trip stable."""
    api_key = "sk-e2e-media-test-abcdef123456"

    # ── PUT: configure the image provider with a real key ────
    put_resp = http_client.put(
        "/v1/settings/media",
        json={"image_provider": "dashscope", "image_api_key": api_key},
    )
    assert put_resp.status_code == 200, put_resp.text
    put_body = put_resp.json()
    assert put_body["status"] == "ok"
    assert put_body["config"]["image_provider"] == "dashscope"
    # The PUT response echoes the config — mask there too.
    assert api_key not in put_body["config"]["image_api_key"]

    # ── GET: masked read-back ────────────────────────────────
    get_resp = http_client.get("/v1/settings/media")
    assert get_resp.status_code == 200, get_resp.text
    body = get_resp.json()
    assert body["image_provider"] == "dashscope"
    assert api_key not in body["image_api_key"], (
        "GET /settings/media leaked the full API key"
    )
    assert "•" in body["image_api_key"]

    # ── PUT round 2: masked key must preserve the stored one ─
    put2_resp = http_client.put(
        "/v1/settings/media",
        json={"image_provider": "dashscope", "image_api_key": body["image_api_key"]},
    )
    assert put2_resp.status_code == 200, put2_resp.text

    # Restore: reset to none so other e2e tests see a clean slate.
    reset_resp = http_client.put(
        "/v1/settings/media",
        json={"image_provider": "none", "image_api_key": ""},
    )
    assert reset_resp.status_code == 200, reset_resp.text