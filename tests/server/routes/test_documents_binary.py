"""Binary upload/download round-trip for the documents surface.

Office-file round-trip: the runner's doc_create_office / doc_edit_office /
doc_export tools POST multipart to ``/resources/documents``; the binary
bytes land in the ArtifactStore and the metadata row carries
filename/mime/artifact_key. GET on ``{doc_id}/binary`` returns the bytes
with the stored MIME + attachment disposition (office round-trip +
sandbox-generated file download).
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI

from agent_meow.runtime.agent_cache import AgentCache
from agent_meow.server.app import create_app
from agent_meow.stores.agent_store.sqlalchemy_store import SqlAlchemyAgentStore
from agent_meow.stores.artifact_store.local import LocalArtifactStore
from agent_meow.stores.comment_store.sqlalchemy_store import SqlAlchemyCommentStore
from agent_meow.stores.conversation_store.sqlalchemy_store import (
    SqlAlchemyConversationStore,
)
from agent_meow.stores.document_store.sqlalchemy_store import SqlAlchemyDocumentStore
from agent_meow.stores.file_store.sqlalchemy_store import SqlAlchemyFileStore


@pytest.fixture()
def resources_app(runtime_init: None, db_uri: str, tmp_path: Path) -> FastAPI:
    """Build an app that mounts the docs routes with real stores."""
    artifact_store = LocalArtifactStore(str(tmp_path / "artifacts"))
    return create_app(
        agent_store=SqlAlchemyAgentStore(db_uri),
        file_store=SqlAlchemyFileStore(db_uri),
        conversation_store=SqlAlchemyConversationStore(db_uri),
        artifact_store=artifact_store,
        agent_cache=AgentCache(artifact_store=artifact_store, cache_dir=tmp_path / "cache"),
        comment_store=SqlAlchemyCommentStore(db_uri),
        document_store=SqlAlchemyDocumentStore(db_uri),
    )


@pytest_asyncio.fixture()
async def resources_client(resources_app: FastAPI) -> AsyncIterator[httpx.AsyncClient]:
    """HTTP client wired to the docs-enabled app."""
    transport = httpx.ASGITransport(app=resources_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture()
def seeded_session_id(db_uri: str) -> str:
    """Create a real conversation row the resource routes can attach to."""
    return SqlAlchemyConversationStore(db_uri).create_conversation().id


# Minimal-but-real ZIP magic: office files are ZIP containers, and the
# route validates extension/mime rather than parsing content, so a tiny
# ZIP header is a faithful stand-in for the officecli fixture bytes.
_DOCX_BYTES = b"PK\x03\x04" + b"word/document.xml" + b"\x00" * 16

_DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


@pytest.mark.asyncio
async def test_document_binary_upload_roundtrip(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Multipart upload stores bytes in artifacts + metadata row; GET returns them."""
    upload = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        files={"file": ("Report.docx", _DOCX_BYTES, _DOCX_MIME)},
    )
    assert upload.status_code == 200, upload.text
    doc = upload.json()
    assert doc["title"] == "Report"
    assert doc["format"] == "binary"
    assert doc["filename"] == "Report.docx"
    assert doc["mime"] == _DOCX_MIME
    assert doc["bytes_size"] == len(_DOCX_BYTES)
    assert doc["artifact_key"]

    download = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents/{doc['id']}/binary"
    )
    assert download.status_code == 200
    assert download.headers["content-type"] == _DOCX_MIME
    assert download.content == _DOCX_BYTES
    assert "attachment" in download.headers["content-disposition"]
    assert "Report.docx" in download.headers["content-disposition"]


@pytest.mark.asyncio
async def test_document_binary_download_unknown_doc(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Binary fetch for a missing document is a 404."""
    resp = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents/nope/binary"
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_document_binary_download_markdown_doc_404(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Markdown documents have no binary payload — 404, not an empty body."""
    create = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        json={"title": "Notes", "content_md": "# hi"},
    )
    assert create.status_code == 200
    doc_id = create.json()["id"]
    resp = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents/{doc_id}/binary"
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_document_binary_upload_empty_rejected(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """An empty multipart body is rejected instead of storing a 0-byte doc."""
    resp = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        files={"file": ("empty.docx", b"", _DOCX_MIME)},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_document_binary_upload_missing_session(
    resources_client: httpx.AsyncClient,
) -> None:
    """Uploads to a nonexistent session are a 404."""
    resp = await resources_client.post(
        "/v1/sessions/ghost-session/resources/documents",
        files={"file": ("Report.docx", _DOCX_BYTES, _DOCX_MIME)},
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_document_list_includes_binary_docs(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """The list endpoint surfaces binary docs with their metadata fields."""
    upload = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        files={"file": ("Report.docx", _DOCX_BYTES, _DOCX_MIME)},
    )
    assert upload.status_code == 200
    listing = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents"
    )
    assert listing.status_code == 200
    docs = listing.json()["data"]
    binary = [d for d in docs if d["id"] == upload.json()["id"]]
    assert len(binary) == 1
    assert binary[0]["filename"] == "Report.docx"
    assert binary[0]["format"] == "binary"


@pytest.mark.asyncio
async def test_document_delete_binary_doc(
    resources_client: httpx.AsyncClient,
    seeded_session_id: str,
) -> None:
    """Binary docs delete like any other document."""
    upload = await resources_client.post(
        f"/v1/sessions/{seeded_session_id}/resources/documents",
        files={"file": ("Report.docx", _DOCX_BYTES, _DOCX_MIME)},
    )
    doc_id = upload.json()["id"]
    deleted = await resources_client.delete(
        f"/v1/sessions/{seeded_session_id}/resources/documents/{doc_id}"
    )
    assert deleted.status_code == 200
    fetch = await resources_client.get(
        f"/v1/sessions/{seeded_session_id}/resources/documents/{doc_id}"
    )
    assert fetch.status_code == 404