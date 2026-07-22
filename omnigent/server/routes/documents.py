"""Routes for per-session documents (agent-meow Docs surface).

Documents are rich-text documents owned by a conversation. Each has a
markdown representation and optionally a ProseMirror/Tiptap JSON
representation for round-trip editing in the web UI. Binary office
documents (.docx/.xlsx/.pptx) are stored via ArtifactStore with a
``/file`` sub-route for upload/download.
"""

from __future__ import annotations

import asyncio
import mimetypes
import uuid
from typing import Any

from fastapi import APIRouter, File, Request, UploadFile
from pydantic import BaseModel

from omnigent.entities import Document
from omnigent.errors import ErrorCode, OmnigentError
from omnigent.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from omnigent.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from omnigent.stores import ArtifactStore, ConversationStore
from omnigent.stores.document_store import DocumentStore
from omnigent.stores.permission_store import PermissionStore


# ── Response models ───────────────────────────────────────────────────────────


def _document_to_dict(doc: Document) -> dict[str, Any]:
    """Project a :class:`Document` to the API response shape.

    :param doc: The document entity to project.
    :returns: Dict with id, conversation_id, title, format, content_md,
        content_json, created_at, updated_at, version, created_by.
    """
    return {
        "id": doc.id,
        "object": "document",
        "conversation_id": doc.conversation_id,
        "title": doc.title,
        "format": doc.format,
        "content_md": doc.content_md,
        "content_json": doc.content_json,
        "created_at": doc.created_at,
        "updated_at": doc.updated_at,
        "version": doc.version,
        "created_by": doc.created_by,
    }


# ── Request models ────────────────────────────────────────────────────────────


class CreateDocumentRequest(BaseModel):
    """Request body for ``POST /sessions/{id}/resources/documents``.

    :param title: Document title. Defaults to ``"Untitled"``.
    :param format: Content format — ``"markdown"`` or ``"prosemirror"``.
    :param content_md: Initial markdown body. Defaults to ``""``.
    :param content_json: Initial ProseMirror JSON, or ``None``.
    """

    title: str = "Untitled"
    format: str = "markdown"
    content_md: str = ""
    content_json: str | None = None


class UpdateDocumentRequest(BaseModel):
    """Request body for ``PATCH /sessions/{id}/resources/documents/{doc_id}``.

    All fields optional; ``None`` leaves the field unchanged.
    """

    title: str | None = None
    content_md: str | None = None
    content_json: str | None = None


# ── Router factory ────────────────────────────────────────────────────────────


