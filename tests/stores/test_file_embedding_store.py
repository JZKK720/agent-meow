"""Tests for the file image-embedding store (plan 039 P2 visual search)."""

from __future__ import annotations

import os
import tempfile

import pytest

from agent_meow.entities.file_index import KIND_IMAGE
from agent_meow.stores.file_embedding_store.sqlalchemy_store import (
    SqlAlchemyFileEmbeddingStore,
)
from agent_meow.stores.file_index_store.sqlalchemy_store import (
    SqlAlchemyFileIndexStore,
)

_WS = "C:/Users/1/agent-meow-workspace"
_MODEL = "test-clip"


@pytest.fixture()
def stores() -> tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore]:
    db_path = os.path.join(tempfile.mkdtemp(), "test.db")
    return SqlAlchemyFileIndexStore(
        f"sqlite:///{db_path}"
    ), SqlAlchemyFileEmbeddingStore(f"sqlite:///{db_path}")


def _indexed_image(store: SqlAlchemyFileIndexStore, path: str) -> str:
    fid = store.upsert_pending(
        host_id="h1", workspace=_WS, path=path, kind=KIND_IMAGE, size=10, mtime_ns=1
    )
    store.claim_pending(limit=10)
    store.mark_indexed(fid, content_hash=f"hash-{path}", meta={}, thumb_path=None)
    return fid


def test_upsert_and_embedded_file_ids(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    index, emb = stores
    fid = _indexed_image(index, f"{_WS}/a.png")
    assert emb.embedded_file_ids(model=_MODEL) == set()

    emb.upsert(file_id=fid, model=_MODEL, vector=[1.0, 0.0, 0.0])
    assert emb.embedded_file_ids(model=_MODEL) == {fid}

    # Upsert again (same file+model) → replaces, no duplicate row.
    emb.upsert(file_id=fid, model=_MODEL, vector=[0.0, 1.0, 0.0])
    assert emb.embedded_file_ids(model=_MODEL) == {fid}


def test_knn_ranks_by_cosine_similarity(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    index, emb = stores
    fid_a = _indexed_image(index, f"{_WS}/beach.png")
    fid_b = _indexed_image(index, f"{_WS}/cat.png")
    fid_c = _indexed_image(index, f"{_WS}/doc.png")
    emb.upsert(file_id=fid_a, model=_MODEL, vector=[1.0, 0.0])  # closest
    emb.upsert(file_id=fid_b, model=_MODEL, vector=[0.7, 0.7])  # middle
    emb.upsert(file_id=fid_c, model=_MODEL, vector=[-1.0, 0.0])  # opposite

    hits = emb.knn_search(
        host_id="h1",
        workspace=_WS,
        query_vector=[1.0, 0.0],
        model=_MODEL,
        limit=3,
        min_similarity=-1.0,  # keep all for the ranking assertion
    )
    assert [h[0].id for h in hits] == [fid_a, fid_b, fid_c]
    assert hits[0][1] == pytest.approx(1.0, abs=1e-5)
    assert hits[2][1] == pytest.approx(-1.0, abs=1e-5)

    # Default floor drops the opposite vector.
    hits2 = emb.knn_search(
        host_id="h1",
        workspace=_WS,
        query_vector=[1.0, 0.0],
        model=_MODEL,
        limit=3,
    )
    assert [h[0].id for h in hits2] == [fid_a, fid_b]


def test_knn_respects_workspace_and_kind_scoping(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    index, emb = stores
    fid = _indexed_image(index, f"{_WS}/beach.png")
    emb.upsert(file_id=fid, model=_MODEL, vector=[1.0, 0.0])

    # Other workspace → no hits.
    assert (
        emb.knn_search(
            host_id="h1",
            workspace="C:/elsewhere",
            query_vector=[1.0, 0.0],
            model=_MODEL,
        )
        == []
    )
    # Other model → no hits (dimension-pinned per model).
    assert (
        emb.knn_search(
            host_id="h1",
            workspace=_WS,
            query_vector=[1.0, 0.0],
            model="other-clip",
        )
        == []
    )


def test_knn_excludes_unindexed_rows(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    index, emb = stores
    fid_pending = index.upsert_pending(
        host_id="h1",
        workspace=_WS,
        path=f"{_WS}/pending.png",
        kind=KIND_IMAGE,
        size=1,
        mtime_ns=1,
    )
    emb.upsert(file_id=fid_pending, model=_MODEL, vector=[1.0, 0.0])
    assert (
        emb.knn_search(
            host_id="h1", workspace=_WS, query_vector=[1.0, 0.0], model=_MODEL
        )
        == []
    )


def test_delete_for_file(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    index, emb = stores
    fid = _indexed_image(index, f"{_WS}/a.png")
    emb.upsert(file_id=fid, model=_MODEL, vector=[1.0])
    emb.delete_for_file(fid)
    assert emb.embedded_file_ids(model=_MODEL) == set()


def test_store_creation_idempotent_on_shared_db(
    stores: tuple[SqlAlchemyFileIndexStore, SqlAlchemyFileEmbeddingStore],
) -> None:
    """Opening a second store on the same DB (server + runner) doesn't clash."""
    index, emb = stores
    fid = _indexed_image(index, f"{_WS}/a.png")
    emb.upsert(file_id=fid, model=_MODEL, vector=[1.0, 2.0])

    db_path = index._engine.url.database
    emb2 = SqlAlchemyFileEmbeddingStore(f"sqlite:///{db_path}")
    assert emb2.embedded_file_ids(model=_MODEL) == {fid}