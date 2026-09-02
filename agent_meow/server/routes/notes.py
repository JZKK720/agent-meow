"""Routes for per-session notes (agent-meow Notes surface).

Notes are lightweight markdown notes owned by a conversation — no Tiptap,
no ProseMirror JSON. They support pinning (pinned-first listing) and
comma-separated tags for quick retrieval.
"""

from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, Request
from pydantic import BaseModel

from agent_meow.entities import Note
from agent_meow.errors import AgentMeowError, ErrorCode
from agent_meow.server.auth import LEVEL_EDIT, LEVEL_READ, AuthProvider
from agent_meow.server.routes._auth_helpers import (
    attribution_user,
    get_user_id,
    require_access,
)
from agent_meow.stores import ConversationStore
from agent_meow.stores.note_store import NoteStore
from agent_meow.stores.permission_store import PermissionStore


def _note_to_dict(note: Note) -> dict[str, Any]:
    """Project a :class:`Note` to the API response shape."""
    return {
        "id": note.id,
        "object": "note",
        "conversation_id": note.conversation_id,
        "title": note.title,
        "body_md": note.body_md,
        "pinned": note.pinned,
        "tags": note.tags,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "created_by": note.created_by,
    }


class CreateNoteRequest(BaseModel):
    """Request body for ``POST /sessions/{id}/resources/notes``.

    :param title: Note title. Defaults to ``"Untitled"``.
    :param body_md: Markdown body. Defaults to ``""``.
    :param pinned: Whether the note starts pinned. Defaults to ``False``.
    :param tags: Comma-separated tags. Defaults to ``""``.
    """

    title: str = "Untitled"
    body_md: str = ""
    pinned: bool = False
    tags: str = ""


class UpdateNoteRequest(BaseModel):
    """Request body for ``PATCH /sessions/{id}/resources/notes/{note_id}``.

    All fields optional; ``None`` leaves the field unchanged.
    """

    title: str | None = None
    body_md: str | None = None
    tags: str | None = None


class PinNoteRequest(BaseModel):
    """Request body for ``POST .../notes/{note_id}/pin``."""

    pinned: bool


def create_notes_router(
    store: NoteStore,
    auth_provider: AuthProvider | None = None,
    permission_store: PermissionStore | None = None,
    conversation_store: ConversationStore | None = None,
) -> APIRouter:
    """Build the notes router.

    All routes are scoped to ``/sessions/{session_id}/resources/notes``.

    :param store: The shared :class:`NoteStore` instance.
    :param auth_provider: Auth provider. ``None`` in single-user mode.
    :param permission_store: Permission store. ``None`` disables enforcement.
    :param conversation_store: Conversation store for session existence checks.
    :returns: A configured :class:`APIRouter`.
    """
    if permission_store is not None and conversation_store is None:
        raise ValueError("conversation_store is required when permission_store is provided")
    router = APIRouter()

    async def _require_session_access(user_id: str | None, session_id: str, level: int) -> None:
        """Require access and a real session before note mutations."""
        if permission_store is not None:
            assert conversation_store is not None
            await require_access(user_id, session_id, level, permission_store, conversation_store)
        if conversation_store is not None:
            conversation = await asyncio.to_thread(conversation_store.get_conversation, session_id)
            if conversation is None:
                raise AgentMeowError("Session not found", code=ErrorCode.NOT_FOUND)

    @router.post("/sessions/{session_id}/resources/notes")
    async def create_note(
        request: Request,
        session_id: str,
        body: CreateNoteRequest,
    ) -> dict[str, Any]:
        """Create a new note in a session."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        created_by = attribution_user(user_id)
        note = await asyncio.to_thread(
            store.add,
            session_id,
            body.title,
            body_md=body.body_md,
            pinned=body.pinned,
            tags=body.tags,
            created_by=created_by,
        )
        return _note_to_dict(note)

    @router.get("/sessions/{session_id}/resources/notes")
    async def list_notes(
        request: Request,
        session_id: str,
        pinned_only: bool = False,
        tag: str | None = None,
    ) -> dict[str, Any]:
        """List notes in a session, pinned-first then newest-first."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        notes = await asyncio.to_thread(
            store.list_for_conversation, session_id, pinned_only=pinned_only, tag=tag
        )
        return {
            "object": "list",
            "data": [_note_to_dict(n) for n in notes],
        }

    @router.get("/sessions/{session_id}/resources/notes/{note_id}")
    async def get_note(
        request: Request,
        session_id: str,
        note_id: str,
    ) -> dict[str, Any]:
        """Fetch a single note by id."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_READ)
        note = await asyncio.to_thread(store.get, note_id, session_id)
        if note is None:
            raise AgentMeowError("Note not found", code=ErrorCode.NOT_FOUND)
        return _note_to_dict(note)

    @router.patch("/sessions/{session_id}/resources/notes/{note_id}")
    async def update_note(
        request: Request,
        session_id: str,
        note_id: str,
        body: UpdateNoteRequest,
    ) -> dict[str, Any]:
        """Update a note's title and/or body and/or tags."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        note = await asyncio.to_thread(
            store.update,
            note_id,
            session_id,
            title=body.title,
            body_md=body.body_md,
            tags=body.tags,
        )
        if note is None:
            raise AgentMeowError("Note not found", code=ErrorCode.NOT_FOUND)
        return _note_to_dict(note)

    @router.post("/sessions/{session_id}/resources/notes/{note_id}/pin")
    async def pin_note(
        request: Request,
        session_id: str,
        note_id: str,
        body: PinNoteRequest,
    ) -> dict[str, Any]:
        """Pin or unpin a note."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        note = await asyncio.to_thread(store.set_pinned, note_id, session_id, body.pinned)
        if note is None:
            raise AgentMeowError("Note not found", code=ErrorCode.NOT_FOUND)
        return _note_to_dict(note)

    @router.delete("/sessions/{session_id}/resources/notes/{note_id}")
    async def delete_note(
        request: Request,
        session_id: str,
        note_id: str,
    ) -> dict[str, Any]:
        """Delete a note."""
        user_id = get_user_id(request, auth_provider)
        await _require_session_access(user_id, session_id, LEVEL_EDIT)
        note = await asyncio.to_thread(store.delete, note_id, session_id)
        if note is None:
            raise AgentMeowError("Note not found", code=ErrorCode.NOT_FOUND)
        return _note_to_dict(note)

    return router