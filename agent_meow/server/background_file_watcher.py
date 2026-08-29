"""Background file watcher for auto-prediction of image tags.

Opt-in periodic scanner that walks each conversation's workspace directory
for image files not yet present in the ``file_tags`` table, then queues
analysis by posting a chat message to the agent (same pattern as the
frontend "Analyze" button — the watcher never calls the vision model
directly).

Configuration (env vars):

- ``AGENT_MEOW_AUTO_TAG`` — set to ``"true"`` (case-insensitive) to enable.
- ``AGENT_MEOW_AUTO_TAG_INTERVAL`` — scan interval in seconds (default 60).
- ``AGENT_MEOW_AUTO_TAG_BATCH`` — max images queued per cycle (default 5).

The watcher is a single asyncio background task started from the FastAPI
lifespan. It iterates over conversations that have a workspace path, scans
each workspace's top-level image files, diffs them against
``FileTagStore.list_for_conversation()``, and posts a ``message`` event to
``/v1/sessions/{id}/events`` for each batch of untagged images.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import Awaitable, Callable
from typing import TYPE_CHECKING, Any

from agent_meow.stores.file_tag_store import FileTagStore

if TYPE_CHECKING:
    from agent_meow.stores.conversation_store import ConversationStore

_logger = logging.getLogger(__name__)

# Same extension set as ``workspace_scan.py`` — kept in sync so the
# watcher detects exactly the files the scan-workspace endpoint imports.
_IMAGE_EXTENSIONS = frozenset(
    {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"}
)

# Directories never recursed into (mirrors workspace_scan._SKIP_NAMES /
# _SKIP_PREFIXES) so the watcher doesn't descend into venvs, .git, etc.
_SKIP_NAMES = frozenset({".git", ".venv", "venv", "node_modules", "__pycache__", "dist", "build"})
_SKIP_PREFIXES = (".",)

# The analyze prompt mirrors the frontend ``useAnalyzeFiles`` message so
# the agent's behavior is identical whether analysis is triggered from
# the UI or from the background watcher. Chinese-only per the frontend
# convention (the agent defaults to the user's language).
_ANALYZE_PROMPT = (
    "请分析工作区中的所有图片文件，用 image_analyze 工具为每张图片生成分类标签。"
    "注意：每次只读取5张图片进行分析，不要一次性加载所有图片。"
    "分析完一批后继续下一批，直到所有图片都处理完成。"
)


def _env_truthy(name: str, default: bool = False) -> bool:
    """Return whether an env var is set to a truthy value (``true``/``1``/``yes``)."""
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"true", "1", "yes", "on"}


def auto_tag_enabled() -> bool:
    """Return whether the background auto-tag watcher is enabled."""
    return _env_truthy("AGENT_MEOW_AUTO_TAG", default=False)


def _scan_workspace_images(workspace: str) -> list[str]:
    """Return absolute paths of top-level image files in ``workspace``.

    Only top-level files are scanned (no recursion) — mirrors the
    ``scan-workspace`` endpoint so the watcher's view of "untagged
    images" matches what the frontend FilesPanel shows.
    """
    results: list[str] = []
    try:
        for entry in os.scandir(workspace):
            if not entry.is_file(follow_symlinks=False):
                continue
            name = entry.name
            if name in _SKIP_NAMES:
                continue
            if name.startswith(_SKIP_PREFIXES):
                continue
            if not name.lower().endswith(tuple(_IMAGE_EXTENSIONS)):
                continue
            results.append(entry.path)
    except (OSError, PermissionError):
        # Workspace may have been deleted or be unreadable — skip silently.
        pass
    return results


# Type alias for the chat-message poster injected at startup.
# The poster is an async callable that takes (session_id, prompt_text)
# and posts a ``message`` event to the session's ``/events`` endpoint.
ChatPoster = Callable[[str, str], Awaitable[None]]


class BackgroundFileWatcher:
    """Periodic background scanner that queues image analysis for untagged files.

    The watcher is opt-in (``AGENT_MEOW_AUTO_TAG=true``). When started, it
    runs an asyncio loop that, every ``interval`` seconds, iterates over
    conversations with a workspace path, scans each workspace for image
    files, diffs them against the ``FileTagStore``, and posts a chat
    message to the agent for each batch of up to ``max_batch`` untagged
    images.

    The watcher never calls the vision model directly — it only sends a
    chat message (same as the frontend "Analyze" button). The agent then
    uses its vision capability + the ``image_analyze`` tool to persist tags.
    """

    def __init__(
        self,
        *,
        conversation_store: ConversationStore,
        file_tag_store: FileTagStore,
        post_chat: ChatPoster,
        interval: int | None = None,
        max_batch: int | None = None,
        enabled: bool | None = None,
    ) -> None:
        if interval is None:
            interval = _env_int("AGENT_MEOW_AUTO_TAG_INTERVAL", default=60)
        if max_batch is None:
            max_batch = _env_int("AGENT_MEOW_AUTO_TAG_BATCH", default=5)
        if enabled is None:
            enabled = auto_tag_enabled()

        self._conversation_store = conversation_store
        self._file_tag_store = file_tag_store
        self._post_chat = post_chat
        self.interval = max(10, int(interval))
        self.max_batch = max(1, int(max_batch))
        self.enabled = bool(enabled)
        self._task: asyncio.Task[None] | None = None
        self._stop_event = asyncio.Event()

    async def start(self, app: Any | None = None) -> None:
        """Start the background scan loop.

        No-op when ``self.enabled`` is ``False`` (the default). The ``app``
        parameter is accepted for symmetry with other lifespan-started
        services (e.g. ``ServiceSupervisor``) but is not required — the
        watcher holds its dependencies directly.

        :param app: The FastAPI app instance (unused, kept for API symmetry).
        """
        if not self.enabled:
            _logger.debug("background file watcher disabled (AGENT_MEOW_AUTO_TAG not set)")
            return
        if self._task is not None and not self._task.done():
            _logger.warning("background file watcher already running")
            return
        self._stop_event.clear()
        self._task = asyncio.create_task(self._run_loop(), name="auto-tag-watcher")
        _logger.info(
            "background file watcher started (interval=%ss, max_batch=%s)",
            self.interval,
            self.max_batch,
        )

    async def stop(self) -> None:
        """Stop the background scan loop and await cancellation."""
        if self._task is None:
            return
        self._stop_event.set()
        self._task.cancel()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        self._task = None
        _logger.info("background file watcher stopped")

    async def _run_loop(self) -> None:
        """Main loop: scan every ``interval`` seconds until stopped."""
        # Don't scan immediately on startup — give the server time to bind
        # and runners to connect. The first scan fires after one interval.
        try:
            while not self._stop_event.is_set():
                try:
                    await asyncio.wait_for(self._stop_event.wait(), timeout=self.interval)
                    # stop_event was set — exit cleanly.
                    return
                except asyncio.TimeoutError:
                    pass
                await self._scan_all_conversations()
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            # A scan loop crash must not take down the server — log and exit.
            _logger.exception("background file watcher loop crashed")

    async def _scan_all_conversations(self) -> None:
        """Iterate over all conversations with a workspace and scan each."""
        try:
            paged = await asyncio.to_thread(
                self._conversation_store.list_conversations,
                limit=100,
                kind="default",
                include_archived=False,
            )
        except Exception:  # noqa: BLE001
            _logger.exception("auto-tag: failed to list conversations")
            return

        for conversation in paged.data:
            if self._stop_event.is_set():
                return
            workspace = conversation.workspace
            if not workspace:
                continue
            try:
                await self._scan_and_queue(conversation.id, workspace)
            except Exception:  # noqa: BLE001
                _logger.exception(
                    "auto-tag: scan failed for conversation %r (workspace=%s)",
                    conversation.id,
                    workspace,
                )

    async def _scan_and_queue(self, conversation_id: str, workspace: str) -> list[str]:
        """Scan ``workspace`` for untagged images and queue analysis.

        Returns the list of untagged image paths that were queued (for
        testing). When more than ``max_batch`` untagged images exist, only
        the first ``max_batch`` are queued this cycle — the rest will be
        picked up on subsequent scans (after the agent has tagged the
        current batch and they appear in ``FileTagStore``).

        :param conversation_id: The conversation/session id.
        :param workspace: Absolute path to the workspace directory.
        :returns: The list of untagged image paths queued this cycle.
        """
        # Scan the workspace for image files (top-level only).
        disk_images = await asyncio.to_thread(_scan_workspace_images, workspace)
        if not disk_images:
            return []

        # Normalize disk paths to basenames for comparison — FileTagStore
        # stores whatever path the agent passed to ``image_analyze``, which
        # is typically the basename (the agent sees relative paths in its
        # workspace context). Compare on basename to catch the common case.
        disk_basenames = {os.path.basename(p) for p in disk_images}

        # Query existing tags for this conversation.
        try:
            existing_tags = await asyncio.to_thread(
                self._file_tag_store.list_for_conversation, conversation_id
            )
        except Exception:  # noqa: BLE001
            _logger.exception(
                "auto-tag: failed to query tags for conversation %r",
                conversation_id,
            )
            return []

        tagged_basenames = {
            os.path.basename(t.file_path) for t in existing_tags
        }

        untagged = [
            p for p in disk_images
            if os.path.basename(p) not in tagged_basenames
        ]
        # Also filter out paths whose basename isn't in disk_basenames
        # (defensive — shouldn't happen but keeps the set logic clean).
        untagged = [p for p in untagged if os.path.basename(p) in disk_basenames]

        if not untagged:
            return []

        # Batch: only queue up to max_batch per cycle to avoid context
        # window overflow when the agent loads the images.
        batch = untagged[: self.max_batch]
        _logger.info(
            "auto-tag: queuing %d/%d untagged images for conversation %r",
            len(batch),
            len(untagged),
            conversation_id,
        )
        try:
            await self._post_chat(conversation_id, _ANALYZE_PROMPT)
        except Exception:  # noqa: BLE001
            _logger.exception(
                "auto-tag: failed to post analyze message for conversation %r",
                conversation_id,
            )
        return batch


def _env_int(name: str, *, default: int) -> int:
    """Parse an integer env var, falling back to ``default`` on error."""
    raw = os.environ.get(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        _logger.warning("invalid integer for %s=%r, using default %d", name, raw, default)
        return default
