"""Tests for the background file watcher (auto-prediction)."""

from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass, field
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from agent_meow.entities.file_tag import FileTag
from agent_meow.server.background_file_watcher import (
    BackgroundFileWatcher,
    auto_tag_enabled,
)


# ── Fakes ──────────────────────────────────────────────────────────────


@dataclass
class _FakeConversation:
    id: str
    workspace: str | None = None


@dataclass
class _FakePagedList:
    items: list[_FakeConversation] = field(default_factory=list)


class _FakeConversationStore:
    """Minimal ConversationStore stub returning a fixed conversation list."""

    def __init__(self, conversations: list[_FakeConversation]) -> None:
        self._conversations = conversations

    def list_conversations(self, **kwargs) -> _FakePagedList:
        return _FakePagedList(items=list(self._conversations))


class _FakeTagStore:
    """In-memory FileTagStore stub."""

    def __init__(self, tags: list[FileTag] | None = None) -> None:
        self._tags: list[FileTag] = list(tags or [])

    def list_for_conversation(self, conversation_id: str) -> list[FileTag]:
        return [t for t in self._tags if t.conversation_id == conversation_id]


class _ChatRecorder:
    """Captures chat messages posted by the watcher."""

    def __init__(self) -> None:
        self.posts: list[tuple[str, str]] = []

    async def __call__(self, conversation_id: str, prompt: str) -> None:
        self.posts.append((conversation_id, prompt))


def _make_tag(conv: str, file_path: str, tag: str = "tagged") -> FileTag:
    return FileTag(
        id=f"{conv}-{file_path}",
        conversation_id=conv,
        file_path=file_path,
        tag=tag,
        confidence=0.9,
        description=None,
        model="test-model",
        analyzed_at=1,
    )


def _make_image(workspace: Path, name: str) -> Path:
    """Create an empty image file in the workspace."""
    path = workspace / name
    path.write_bytes(b"")
    return path


# ── Tests ──────────────────────────────────────────────────────────────


pytestmark = pytest.mark.asyncio


async def test_watcher_disabled_by_default(tmp_path: Path) -> None:
    """The watcher is disabled when AGENT_MEOW_AUTO_TAG is not set."""
    store = _FakeConversationStore([])
    tag_store = _FakeTagStore()
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=False,
    )
    assert watcher.enabled is False
    await watcher.start()
    assert watcher._task is None
    await watcher.stop()


async def test_auto_tag_enabled_env_var(monkeypatch: pytest.MonkeyPatch) -> None:
    """``auto_tag_enabled`` reads AGENT_MEOW_AUTO_TAG truthily."""
    monkeypatch.setenv("AGENT_MEOW_AUTO_TAG", "true")
    assert auto_tag_enabled() is True
    monkeypatch.setenv("AGENT_MEOW_AUTO_TAG", "1")
    assert auto_tag_enabled() is True
    monkeypatch.delenv("AGENT_MEOW_AUTO_TAG")
    assert auto_tag_enabled() is False
    monkeypatch.setenv("AGENT_MEOW_AUTO_TAG", "false")
    assert auto_tag_enabled() is False


async def test_watcher_detects_untagged_images(tmp_path: Path) -> None:
    """The watcher detects image files with no tags and queues analysis."""
    workspace = tmp_path / "ws"
    workspace.mkdir()
    _make_image(workspace, "a.png")
    _make_image(workspace, "b.jpg")

    conv = _FakeConversation(id="conv1", workspace=str(workspace))
    store = _FakeConversationStore([conv])
    tag_store = _FakeTagStore(tags=[])  # no tags → all untagged
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
        interval=60,
        max_batch=5,
    )

    queued = await watcher._scan_and_queue("conv1", str(workspace))
    assert len(queued) == 2
    # The analyze message was posted exactly once for the batch.
    assert len(poster.posts) == 1
    assert poster.posts[0][0] == "conv1"