def create_documents_router(
    store: DocumentStore,
    artifact_store: ArtifactStore | None = None,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the documents router.

    All routes are scoped to ``/sessions/{session_id}/resources/documents``.

    :param store: The shared :class:`DocumentStore` instance.
    :param artifact_store: Optional :class:`ArtifactStore` for binary office
        document blob storage. When ``None``, the ``/file`` sub-route and
        multipart upload are unavailable (the runner falls back to JSON-only).
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :returns: A configured :class:`APIRouter`.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError("conversation_store is required when permission_store is provided")
    router = APIRouter()

    async def _require_session_access(user_id: str | None, session_id: str, level: int) -> None:
        """Require access and a real session before document mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(user_id, session_id, level, permission_store, conversation_store)
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise OmnigentError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/documents")
    async def create_document(
        request: Request,
        session_id: str,
        body: CreateDocumentRequest,
    ) -> dict[str, Any]:
        """Create a new document in a session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        doc = await asyncio.to_thread(
            store.add,
            session_id,
            body.title,
            format=body.format,
            content_md=body.content_md,
            content_json=body.content_json,
            created_by=created_by,
        )
        return _document_to_dict(doc)

    @router.get("/sessions/{session_id}/resources/documents")
    async def list_documents(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """List all documents in a session, newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        docs = await asyncio.to_thread(store.list_for_conversation, session_id)
        return {
            "object": "list",
            "data": [_document_to_dict(d) for d in docs],
        }

    @router.get("/sessions/{session_id}/resources/documents/{document_id}")
    async def get_document(
        request: Request,
        session_id: str,
        document_id: str,
    ) -> dict[str, Any]:
        """Fetch a single document by id."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        doc = await asyncio.to_thread(store.get, document_id, session_id)
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)

    @router.patch("/sessions/{session_id}/resources/documents/{document_id}")
    async def update_document(
        request: Request,
        session_id: str,
        document_id: str,
        body: UpdateDocumentRequest,
    ) -> dict[str, Any]:
        """Update a document's title and/or content."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        doc = await asyncio.to_thread(
            store.update,
            document_id,
            session_id,
            title=body.title,
            content_md=body.content_md,
            content_json=body.content_json,
        )
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)

    @router.delete("/sessions/{session_id}/resources/documents/{document_id}")
    async def delete_document(
        request: Request,
        session_id: str,
        document_id: str,
    ) -> dict[str, Any]:
        """Delete a document."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        doc = await asyncio.to_thread(store.delete, document_id, session_id)
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)

    # ── Binary office document routes (ArtifactStore-backed) ────────────

    @router.get("/sessions/{session_id}/resources/documents/{document_id}/file")
    async def get_document_file(
        request: Request,
        session_id: str,
        document_id: str,
    ) -> Any:
        """Fetch a document's binary content (for office files).

        Returns the raw bytes stored via multipart upload. Non-binary
        documents (markdown/text only) return 404.
        """
        if artifact_store is None:
            raise OmnigentError("Binary document storage is not configured", code=ErrorCode.NOT_FOUND)
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        doc = await asyncio.to_thread(store.get, document_id, session_id)
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        artifact_key = doc.content_md  # artifact_key stored in content_md for binary docs
        if not artifact_key or not artifact_key.startswith("documents/"):
            raise OmnigentError("Document has no binary content", code=ErrorCode.NOT_FOUND)
        data = await asyncio.to_thread(artifact_store.get, artifact_key)
        from fastapi import Response

        return Response(content=data, media_type=doc.format or "application/octet-stream")

    @router.post("/sessions/{session_id}/resources/documents/{document_id}/file")
    async def upload_document_file(
        request: Request,
        session_id: str,
        document_id: str,
        file: UploadFile = File(...),
    ) -> dict[str, Any]:
        """Upload binary content for an existing document (office files).

        Stores the binary blob in ``ArtifactStore`` and records the
        artifact key in the document's ``content_md`` field. The
        document must already exist (created via the JSON POST first).
        """
        if artifact_store is None:
            raise OmnigentError("Binary document storage is not configured", code=ErrorCode.NOT_FOUND)
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        doc = await asyncio.to_thread(store.get, document_id, session_id)
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        data = await file.read()
        artifact_key = f"documents/{session_id}/{document_id}/{file.filename or 'file'}"
        await asyncio.to_thread(artifact_store.put, artifact_key, data)
        mime = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
        doc = await asyncio.to_thread(
            store.update,
            document_id,
            session_id,
            content_md=artifact_key,
            content_json=mime,
        )
        if doc is None:
            raise OmnigentError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)

    # ── Multipart POST for office document creation (binary upload) ─────

    @router.post("/sessions/{session_id}/resources/documents/file")
    async def create_document_with_file(
        request: Request,
        session_id: str,
        title: str = "Untitled",
        file: UploadFile = File(...),
    ) -> dict[str, Any]:
        """Create a document with an attached binary file (office docs).

        Multipart-only: the JSON POST is for markdown/text documents;
        this route is for binary office files (.docx/.xlsx/.pptx).
        """
        if artifact_store is None:
            raise OmnigentError("Binary document storage is not configured", code=ErrorCode.NOT_FOUND)
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        data = await file.read()
        document_id = str(uuid.uuid4())
        mime = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
        artifact_key = f"documents/{session_id}/{document_id}/{file.filename or 'file'}"
        await asyncio.to_thread(artifact_store.put, artifact_key, data)
        doc = await asyncio.to_thread(
            store.add,
            session_id,
            title,
            format=mime,
            content_md=artifact_key,
            content_json=None,
            created_by=created_by,
        )
        return _document_to_dict(doc)

    return router