"""Post-turn workspace scan: auto-upload new files as session resources.

After each agent turn ends, scan the session workspace for files that
were created or modified during the turn. Upload each new file as a
session resource via ``POST /v1/sessions/{id}/resources/files`` so the
UI (FileViewer, ImagesPanel, VideosPanel) can display them without the
agent needing to explicitly call an upload tool.

The scan is best-effort and non-blocking: failures are logged but never
crash the turn-end bookkeeping. It runs in a background thread to avoid
blocking the event loop.
"""

from __future__ import annotations

import asyncio
import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    pass

_logger = logging.getLogger(__name__)

# Max file size to auto-upload (10 MB). Larger files (videos, model
# outputs) are skipped — the agent should upload those explicitly.
_MAX_AUTO_UPLOAD_BYTES = 10 * 1024 * 1024

# Extensions to auto-upload. Skip dotfiles, __pycache__, node_modules,
# .git, and other build artifacts.
_SKIP_DIRS = frozenset({
    ".git", "__pycache__", "node_modules", ".venv", "venv",
    ".tox", ".mypy_cache", ".pytest_cache", ".ruff_cache",
    "dist", "build", ".next", ".nuxt", ".turbo",
})

# Extensions worth auto-uploading (images, HTML, code, docs).
_UPLOAD_EXTENSIONS = frozenset({
    # Images
    "png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico",
    # Video
    "mp4", "webm", "mov", "avi", "mkv", "m4v",
    # HTML/games
    "html", "htm",
    # Code
    "py", "js", "ts", "tsx", "jsx", "json", "yaml", "yml", "toml",
    "md", "txt", "csv", "xml",
    # Documents
    "pdf",
})

# Track which files we've already uploaded per session to avoid
# re-uploading on every turn.
_uploaded_files: dict[str, set[str]] = {}


def _should_upload(path: Path) -> bool:
    """Return True if a file should be auto-uploaded."""
    # Skip dotfiles
    if any(part.startswith(".") for part in path.parts):
        return False
    # Skip directories in _SKIP_DIRS
    if any(part in _SKIP_DIRS for part in path.parts):
        return False
    # Check extension
    ext = path.suffix.lstrip(".").lower()
    if ext not in _UPLOAD_EXTENSIONS:
        return False
    # Check file size
    try:
        if path.stat().st_size > _MAX_AUTO_UPLOAD_BYTES:
            return False
    except OSError:
        return False
    return True


def _scan_workspace(workspace: Path) -> list[Path]:
    """Scan the workspace for uploadable files."""
    results: list[Path] = []
    try:
        for root, dirs, files in os.walk(workspace):
            # Prune skip directories in-place (os.walk modifies the list)
            dirs[:] = [d for d in dirs if d not in _SKIP_DIRS and not d.startswith(".")]
            for fname in files:
                fpath = Path(root) / fname
                if _should_upload(fpath):
                    results.append(fpath)
    except OSError as exc:
        _logger.debug("workspace scan failed: %s", exc)
    return results


async def scan_and_upload(
    session_id: str,
    workspace: str | None,
    server_client: object | None,
) -> None:
    """Scan the workspace and upload new files as session resources.

    Called after each turn ends. Best-effort: failures are logged but
    never raised.

    :param session_id: The session/conversation ID.
    :param workspace: The session workspace path (absolute), or None.
    :param server_client: The server client for uploading files.
    """
    if not workspace or not server_client:
        return

    ws_path = Path(workspace).expanduser()
    if not ws_path.is_dir():
        return

    # Run the scan in a thread to avoid blocking the event loop
    files = await asyncio.to_thread(_scan_workspace, ws_path)
    if not files:
        return

    # Filter out already-uploaded files
    already = _uploaded_files.setdefault(session_id, set())
    new_files = [f for f in files if str(f) not in already]
    if not new_files:
        return

    _logger.info(
        "post-turn workspace scan: %d new files in %s for session %s",
        len(new_files), workspace, session_id,
    )

    # Upload each new file
    for fpath in new_files:
        try:
            rel_path = str(fpath.relative_to(ws_path)).replace("\\", "/")
            content = fpath.read_bytes()
            # Use the server client to upload the file as a session resource.
            # The server_client is an httpx-based client with post().
            client = server_client
            if hasattr(client, "post"):
                resp = await client.post(
                    f"/v1/sessions/{session_id}/resources/files",
                    files={"file": (rel_path, content)},
                    data={"path": rel_path},
                )
                if resp.status_code in (200, 201):
                    already.add(str(fpath))
                    _logger.info("auto-uploaded: %s (%d bytes)", rel_path, len(content))
                else:
                    _logger.warning(
                        "auto-upload failed for %s: HTTP %s",
                        rel_path, resp.status_code,
                    )
        except Exception as exc:
            _logger.debug("auto-upload error for %s: %s", fpath, exc)


def reset_session(session_id: str) -> None:
    """Clear the uploaded-files tracking for a session (on disconnect)."""
    _uploaded_files.pop(session_id, None)