async def test_watcher_skips_already_tagged_images(tmp_path: Path) -> None:
    """The watcher does not re-queue images that already have tags."""
    workspace = tmp_path / "ws"
    workspace.mkdir()
    _make_image(workspace, "tagged.png")
    _make_image(workspace, "untagged.png")

    conv = _FakeConversation(id="conv1", workspace=str(workspace))
    store = _FakeConversationStore([conv])
    # "tagged.png" already has a tag → only "untagged.png" should queue.
    tag_store = _FakeTagStore(tags=[_make_tag("conv1", "tagged.png")])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
    )

    queued = await watcher._scan_and_queue("conv1", str(workspace))
    assert len(queued) == 1
    assert queued[0].endswith("untagged.png")
    assert len(poster.posts) == 1


async def test_watcher_respects_max_batch(tmp_path: Path) -> None:
    """The watcher queues at most ``max_batch`` images per cycle."""
    workspace = tmp_path / "ws"
    workspace.mkdir()
    for i in range(10):
        _make_image(workspace, f"img{i}.png")

    conv = _FakeConversation(id="conv1", workspace=str(workspace))
    store = _FakeConversationStore([conv])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
        max_batch=3,
    )

    queued = await watcher._scan_and_queue("conv1", str(workspace))
    assert len(queued) == 3
    # One chat message for the batch (not one per image).
    assert len(poster.posts) == 1


async def test_watcher_skips_non_image_files(tmp_path: Path) -> None:
    """The watcher only considers image extensions."""
    workspace = tmp_path / "ws"
    workspace.mkdir()
    _make_image(workspace, "photo.png")
    (workspace / "notes.txt").write_text("hello")
    (workspace / "data.json").write_text("{}")

    conv = _FakeConversation(id="conv1", workspace=str(workspace))
    store = _FakeConversationStore([conv])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
    )

    queued = await watcher._scan_and_queue("conv1", str(workspace))
    assert len(queued) == 1
    assert queued[0].endswith("photo.png")


async def test_watcher_no_images_no_post(tmp_path: Path) -> None:
    """When the workspace has no images, no chat message is posted."""
    workspace = tmp_path / "ws"
    workspace.mkdir()
    (workspace / "readme.md").write_text("no images here")

    conv = _FakeConversation(id="conv1", workspace=str(workspace))
    store = _FakeConversationStore([conv])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
    )

    queued = await watcher._scan_and_queue("conv1", str(workspace))
    assert queued == []
    assert poster.posts == []


async def test_watcher_skips_conversations_without_workspace(tmp_path: Path) -> None:
    """Conversations with no workspace path are skipped."""
    conv = _FakeConversation(id="conv1", workspace=None)
    store = _FakeConversationStore([conv])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
    )

    await watcher._scan_all_conversations()
    assert poster.posts == []


async def test_watcher_start_stop_lifecycle(tmp_path: Path) -> None:
    """start() launches the loop; stop() cancels it cleanly."""
    store = _FakeConversationStore([])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
        interval=10,
    )

    await watcher.start()
    assert watcher._task is not None
    assert not watcher._task.done()
    await watcher.stop()
    assert watcher._task is None


async def test_watcher_scan_all_iterates_conversations(tmp_path: Path) -> None:
    """``_scan_all_conversations`` scans every conversation with a workspace."""
    ws1 = tmp_path / "ws1"
    ws1.mkdir()
    _make_image(ws1, "a.png")
    ws2 = tmp_path / "ws2"
    ws2.mkdir()
    _make_image(ws2, "b.png")

    store = _FakeConversationStore([
        _FakeConversation(id="c1", workspace=str(ws1)),
        _FakeConversation(id="c2", workspace=str(ws2)),
        _FakeConversation(id="c3", workspace=None),  # skipped
    ])
    tag_store = _FakeTagStore(tags=[])
    poster = _ChatRecorder()
    watcher = BackgroundFileWatcher(
        conversation_store=store,
        file_tag_store=tag_store,
        post_chat=poster,
        enabled=True,
    )

    await watcher._scan_all_conversations()
    # One post per conversation with a workspace.
    posted_ids = {cid for cid, _ in poster.posts}
    assert posted_ids == {"c1", "c2"}
