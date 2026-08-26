"""Routes for per-session documents (agent-meow Docs surface).

Documents are rich-text documents owned by a conversation. Each has a
markdown representation and optionally a ProseMirror/Tiptap JSON
representation for round-trip editing in the web UI.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.entities import Document
from agent_meow.errors import ErrorCode, AgentMeowError
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ConversationStore
from agent_meow.stores.document_store import DocumentStore
from agent_meow.stores.permission_store import PermissionStore


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
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the documents router.

    All routes are scoped to ``/sessions/{session_id}/resources/documents``.

    :param store: The shared :class:`DocumentStore` instance.
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
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

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