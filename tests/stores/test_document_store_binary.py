"""Tests for the document store's binary artifact fields.

Documents gain an optional binary representation: ``filename`` +
``mime`` + ``artifact_key`` + ``bytes_size``. Markdown/prosemirror
documents leave these ``None``; office-file documents (docx/xlsx/pptx)
uploaded via the multipart route carry them, with the bytes in the
ArtifactStore (mirrors the ImageStore pattern).
"""

from __future__ import annotations

import pytest

from agent_meow.stores.document_store.sqlalchemy_store import (
    SqlAlchemyDocumentStore,
)


@pytest.fixture()
def doc_store(db_uri: str) -> SqlAlchemyDocumentStore:
    return SqlAlchemyDocumentStore(db_uri)


def test_add_binary_document(doc_store: SqlAlchemyDocumentStore) -> None:
    """A binary office document round-trips filename + artifact fields."""
    doc = doc_store.add(
        "conv-1",
        "Report",
        format="binary",
        filename="Report.docx",
        mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        artifact_key="documents/conv-1/doc-1/Report.docx",
        bytes_size=12345,
    )
    assert doc.filename == "Report.docx"
    assert doc.mime.startswith("application/vnd.")
    assert doc.artifact_key == "documents/conv-1/doc-1/Report.docx"
    assert doc.bytes_size == 12345

    fetched = doc_store.get(doc.id, "conv-1")
    assert fetched is not None
    assert fetched.filename == "Report.docx"
    assert fetched.artifact_key == doc.artifact_key


def test_add_markdown_document_defaults_binary_fields_to_none(
    doc_store: SqlAlchemyDocumentStore,
) -> None:
    """Plain markdown documents keep the pre-binary shape (no filename)."""
    doc = doc_store.add("conv-1", "Notes", content_md="# hi")
    assert doc.filename is None
    assert doc.mime is None
    assert doc.artifact_key is None
    assert doc.bytes_size == 0


def test_binary_fields_default_none_with_no_kwargs(
    doc_store: SqlAlchemyDocumentStore,
) -> None:
    """Existing callers that pass only format/content_md keep working."""
    doc = doc_store.add("conv-1", "Old shape", format="markdown", content_md="x")
    assert doc.filename is None
    assert doc.artifact_key is None


def test_binary_document_in_list(doc_store: SqlAlchemyDocumentStore) -> None:
    """list_for_conversation returns binary docs with their fields intact."""
    doc_store.add(
        "conv-1",
        "Sheet",
        format="binary",
        filename="a.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        artifact_key="documents/conv-1/d2/a.xlsx",
        bytes_size=9,
    )
    docs = doc_store.list_for_conversation("conv-1")
    assert len(docs) == 1
    assert docs[0].filename == "a.xlsx"
    assert docs[0].bytes_size == 9