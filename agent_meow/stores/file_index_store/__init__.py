"""File index store: workspace-scoped file intelligence index (plan 039).

Abstract base + SQLAlchemy implementation. The watcher enqueues rows
(``status='pending'``); the meta worker claims them (``processing``),
extracts metadata, and marks them ``indexed``/``failed``/``duplicate``.
Reads join ``file_meta`` so callers get the parsed metadata alongside
the index row.

Scoping is (host_id, workspace) — deliberately NOT conversation-scoped
(contrast ``FileTagStore``): every session bound to a workspace shares
one index, which is what makes cross-session "search local files" work.
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from agent_meow.entities.file_index import FileIndexEntry


class FileIndexStore(ABC):
    """Abstract base for the workspace file index."""

    def __init__(self, storage_location: str) -> None:
        self.storage_location = storage_location

    @abstractmethod
    def upsert_pending(
        self,
        *,
        host_id: str,
        workspace: str,
        path: str,
        kind: str,
        size: int,
        mtime_ns: int,
    ) -> str:
        """Insert or refresh a pending index row for ``path``.

        Idempotent per (host_id, workspace, path): re-inserting an existing
        path updates size/mtime and resets status to ``pending`` ONLY when
        the file actually changed (size/mtime differ) — an unchanged
        ``indexed`` file stays indexed so the worker doesn't reprocess the
        whole workspace after a restart. Returns the row id.
        """
        ...

    @abstractmethod
    def claim_pending(self, limit: int = 8) -> list[FileIndexEntry]:
        """Atomically move up to ``limit`` pending rows to ``processing``
        and return them (worker pull). Order: oldest first."""
        ...

    @abstractmethod
    def mark_indexed(
        self,
        entry_id: str,
        *,
        content_hash: str,
        meta: dict[str, object],
        thumb_path: str | None,
    ) -> None:
        """Finish a claimed row: store parsed metadata + hash, set indexed."""
        ...

    @abstractmethod
    def mark_failed(self, entry_id: str, error: str) -> None:
        """Record an extraction failure (row stays claimable for retry)."""
        ...

    @abstractmethod
    def mark_duplicate(self, entry_id: str, *, content_hash: str) -> None:
        """Record that the file's content matches an already-indexed file."""
        ...

    @abstractmethod
    def mark_gone(self, *, host_id: str, workspace: str, path: str) -> None:
        """Soft-delete a row whose file was removed (keeps history, hides from search)."""
        ...

    @abstractmethod
    def find_by_path(self, *, host_id: str, workspace: str, path: str) -> FileIndexEntry | None:
        """Return the (meta-joined) entry for one path, or None."""
        ...

    @abstractmethod
    def list_workspace(
        self,
        *,
        host_id: str,
        workspace: str,
        kind: str | None = None,
        statuses: tuple[str, ...] | None = None,
        limit: int = 500,
        offset: int = 0,
    ) -> list[FileIndexEntry]:
        """List indexed files in a workspace, newest-indexed first."""
        ...

    @abstractmethod
    def count_by_status(self, *, host_id: str, workspace: str) -> dict[str, int]:
        """Status histogram for a workspace (drives the panel's progress chip)."""
        ...

    @abstractmethod
    def find_hash_owner(
        self, *, host_id: str, workspace: str, content_hash: str, exclude_id: str
    ) -> FileIndexEntry | None:
        """Return an already-indexed file with the same content hash, if any."""
        ...

    @abstractmethod
    def search(
        self,
        *,
        host_id: str,
        workspace: str,
        query: str,
        kind: str | None = None,
        limit: int = 50,
    ) -> list[tuple[FileIndexEntry, float]]:
        """Full-text search the indexed files in a workspace.

        Returns ``(entry, score)`` pairs ranked by FTS5 bm25, newest-indexed
        as a tiebreak. ``query`` is matched against the basename + EXIF +
        doc text excerpt blob (trigram tokenizer → CJK substring match).
        Only ``indexed`` rows are searchable.
        """
        ...

    def visual_search(
        self,
        *,
        host_id: str,
        workspace: str,
        query: str,
        kind: str | None = None,
        limit: int = 50,
    ) -> list[tuple[FileIndexEntry, float]]:
        """CLIP content search: embed ``query`` and cosine-KNN the images.

        Optional hook — the ABC default returns [] (no embeddings), and
        the SQLAlchemy implementation calls the local CLIP server to
        embed the text then merges its rank into :meth:`search`'s via
        hybrid RRF at the route layer. Not abstract so existing
        implementations (incl. tests' in-memory fakes) stay valid.
        """
        return []
