"""Media & Generation settings router.

Provides GET/PUT /v1/settings/media for configuring image generation,
video generation, and vision providers. The config is persisted to
``~/.omnigent/media-config.json`` and the env vars are applied to the
running process so the runner picks them up.

This is the user-facing alternative to setting DASHSCOPE_API_KEY,
FAL_KEY, IMAGE_GEN_PROVIDER, etc. as environment variables — end-users
configure providers through the Settings → Media & Generation UI.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.server.auth import AuthProvider
from agent_meow.server.routes._auth_helpers import get_user_id

logger = logging.getLogger(__name__)

_MEDIA_CONFIG_PATH = Path.home() / ".omnigent" / "media-config.json"

# Env var mapping: config field → env var name.
_ENV_MAP = {
    "image_provider": "IMAGE_GEN_PROVIDER",
    "image_api_key": "DASHSCOPE_API_KEY",  # shared between image/video if same provider
    "image_api_url": "A1111_API_URL",
    "image_model": "IMAGE_GEN_MODEL",
    "video_provider": "VIDEO_GEN_PROVIDER",
    "video_api_key": "DASHSCOPE_API_KEY",  # shared
    "video_api_url": "PIXELLE_VIDEO_URL",
    "video_model": "VIDEO_GEN_MODEL",
    "vision_provider": "HERMES_VISION_PROVIDER",
    "vision_model": "HERMES_VISION_MODEL",
}

# When image_provider is "fal", the API key maps to FAL_KEY instead.
_PROVIDER_KEY_MAP = {
    "fal": "FAL_KEY",
    "dashscope": "DASHSCOPE_API_KEY",
    "hosted": "IMAGE_GEN_API_KEY",
}


class MediaConfig(BaseModel):
    """Media & generation provider configuration."""

    image_provider: str = "none"
    image_api_key: str = ""
    image_api_url: str = ""
    image_model: str = ""
    video_provider: str = "none"
    video_api_key: str = ""
    video_api_url: str = ""
    video_model: str = ""
    vision_provider: str = "none"
    vision_model: str = ""


def _load_config() -> MediaConfig:
    """Load media config from disk, or return defaults."""
    if not _MEDIA_CONFIG_PATH.exists():
        return MediaConfig()
    try:
        data = json.loads(_MEDIA_CONFIG_PATH.read_text(encoding="utf-8"))
        return MediaConfig(**data)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to load media config: %s", exc)
        return MediaConfig()


def _save_config(config: MediaConfig) -> None:
    """Save media config to disk."""
    _MEDIA_CONFIG_PATH.parent.mkdir(parents=True, exist_ok=True)
    _MEDIA_CONFIG_PATH.write_text(
        config.model_dump_json(indent=2), encoding="utf-8"
    )


def _apply_env_vars(config: MediaConfig) -> None:
    """Apply config values as env vars so the runner picks them up."""
    data = config.model_dump()

    # Image provider env vars.
    if data["image_provider"] != "none":
        os.environ["IMAGE_GEN_PROVIDER"] = data["image_provider"]
        if data["image_api_key"]:
            key_env = _PROVIDER_KEY_MAP.get(data["image_provider"], "IMAGE_GEN_API_KEY")
            os.environ[key_env] = data["image_api_key"]
        if data["image_api_url"]:
            os.environ["A1111_API_URL"] = data["image_api_url"]
        if data["image_model"]:
            os.environ["IMAGE_GEN_MODEL"] = data["image_model"]

    # Video provider env vars.
    if data["video_provider"] != "none":
        os.environ["VIDEO_GEN_PROVIDER"] = data["video_provider"]
        if data["video_api_key"]:
            key_env = _PROVIDER_KEY_MAP.get(data["video_provider"], "VIDEO_GEN_API_KEY")
            os.environ[key_env] = data["video_api_key"]
        if data["video_api_url"]:
            os.environ["PIXELLE_VIDEO_URL"] = data["video_api_url"]
        if data["video_model"]:
            os.environ["VIDEO_GEN_MODEL"] = data["video_model"]

    # Vision env vars (read by Hermes gateway config, not agent-meow directly).
    if data["vision_provider"] != "none":
        os.environ["HERMES_VISION_PROVIDER"] = data["vision_provider"]
        if data["vision_model"]:
            os.environ["HERMES_VISION_MODEL"] = data["vision_model"]


def create_media_settings_router(
    auth_provider: AuthProvider | None = None,
) -> APIRouter:
    """Build the media settings router.

    :returns: A configured :class:`APIRouter` with GET/PUT /settings/media.
    """
    router = APIRouter()

    @router.get("/settings/media")
    async def get_media_settings(request: Request) -> dict[str, Any]:
        """Get the current media & generation configuration."""
        # Auth: any authenticated user can read.
        get_user_id(request, auth_provider)
        config = _load_config()
        # Don't expose API keys in full — mask them.
        data = config.model_dump()
        for key_field in ("image_api_key", "video_api_key"):
            if data[key_field]:
                val = data[key_field]
                data[key_field] = val[:4] + "•" * (len(val) - 8) + val[-4:] if len(val) > 8 else "•" * len(val)
        return data

    @router.put("/settings/media")
    async def put_media_settings(request: Request) -> dict[str, Any]:
        """Update the media & generation configuration.

        Applies the config to env vars immediately and persists to disk.
        The runner picks up the env vars on the next tool dispatch.
        """
        get_user_id(request, auth_provider)
        body = await request.json()
        # If API key fields are masked (contain •), preserve the existing value.
        existing = _load_config()
        for key_field in ("image_api_key", "video_api_key"):
            val = body.get(key_field, "")
            if "•" in val:
                body[key_field] = existing.model_dump()[key_field]
        config = MediaConfig(**body)
        _save_config(config)
        _apply_env_vars(config)
        logger.info("Media settings updated: image=%s video=%s vision=%s",
                     config.image_provider, config.video_provider, config.vision_provider)
        return {"status": "ok", "config": config.model_dump()}

    return router