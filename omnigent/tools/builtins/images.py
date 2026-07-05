"""Image tools (``image_*``) for the agent-meow Images surface.

These tools are **runner-dispatched**: the runner proxies the Omnigent
server's image REST endpoints over ``server_client``. They ship as
schema-only :class:`~omnigent.tools.base.Tool` subclasses.

- ``image_list`` → ``GET /v1/sessions/{id}/resources/images``
- ``image_get`` → ``GET /v1/sessions/{id}/resources/images/{image_id}`` (metadata)
- ``image_upload`` → ``POST /v1/sessions/{id}/resources/images`` (multipart)
- ``image_edit`` → ``PATCH /v1/sessions/{id}/resources/images/{image_id}/edit``
  (store-and-forward Fabric.js JSON)
- ``image_generate`` → stub for future diffusion-model hook. Schema-only;
  the runner's tool dispatch intercepts the call and routes it to a
  configured image-generation provider when available.
"""

from __future__ import annotations

from typing import Any

from omnigent.tools.base import Tool


class ImageListTool(Tool):
    """List all images in a session.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/images``.
    """

    @classmethod
    def name(cls) -> str:
        return "image_list"

    @classmethod
    def description(cls) -> str:
        return (
            "List all images in a session, newest-first. Returns id, "
            "filename, mime, width, height, bytes_size, has_edits, "
            "updated_at for each. Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageListTool.name(),
                "description": ImageListTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to list images for.",
                        },
                    },
                    "required": ["session_id"],
                    "additionalProperties": False,
                },
            },
        }


class ImageGetTool(Tool):
    """Fetch an image's metadata by id.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/images/{image_id}``
    (metadata only; binary is fetched separately by the UI).
    """

    @classmethod
    def name(cls) -> str:
        return "image_get"

    @classmethod
    def description(cls) -> str:
        return (
            "Fetch an image's metadata by id: filename, mime, width, "
            "height, bytes_size, has_edits, updated_at. Requires session_id "
            "and image_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageGetTool.name(),
                "description": ImageGetTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the image.",
                        },
                        "image_id": {
                            "type": "string",
                            "description": "The image id to fetch metadata for.",
                        },
                    },
                    "required": ["session_id", "image_id"],
                    "additionalProperties": False,
                },
            },
        }


class ImageUploadTool(Tool):
    """Upload an image to a session.

    Runner-dispatched: proxies ``POST /v1/sessions/{id}/resources/images``.
    The runner reads the file from the agent's local workspace and uploads
    it as multipart.
    """

    @classmethod
    def name(cls) -> str:
        return "image_upload"

    @classmethod
    def description(cls) -> str:
        return (
            "Upload an image file from the agent's workspace to the session. "
            "Requires session_id and a path to the image file on the local "
            "filesystem. Returns the new image's id and metadata."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageUploadTool.name(),
                "description": ImageUploadTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to upload the image to.",
                        },
                        "path": {
                            "type": "string",
                            "description": "Path to the image file on the local filesystem.",
                        },
                        "filename": {
                            "type": "string",
                            "description": "Optional display filename. Defaults to the path's basename.",
                        },
                    },
                    "required": ["session_id", "path"],
                    "additionalProperties": False,
                },
            },
        }


class ImageEditTool(Tool):
    """Apply Fabric.js edit JSON to an image (store-and-forward).

    Runner-dispatched: proxies ``PATCH /v1/sessions/{id}/resources/images/{image_id}/edit``.
    The edit_json is a Fabric.js canvas JSON string; the browser renders it
    on top of the original binary when the image is opened in the editor.
    """

    @classmethod
    def name(cls) -> str:
        return "image_edit"

    @classmethod
    def description(cls) -> str:
        return (
            "Apply Fabric.js edit JSON to an image (store-and-forward). The "
            "edit_json is a Fabric.js canvas JSON string. The browser "
            "renders it on top of the original binary. Requires session_id, "
            "image_id, and edit_json."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageEditTool.name(),
                "description": ImageEditTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the image.",
                        },
                        "image_id": {
                            "type": "string",
                            "description": "The image id to edit.",
                        },
                        "edit_json": {
                            "type": "string",
                            "description": "Fabric.js canvas JSON string for the edit state.",
                        },
                    },
                    "required": ["session_id", "image_id", "edit_json"],
                    "additionalProperties": False,
                },
            },
        }


class ImageGenerateTool(Tool):
    """Generate an image from a prompt (stub for future diffusion-model hook).

    Schema-only: the runner's tool dispatch intercepts the call by name and
    routes it to a configured image-generation provider (Stability, OpenAI
    images, ComfyUI MCP) when available. In v1 the call returns a stub
    indicating image generation is not yet wired.
    """

    @classmethod
    def name(cls) -> str:
        return "image_generate"

    @classmethod
    def description(cls) -> str:
        return (
            "Generate an image from a text prompt. The runtime routes the "
            "call to a configured image-generation provider. Requires "
            "session_id and prompt. Returns the new image's id and metadata "
            "when generation succeeds."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageGenerateTool.name(),
                "description": ImageGenerateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the generated image in.",
                        },
                        "prompt": {
                            "type": "string",
                            "description": "Text prompt describing the image to generate.",
                        },
                        "width": {
                            "type": "integer",
                            "description": "Optional pixel width. Defaults to provider default.",
                        },
                        "height": {
                            "type": "integer",
                            "description": "Optional pixel height. Defaults to provider default.",
                        },
                    },
                    "required": ["session_id", "prompt"],
                    "additionalProperties": False,
                },
            },
        }