"""
Client-side ``save_artifact`` tool.

Saves a file the agent has generated to the session ``ArtifactStore``
via the session file upload API
(``POST /v1/sessions/{session_id}/resources/files``). The server stores
the binary content in ``ArtifactStore`` keyed by the file UUID, so the
returned ``content_url`` can be rendered inline in the chat without a
new database column or migration.

Follows the exact ``@tool`` / ``build_tool_handler`` / ``TOOLS`` /
``execute_tool`` pattern used by ``agent_meow.client_tools.coding``.
"""

from __future__ import annotations

import json
from collections.abc import Callable
from pathlib import Path
from typing import Any

import httpx

from agent_meow_client.tools import build_tool_handler, tool

# Default agent-meow server URL.
_DEFAULT_SERVER_URL = "http://localhost:6767"


@tool(strict=False)
def save_artifact(
    file_path: str,
    session_id: str,
    server_url: str = _DEFAULT_SERVER_URL,
) -> str:
    """Save a generated file to the session artifact store for inline display.

    Uploads the file at ``file_path`` to the session file upload API and
    returns a ``content_url`` that can be rendered inline in the chat.

    Args:
        file_path: Absolute path to the file to upload,
            e.g. ``/tmp/chart.png``.
        session_id: The session/conversation identifier the file
            belongs to.
        server_url: Base URL of the agent-meow server. Defaults to
            ``http://localhost:6767``.
    """
    source = Path(file_path)
    if not source.is_file():
        return json.dumps(
            {"error": f"File not found: {file_path}"},
        )
    try:
        content = source.read_bytes()
    except OSError as exc:
        return json.dumps({"error": f"Could not read {file_path}: {exc}"})

    # The agent writes generated files into the workspace, which the
    # server already serves via the environment filesystem. Prefer the
    # stable ``/raw`` content URL for any file that already lives under
    # the configured workspace root —no copy, no upload, no size cap.
    # Only fall back to the session-file upload path for files outside
    # the workspace (e.g. ``/tmp``), which the server can't otherwise
    # serve.
    workspace_root = _workspace_root()
    if workspace_root is not None:
        try:
            rel = source.resolve().relative_to(workspace_root.resolve())
        except ValueError:
            rel = None
        if rel is not None:
            rel_path = "/".join(rel.parts)
            content_url = (
                f"{server_url.rstrip('/')}/v1/sessions/{session_id}"
                f"/resources/environments/default/filesystem/{rel_path}/raw"
            )
            import mimetypes

            return json.dumps(
                {
                    "content_url": content_url,
                    "file_id": f"workspace:{rel_path}",
                    "filename": source.name,
                    "bytes": len(content),
                    "content_type": (
                        mimetypes.guess_type(source.name)[0]
                        or "application/octet-stream"
                    ),
                },
            )

    url = f"{server_url.rstrip('/')}/v1/sessions/{session_id}/resources/files?download=true"
    try:
        with httpx.Client(timeout=120.0) as client:
            with source.open("rb") as fh:
                resp = client.post(
                    url,
                    files={"file": (source.name, fh, "application/octet-stream")},
                )
            resp.raise_for_status()
    except httpx.HTTPError as exc:
        return json.dumps({"error": f"Upload failed: {exc}"})
    data = resp.json()
    file_id = data.get("id", "")
    content_url = (
        f"{server_url.rstrip('/')}/v1/sessions/{session_id}/resources/files/{file_id}/content"
    )
    return json.dumps(
        {
            "content_url": content_url,
            "file_id": file_id,
            "filename": data.get("filename", source.name),
            "bytes": data.get("bytes", len(content)),
            "content_type": data.get("content_type", "application/octet-stream"),
        },
    )


def _workspace_root() -> Path | None:
    """Resolve the configured workspace root, if any.

    Reads ``AGENT_MEOW_RUNNER_WORKSPACE`` (set by the runner for every
    harness — see ``agent_meow/runner/identity.py``) so ``save_artifact``
    can detect files that already live inside the served workspace and
    skip the copy-upload in favour of the stable ``/raw`` content URL.

    :returns: The workspace root path, or ``None`` when unset.
    """
    import os

    root = os.environ.get("AGENT_MEOW_RUNNER_WORKSPACE")
    return Path(root) if root else None


# ── Legacy adapter surface ───────────────────────────────
#
# Mirrors ``agent_meow.client_tools.coding``: ``TOOLS`` is the
# OpenAI-format schema list derived from the ``@tool``-decorated
# function, and ``execute_tool`` is the sync dispatcher.

_TOOL_FNS: list[Callable[..., str]] = [
    save_artifact,
]

_FN_BY_NAME: dict[str, Callable[..., str]] = {fn.__name__: fn for fn in _TOOL_FNS}

TOOLS: list[dict[str, object]] = build_tool_handler(_TOOL_FNS).schemas


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    """Execute a save_artifact tool by name (legacy sync dispatcher).

    :param name: Tool function name (``"save_artifact"``).
    :param arguments: Parsed arguments dict from the LLM's
        function call.
    :returns: The tool's output as a JSON string.
    """
    fn = _FN_BY_NAME.get(name)
    if fn is None:
        return f"Unknown tool: {name}"
    return str(fn(**arguments))