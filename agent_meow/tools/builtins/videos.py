"""Video tools (``video_*``) for the agent-meow Video surface.

These tools are **runner-dispatched**: the runner proxies the agent-meow
server's video REST endpoints over ``server_client`` for list/get, and
calls a configured video-generation gateway (Pixelle-Video FastAPI) for
generate. They ship as schema-only :class:`~?agent_meow.tools.base.Tool`
subclasses — the base-class ``invoke`` fails loud if the AP-side path
ever reaches them.

- ``video_generate`` → calls a video-generation gateway (Pixelle-Video
  FastAPI at ``PIXELLE_VIDEO_URL``) with a topic/script, polls the async
  task, downloads the mp4, uploads it as a session video resource.
- ``video_list`` → ``GET /v1/sessions/{id}/resources/videos``
- ``video_get`` → ``GET /v1/sessions/{id}/resources/videos/{video_id}``
  (metadata; binary is fetched separately by the UI)
"""

from __future__ import annotations

from typing import Any

from agent_meow.tools.base import Tool


class VideoGenerateTool(Tool):
    """Generate a video from a topic or script.

    Runner-dispatched: the runner resolves a provider via env vars
    (``VIDEO_GEN_PROVIDER``: fal | happy-horse | pixelle | openmontage) and
    calls the corresponding gateway. fal.ai hosts SOTA open models
    (Wan2.1/HunyuanVideo/LTX) and proprietary ones (Veo/Kling). Happy Horse
    1.0 is a 15B unified Transformer with native audio-video synthesis.
    Pixelle-Video is a free/local orchestration gateway. The resulting mp4
    is uploaded as a session video resource.
    """

    @classmethod
    def name(cls) -> str:
        return "video_generate"

    @classmethod
    def description(cls) -> str:
        return (
            "Generate a short video from a topic or script. The backend is "
            "resolved from configuration in a quality ladder: fal.ai (hosted, "
            "SOTA open models like Wan2.1/HunyuanVideo/LTX + proprietary Veo/"
            "Kling), Happy Horse 1.0 (15B unified Transformer, native joint "
            "audio-video, 7-language lip-sync), or Pixelle-Video (free/local "
            "orchestration). Handles script writing, AI images, TTS narration, "
            "BGM, and final composition where the backend supports it. Returns "
            "the new video id and download url. Requires session_id and text "
            "(the topic or script). mode='generate' lets the AI write the "
            "script from the topic; mode='fixed' uses the text as-is (one line "
            "per scene)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": VideoGenerateTool.name(),
                "description": VideoGenerateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the video in.",
                        },
                        "text": {
                            "type": "string",
                            "description": (
                                "The video topic (mode='generate') or the full "
                                "script, one line per scene (mode='fixed')."
                            ),
                        },
                        "mode": {
                            "type": "string",
                            "enum": ["generate", "fixed"],
                            "description": "generate: AI writes the script from the topic. fixed: use the text as-is. Defaults to generate.",
                        },
                        "n_scenes": {
                            "type": "integer",
                            "description": "Number of scenes/segments. Defaults to 5.",
                        },
                        "title": {
                            "type": "string",
                            "description": "Optional video title. Defaults to the topic.",
                        },
                        "frame_template": {
                            "type": "string",
                            "description": "Optional HTML frame template path (e.g. '1080x1920/image_default.html'). Defaults to the gateway default.",
                        },
                        "aspect_ratio": {
                            "type": "string",
                            "description": "Optional aspect ratio hint: '16:9' (landscape) or '9:16' (portrait).",
                        },
                    },
                    "required": ["session_id", "text"],
                    "additionalProperties": False,
                },
            },
        }


class VideoListTool(Tool):
    """List all videos in a session.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/videos``.
    """

    @classmethod
    def name(cls) -> str:
        return "video_list"

    @classmethod
    def description(cls) -> str:
        return (
            "List all videos in a session, newest-first. Returns id, "
            "filename, mime, duration_seconds, width, height, bytes_size, "
            "updated_at for each. Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": VideoListTool.name(),
                "description": VideoListTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to list videos for.",
                        },
                    },
                    "required": ["session_id"],
                    "additionalProperties": False,
                },
            },
        }


class VideoGetTool(Tool):
    """Fetch a video's metadata by id.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/videos/{video_id}``
    (metadata only; binary is fetched separately by the UI).
    """

    @classmethod
    def name(cls) -> str:
        return "video_get"

    @classmethod
    def description(cls) -> str:
        return (
            "Fetch a video's metadata by id: filename, mime, "
            "duration_seconds, width, height, bytes_size, updated_at. "
            "Requires session_id and video_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": VideoGetTool.name(),
                "description": VideoGetTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the video.",
                        },
                        "video_id": {
                            "type": "string",
                            "description": "The video id to fetch metadata for.",
                        },
                    },
                    "required": ["session_id", "video_id"],
                    "additionalProperties": False,
                },
            },
        }