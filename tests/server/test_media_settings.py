"""Tests for the media & generation settings router.

Covers the two load-bearing behaviors of ``media_settings.py``:

1. Config persistence honors ``AGENT_MEOW_DATA_DIR`` (the rebranded
   runtime data dir), not the legacy ``~/.omnigent`` path.
2. ``_apply_env_vars`` applies provider credentials without letting one
   side (image vs video) clobber the other's shared env var — fal for
   video and dashscope for image both map to real env vars, and a
   ``none`` side must not clear the other side's key.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import httpx
import pytest

from agent_meow.server.routes.media_settings import (
    MediaConfig,
    _apply_env_vars,
    _media_config_path,
    _save_config,
)


@pytest.fixture
def isolated_data_dir(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Pin the media config path into a temp data dir."""
    data_dir = tmp_path / "data"
    monkeypatch.setenv("AGENT_MEOW_DATA_DIR", str(data_dir))
    return data_dir


def _client() -> httpx.AsyncClient:
    from agent_meow.server.routes.media_settings import create_media_settings_router
    from fastapi import FastAPI

    app = FastAPI()
    app.include_router(create_media_settings_router(), prefix="/v1")
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    )


@pytest.mark.asyncio
async def test_media_config_persists_under_agent_meow_data_dir(
    isolated_data_dir: Path,
) -> None:
    """PUT /settings/media writes media-config.json under the data dir."""
    async with _client() as c:
        resp = await c.put(
            "/v1/settings/media",
            json={"image_provider": "dashscope", "image_api_key": "sk-test-1234567890"},
        )
    assert resp.status_code == 200, resp.text
    config_file = isolated_data_dir / "media-config.json"
    assert config_file.is_file()
    data = json.loads(config_file.read_text(encoding="utf-8"))
    assert data["image_provider"] == "dashscope"


@pytest.mark.asyncio
async def test_get_media_settings_masks_api_key(isolated_data_dir: Path) -> None:
    """GET /settings/media masks the API key (never returns it in full)."""
    async with _client() as c:
        await c.put(
            "/v1/settings/media",
            json={"image_provider": "fal", "image_api_key": "fal-key-abcdef123456"},
        )
        resp = await c.get("/v1/settings/media")
    assert resp.status_code == 200
    body = resp.json()
    assert body["image_provider"] == "fal"
    assert "fal-key-abcdef123456" not in body["image_api_key"]
    assert "•" in body["image_api_key"]


@pytest.mark.asyncio
async def test_put_preserves_masked_key(isolated_data_dir: Path) -> None:
    """PUT with a masked (•-containing) key keeps the stored value."""
    async with _client() as c:
        await c.put(
            "/v1/settings/media",
            json={"image_provider": "fal", "image_api_key": "fal-key-abcdef123456"},
        )
        resp = await c.put(
            "/v1/settings/media",
            json={"image_provider": "fal", "image_api_key": "fal-••••3456"},
        )
    assert resp.status_code == 200
    # The masked round-trip must not replace the real key with the bullets.
    stored = json.loads((isolated_data_dir / "media-config.json").read_text("utf-8"))
    assert stored["image_api_key"] == "fal-key-abcdef123456"


def test_apply_env_vars_video_side_does_not_clobber_image_key(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """image=fal + video=dashscope: both keys land in their real env vars.

    Regression guard: the shared DASHSCOPE_API_KEY mapping used to let the
    video side overwrite the image side's key (both sides wrote the same
    var regardless of which provider actually consumes it).
    """
    for var in (
        "IMAGE_GEN_PROVIDER", "FAL_KEY", "DASHSCOPE_API_KEY", "IMAGE_GEN_API_KEY",
        "VIDEO_GEN_PROVIDER", "VIDEO_GEN_API_KEY", "IMAGE_GEN_MODEL", "VIDEO_GEN_MODEL",
        "A1111_API_URL", "PIXELLE_VIDEO_URL", "HERMES_VISION_PROVIDER", "HERMES_VISION_MODEL",
    ):
        monkeypatch.delenv(var, raising=False)
    config = MediaConfig(
        image_provider="fal",
        image_api_key="fal-image-key",
        video_provider="dashscope",
        video_api_key="dash-video-key",
    )
    _apply_env_vars(config)
    assert os.environ["IMAGE_GEN_PROVIDER"] == "fal"
    assert os.environ["FAL_KEY"] == "fal-image-key"
    assert os.environ["VIDEO_GEN_PROVIDER"] == "dashscope"
    assert os.environ["DASHSCOPE_API_KEY"] == "dash-video-key"


def test_apply_env_vars_none_provider_does_not_clear_other_side(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """A ``none`` side leaves the other side's shared env var untouched."""
    monkeypatch.setenv("DASHSCOPE_API_KEY", "preexisting-key")
    config = MediaConfig(image_provider="dashscope", image_api_key="img-key")
    _apply_env_vars(config)
    assert os.environ["DASHSCOPE_API_KEY"] == "img-key"


def test_save_config_roundtrip(isolated_data_dir: Path) -> None:
    """_save_config/_load round-trips through the data-dir file."""
    from agent_meow.server.routes.media_settings import _load_config

    _save_config(MediaConfig(image_provider="hosted", image_api_key="k1", image_model="m1"))
    config = _load_config()
    assert config.image_provider == "hosted"
    assert config.image_api_key == "k1"
    assert config.image_model == "m1"