"""Image tools (``image_*``) for the agent-meow Images surface.

These tools are **runner-dispatched**: the runner proxies the agent-meow
server's image REST endpoints over ``server_client``. They ship as
schema-only :class:`~?agent_meow.tools.base.Tool` subclasses.

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

from agent_meow.tools.base import Tool


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
    """Generate an image from a text prompt.

    Runner-dispatched: the runner resolves a provider via env vars
    (``IMAGE_GEN_PROVIDER``, ``IMAGE_GEN_API_URL``, ``A1111_API_URL``) or
    a configured ComfyUI MCP server, generates the image, uploads it to
    the session's image resources, and returns the new image id/url.
    """

    @classmethod
    def name(cls) -> str:
        return "image_generate"

    @classmethod
    def description(cls) -> str:
        return (
            "Generate an image from a text prompt. The backend is resolved "
            "from configuration: a hosted API (Stability/OpenAI/Grok), a "
            "local A1111 instance, or a ComfyUI MCP server. Returns the new "
            "image id and download url. Requires session_id and prompt; "
            "width and height are optional."
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


class ImageRemoveBgTool(Tool):
    """Remove the background from a session image.

    Runner-dispatched: the runner shells out to the ``rembg`` CLI (resolved
    via ``shutil.which`` or ``REMBG_BIN``) to remove the background, then
    uploads the result as a new session image resource.
    """

    @classmethod
    def name(cls) -> str:
        return "image_remove_bg"

    @classmethod
    def description(cls) -> str:
        return (
            "Remove the background from a session image using rembg. "
            "Returns a new image (with transparent background) as a session "
            "resource. Requires session_id and image_id. Optional model "
            "(u2net|isnet|bria-rmbg), only_mask (return just the mask), and "
            "alpha_matting (higher-quality edges)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageRemoveBgTool.name(),
                "description": ImageRemoveBgTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the source image.",
                        },
                        "image_id": {
                            "type": "string",
                            "description": "The source image id to remove the background from.",
                        },
                        "model": {
                            "type": "string",
                            "description": "rembg model name. Defaults to 'u2net'. Options: u2net, u2netp, isnet-general-use, bria-rmbg.",
                        },
                        "only_mask": {
                            "type": "boolean",
                            "description": "If true, return only the binary mask (black/white). Defaults to false.",
                        },
                        "alpha_matting": {
                            "type": "boolean",
                            "description": "If true, use alpha matting for higher-quality edge refinement. Defaults to false.",
                        },
                    },
                    "required": ["session_id", "image_id"],
                    "additionalProperties": False,
                },
            },
        }


class ImageEditAiTool(Tool):
    """AI-powered image editing: inpaint, outpaint, or upscale.

    Runner-dispatched: the runner resolves a provider (A1111 HTTP API or
    ComfyUI MCP server) and performs the requested AI edit on a session
    image, uploading the result as a new image resource.
    """

    @classmethod
    def name(cls) -> str:
        return "image_edit_ai"

    @classmethod
    def description(cls) -> str:
        return (
            "AI-edit a session image: inpaint (fill masked area from prompt), "
            "outpaint (extend canvas), or upscale (increase resolution). "
            "Backed by A1111 (HTTP API) or ComfyUI (MCP server). Requires "
            "session_id, image_id, mode (inpaint|outpaint|upscale), and "
            "prompt. For inpaint, optionally provide mask_json (Fabric.js "
            "path data defining the region to fill)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageEditAiTool.name(),
                "description": ImageEditAiTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the source image.",
                        },
                        "image_id": {
                            "type": "string",
                            "description": "The source image id to edit.",
                        },
                        "mode": {
                            "type": "string",
                            "enum": ["inpaint", "outpaint", "upscale"],
                            "description": "The AI edit mode: inpaint (fill masked region), outpaint (extend canvas), or upscale (increase resolution).",
                        },
                        "prompt": {
                            "type": "string",
                            "description": "Text prompt guiding the edit (e.g. 'add a hat', 'extend the sky'). Required for inpaint/outpaint; optional for upscale.",
                        },
                        "mask_json": {
                            "type": "string",
                            "description": "For inpaint: Fabric.js path JSON defining the masked region to fill. If omitted for inpaint, the entire image is used.",
                        },
                        "denoising_strength": {
                            "type": "number",
                            "description": "For inpaint/outpaint: how much to change the image (0.0-1.0). Defaults to 0.75.",
                        },
                        "upscale_factor": {
                            "type": "number",
                            "description": "For upscale: resolution multiplier (e.g. 2.0 for 2x). Defaults to 2.0.",
                        },
                    },
                    "required": ["session_id", "image_id", "mode"],
                    "additionalProperties": False,
                },
            },
        }


class ImageAnalyzeTool(Tool):
    """Store AI-generated tags for a workspace image.

    Runner-dispatched: the runner intercepts this call and stores the
    tags in the ``file_tags`` table via ``FileTagStore``. The agent
    generates tags from its vision model context (it sees the image
    via the ``input_image`` modality), then calls this tool to persist
    them. This is the agent-driven image classification pipeline —
    no separate vision API call is made; the agent's own LLM sees
    the image and produces the tags.
    """

    @classmethod
    def name(cls) -> str:
        return "image_analyze"

    @classmethod
    def description(cls) -> str:
        return (
            "Store AI-generated classification tags for a workspace image. "
            "Use this after you have looked at an image (via vision) and "
            "determined its content categories. Tags should be lowercase, "
            "descriptive labels (e.g. 'cat', 'outdoor', 'daytime', "
            "'screenshot', 'document'). Max 10 tags per image. "
            "Requires session_id, file_path, and tags (list of strings). "
            "Optional: description (one-sentence summary of the image)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": ImageAnalyzeTool.name(),
                "description": ImageAnalyzeTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the image.",
                        },
                        "file_path": {
                            "type": "string",
                            "description": (
                                "Absolute or workspace-relative path of the "
                                "image file to tag."
                            ),
                        },
                        "tags": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": (
                                "List of 1-10 lowercase classification tags "
                                "for the image, each max 20 characters."
                            ),
                        },
                        "description": {
                            "type": "string",
                            "description": (
                                "Optional one-sentence description of the "
                                "image content."
                            ),
                        },
                    },
                    "required": ["session_id", "file_path", "tags"],
                    "additionalProperties": False,
                },
            },
        }