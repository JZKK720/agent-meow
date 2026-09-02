"""Routes for per-session documents (agent-meow Docs surface).

Documents are rich-text documents owned by a conversation. Each has a
markdown representation and optionally a ProseMirror/Tiptap JSON
representation for round-trip editing in the web UI.

Office files (docx/xlsx/pptx/pdf — produced by the runner's officecli
tools or uploaded from the UI) are stored as documents in ``binary``
format: metadata in the ``DocumentStore`` row, bytes in the
``ArtifactStore`` (the ImageStore pattern). ``POST .../documents``
accepts multipart for these; ``GET .../{doc_id}/binary`` serves them
back with ``Content-Disposition: attachment``.
"""

from __future__ import annotations

import asyncio
import mimetypes
import uuid
from typing import Any

from fastapi import APIRouter, Request, Response
from pydantic import BaseModel
from starlette.datastructures import UploadFile as StarletteUploadFile

from agent_meow.entities import Document
from agent_meow.errors import AgentMeowError, ErrorCode
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ArtifactStore, ConversationStore
from agent_meow.stores.document_store import DocumentStore
from agent_meow.stores.permission_store import PermissionStore

# Cap on binary uploads (256 MB, same as the workspace scan). Office
# files are far smaller in practice; the cap just prevents memory blowup.
_MAX_BINARY_BYTES = 256 * 1024 * 1024


def _attachment_disposition(filename: str) -> str:
    """Build an RFC 6266 attachment header, ASCII-safe.

    Non-ASCII filenames fall back to ``download`` + extension so the
    header stays header-safe (mirrors the workspace raw-file route).
    """
    try:
        filename.encode("ascii")
    except UnicodeEncodeError:
        suffix = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
        filename = f"download.{suffix}"
    return f'attachment; filename="{filename}"'


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
        "filename": doc.filename,
        "mime": doc.mime,
        "artifact_key": doc.artifact_key,
        "bytes_size": doc.bytes_size,
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
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
    artifact_store: ArtifactStore | None = None,
) -> APIRouter:
    """Build the documents router.

    All routes are scoped to ``/sessions/{session_id}/resources/documents``.

    :param store: The shared :class:`DocumentStore` instance.
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :param artifact_store: Blob store for binary office documents. When
        ``None``, the multipart upload route is not mounted.
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
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    async def _store_binary_upload(
        session_id: str,
        file: StarletteUploadFile,
        created_by: str | None,
    ) -> dict[str, Any]:
        """Persist a multipart upload as a ``binary``-format document.

        Bytes go to the ArtifactStore; the metadata row carries
        filename/mime/artifact_key. The title is the filename minus its
        extension.
        """
        if artifact_store is None:
            raise AgentMeowError(
                "Binary document storage not configured", code=ErrorCode.INTERNAL_ERROR
            )
        filename = file.filename or "untitled"
        data = await file.read()
        if not data:
            raise AgentMeowError("Empty upload", code=ErrorCode.INVALID_INPUT)
        if len(data) > _MAX_BINARY_BYTES:
            raise AgentMeowError(
                f"File too large ({len(data)} bytes; cap is {_MAX_BINARY_BYTES})",
                code=ErrorCode.INVALID_INPUT,
            )
        mime = file.content_type or mimetypes.guess_type(filename)[0] or ""
        if mime in ("application/json", "text/plain", ""):
            # Browsers mislabel unknown binaries; fall back to extension.
            mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        doc_id = str(uuid.uuid4())
        artifact_key = f"documents/{session_id}/{doc_id}/{filename}"
        await asyncio.to_thread(artifact_store.put, artifact_key, data)
        title = filename.rsplit(".", 1)[0] or filename
        doc = await asyncio.to_thread(
            store.add,
            session_id,
            title,
            format="binary",
            filename=filename,
            mime=mime,
            artifact_key=artifact_key,
            bytes_size=len(data),
            created_by=created_by,
        )
        return _document_to_dict(doc)

    @router.post("/sessions/{session_id}/resources/documents")
    async def create_document(
        request: Request,
        session_id: str,
    ) -> dict[str, Any]:
        """Create a new document in a session.

        Dispatches on Content-Type: JSON bodies create
        markdown/prosemirror documents; multipart bodies with a ``file``
        part store an office binary (the runner's doc_create_office /
        doc_edit_office / doc_export re-uploads all land here).
        """
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        content_type = (request.headers.get("content-type") or "").lower()
        if content_type.startswith("multipart/form-data"):
            form = await request.form()
            file = form.get("file")
            # The form parser yields starlette's UploadFile base class;
            # fastapi's is a subclass so isinstance against it fails.
            if not isinstance(file, StarletteUploadFile):
                raise AgentMeowError(
                    "Multipart upload requires a 'file' part", code=ErrorCode.INVALID_INPUT
                )
            return await _store_binary_upload(session_id, file, created_by)
        try:
            payload = await request.json()
        except ValueError as exc:
            raise AgentMeowError("Invalid JSON body", code=ErrorCode.INVALID_INPUT) from exc
        body = CreateDocumentRequest.model_validate(payload)
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
            raise AgentMeowError("Document not found", code=ErrorCode.NOT_FOUND)
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
            raise AgentMeowError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)
    @router.get("/sessions/{session_id}/resources/documents/{document_id}/binary")
    async def download_binary_document(
        request: Request,
        session_id: str,
        document_id: str,
    ) -> Response:
        """Serve a binary document's bytes with an attachment disposition."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        if artifact_store is None:
            raise AgentMeowError(
                "Binary document storage not configured", code=ErrorCode.INTERNAL_ERROR
            )
        doc = await asyncio.to_thread(store.get, document_id, session_id)
        if doc is None:
            raise AgentMeowError("Document not found", code=ErrorCode.NOT_FOUND)
        if not doc.artifact_key:
            # Markdown documents have no binary payload.
            raise AgentMeowError("Document has no binary payload", code=ErrorCode.NOT_FOUND)
        data = await asyncio.to_thread(artifact_store.get, doc.artifact_key)
        return Response(
            content=data,
            media_type=doc.mime or "application/octet-stream",
            headers={
                "Content-Disposition": _attachment_disposition(doc.filename or "download"),
                "X-Content-Type-Options": "nosniff",
            },
        )
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
            raise AgentMeowError("Document not found", code=ErrorCode.NOT_FOUND)
        return _document_to_dict(doc)

    return router