"""Document tools (``doc_*``) for the agent-meow Docs surface.

These tools are **runner-dispatched**: the runner proxies the agent-meow
server's document REST endpoints over ``server_client`` (same channel as
``sys_agent_*``). They ship as schema-only :class:`~omnigent.tools.base.Tool`
subclasses — the base-class ``invoke`` fails loud if the AP-side path ever
reaches them.

- ``doc_create`` → ``POST /v1/sessions/{id}/resources/documents``
- ``doc_get`` → ``GET /v1/sessions/{id}/resources/documents/{doc_id}``
- ``doc_list`` → ``GET /v1/sessions/{id}/resources/documents``
- ``doc_update`` → ``PATCH /v1/sessions/{id}/resources/documents/{doc_id}``
- ``doc_generate`` → LLM-driven: takes an outline/prompt and produces a
  markdown document. Implemented as a pure schema tool — the runner's tool
  dispatch intercepts the call and routes it to the agent's own LLM loop
  with a doc-generation system prompt, then persists the result via
  ``doc_create``. The schema-only class here just advertises the contract.
"""

from __future__ import annotations

from typing import Any

from omnigent.tools.base import Tool


class DocCreateTool(Tool):
    """Create a new document in a session.

    Runner-dispatched: proxies ``POST /v1/sessions/{id}/resources/documents``.
    Returns the new document's id, title, and content.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_create"

    @classmethod
    def description(cls) -> str:
        return (
            "Create a new document in a session. Pass a title and optional "
            "markdown body (content_md) or ProseMirror JSON (content_json). "
            "Returns the new document's id, title, format, and content. "
            "Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocCreateTool.name(),
                "description": DocCreateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the document in.",
                        },
                        "title": {
                            "type": "string",
                            "description": "Document title. Defaults to 'Untitled'.",
                        },
                        "content_md": {
                            "type": "string",
                            "description": "Initial markdown body. Defaults to empty.",
                        },
                        "format": {
                            "type": "string",
                            "description": "'markdown' (default) or 'prosemirror'.",
                        },
                    },
                    "required": ["session_id", "title"],
                    "additionalProperties": False,
                },
            },
        }


class DocGetTool(Tool):
    """Fetch a single document by id.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/documents/{doc_id}``.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_get"

    @classmethod
    def description(cls) -> str:
        return (
            "Fetch a single document by id: title, format, content_md, "
            "content_json, version, updated_at. Requires session_id and "
            "document_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocGetTool.name(),
                "description": DocGetTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the document.",
                        },
                        "document_id": {
                            "type": "string",
                            "description": "The document id to fetch.",
                        },
                    },
                    "required": ["session_id", "document_id"],
                    "additionalProperties": False,
                },
            },
        }


class DocListTool(Tool):
    """List all documents in a session.

    Runner-dispatched: proxies ``GET /v1/sessions/{id}/resources/documents``.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_list"

    @classmethod
    def description(cls) -> str:
        return (
            "List all documents in a session, newest-first. Returns id, "
            "title, format, updated_at, version for each. Requires session_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocListTool.name(),
                "description": DocListTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to list documents for.",
                        },
                    },
                    "required": ["session_id"],
                    "additionalProperties": False,
                },
            },
        }


class DocUpdateTool(Tool):
    """Update a document's title and/or content.

    Runner-dispatched: proxies ``PATCH /v1/sessions/{id}/resources/documents/{doc_id}``.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_update"

    @classmethod
    def description(cls) -> str:
        return (
            "Update a document's title and/or content (content_md and/or "
            "content_json). Bumps version. Requires session_id and "
            "document_id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocUpdateTool.name(),
                "description": DocUpdateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the document.",
                        },
                        "document_id": {
                            "type": "string",
                            "description": "The document id to update.",
                        },
                        "title": {
                            "type": "string",
                            "description": "New title, or omit to leave unchanged.",
                        },
                        "content_md": {
                            "type": "string",
                            "description": "New markdown body, or omit to leave unchanged.",
                        },
                        "content_json": {
                            "type": "string",
                            "description": "New ProseMirror JSON, or omit to leave unchanged.",
                        },
                    },
                    "required": ["session_id", "document_id"],
                    "additionalProperties": False,
                },
            },
        }


class DocGenerateTool(Tool):
    """Generate a markdown document from an outline or prompt.

    This is a **schema-only** tool: the runner's tool dispatch intercepts
    the call by name and, in v1, persists a structured placeholder draft
    containing the topic, outline, and instructions. The agent is expected
    to refine that draft with ``doc_update``. A future version may route the
    call back into the agent's own LLM loop for full-body generation.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_generate"

    @classmethod
    def description(cls) -> str:
        return (
            "Create a placeholder markdown draft from a topic and optional "
            "outline. In v1 the runtime persists a structured starter "
            "document (topic/outline/instructions) that the agent can refine "
            "later with doc_update; it does not synthesize a full body yet. "
            "Returns the new document's id and title. Requires session_id "
            "and topic; outline is optional but recommended for structure."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocGenerateTool.name(),
                "description": DocGenerateTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the generated document in.",
                        },
                        "topic": {
                            "type": "string",
                            "description": "The document topic / title.",
                        },
                        "outline": {
                            "type": "string",
                            "description": "Optional markdown outline (headings) to structure the doc.",
                        },
                        "instructions": {
                            "type": "string",
                            "description": "Optional style/length instructions, e.g. 'concise, ~500 words'.",
                        },
                    },
                    "required": ["session_id", "topic"],
                    "additionalProperties": False,
                },
            },
        }