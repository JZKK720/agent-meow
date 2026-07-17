"""Document tools (``doc_*``) for the agent-meow Docs surface.

These tools are **runner-dispatched**: the runner proxies the agent-meow
server's document REST endpoints over ``server_client`` (same channel as
``sys_agent_*``). They ship as schema-only :class:`~?agent_meow.tools.base.Tool`
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

from agent_meow.tools.base import Tool


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


class DocCreateOfficeTool(Tool):
    """Create a blank or templated Office document (.docx/.xlsx/.pptx).

    Runner-dispatched: the runner shells out to the ``officecli`` binary
    (resolved via ``shutil.which`` or ``OFFICECLI_BIN``) to run ``create``
    and ``add`` commands, then persists the generated file as a session
    document resource.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_create_office"

    @classmethod
    def description(cls) -> str:
        return (
            "Create a blank Office document (.docx, .xlsx, or .pptx) and "
            "optionally seed it with content. Backed by the officecli CLI. "
            "Requires session_id and format (one of docx, xlsx, pptx). "
            "Returns the new document's id and title."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocCreateOfficeTool.name(),
                "description": DocCreateOfficeTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the document in.",
                        },
                        "title": {
                            "type": "string",
                            "description": "Document title / filename stem.",
                        },
                        "format": {
                            "type": "string",
                            "enum": ["docx", "xlsx", "pptx"],
                            "description": "Office format: docx (Word), xlsx (Excel), or pptx (PowerPoint).",
                        },
                        "content_md": {
                            "type": "string",
                            "description": (
                                "Optional initial content. For docx, treated as "
                                "paragraph text (one paragraph per line). For pptx, "
                                "each line becomes a slide title. Ignored for xlsx."
                            ),
                        },
                    },
                    "required": ["session_id", "title", "format"],
                    "additionalProperties": False,
                },
            },
        }


class DocEditOfficeTool(Tool):
    """Edit an Office document via path-based element operations.

    Runner-dispatched: the runner shells out to ``officecli`` to run
    ``add``/``set``/``move``/``query`` commands against the document file.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_edit_office"

    @classmethod
    def description(cls) -> str:
        return (
            "Edit an Office document (.docx/.xlsx/.pptx) using officecli "
            "path-based element operations: add, set, move, remove, query. "
            "Requires session_id, document_id (the session doc resource), "
            "command (add|set|move|remove|query), path (element path), and "
            "optional props (JSON object of element properties)."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocEditOfficeTool.name(),
                "description": DocEditOfficeTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the document.",
                        },
                        "document_id": {
                            "type": "string",
                            "description": "The session document resource id to edit.",
                        },
                        "command": {
                            "type": "string",
                            "enum": ["add", "set", "move", "remove", "query"],
                            "description": "The officecli DOM operation to perform.",
                        },
                        "path": {
                            "type": "string",
                            "description": (
                                "Element path, e.g. '/body' (add a paragraph), "
                                "'/body/p[1]' (set first paragraph), "
                                "'/sheet1/A1' (xlsx cell)."
                            ),
                        },
                        "type": {
                            "type": "string",
                            "description": (
                                "Element type for 'add' commands, e.g. 'paragraph', "
                                "'slide', 'sheet', 'row'."
                            ),
                        },
                        "props": {
                            "type": "object",
                            "description": (
                                "Element properties as a JSON object, e.g. "
                                "{\"text\": \"Hello\", \"bold\": true}."
                            ),
                        },
                    },
                    "required": ["session_id", "document_id", "command", "path"],
                    "additionalProperties": False,
                },
            },
        }


class DocExportTool(Tool):
    """Export/render an Office document to HTML, PNG, or PDF.

    Runner-dispatched: the runner shells out to ``officecli view`` with the
    requested mode (html, screenshot, pdf) and persists the rendered output
    as a session artifact.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_export"

    @classmethod
    def description(cls) -> str:
        return (
            "Export an Office document (.docx/.xlsx/.pptx) to a rendered "
            "format — html, png (screenshot), or pdf — using officecli's "
            "built-in rendering engine. Useful for letting the agent 'see' "
            "the document. Requires session_id, document_id, and mode "
            "(html|png|pdf). Returns the artifact id and download url."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocExportTool.name(),
                "description": DocExportTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session that owns the document.",
                        },
                        "document_id": {
                            "type": "string",
                            "description": "The session document resource id to export.",
                        },
                        "mode": {
                            "type": "string",
                            "enum": ["html", "png", "pdf"],
                            "description": "Render mode: html (static snapshot), png (screenshot), or pdf.",
                        },
                        "page": {
                            "type": "integer",
                            "description": "Optional page/slide number for png/pdf export (1-indexed).",
                        },
                    },
                    "required": ["session_id", "document_id", "mode"],
                    "additionalProperties": False,
                },
            },
        }


class DocConvertTool(Tool):
    """Convert any file or URL to Markdown for ingestion/RAG.

    Runner-dispatched: the runner shells out to the ``markitdown`` CLI to
    convert PDF, Office, audio, image, HTML, or URL inputs into Markdown
    text suitable for LLM consumption and search indexing.
    """

    @classmethod
    def name(cls) -> str:
        return "doc_convert"

    @classmethod
    def description(cls) -> str:
        return (
            "Convert a local file or URL to Markdown text for LLM ingestion "
            "and search. Supports PDF, Word, Excel, PowerPoint, images (OCR), "
            "audio (transcription), HTML, CSV, JSON, and more via MarkItDown. "
            "Requires session_id and source (a file path or http(s) URL). "
            "Returns the converted Markdown text and, if persist=True, a new "
            "document resource id."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": DocConvertTool.name(),
                "description": DocConvertTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "session_id": {
                            "type": "string",
                            "description": "The session to create the converted document in.",
                        },
                        "source": {
                            "type": "string",
                            "description": (
                                "Path to a local file or an http(s):// URL to "
                                "convert to Markdown."
                            ),
                        },
                        "title": {
                            "type": "string",
                            "description": "Optional title for the resulting document. Defaults to the source filename.",
                        },
                        "persist": {
                            "type": "boolean",
                            "description": "If true (default), persist the Markdown as a new document resource. If false, return the text only.",
                        },
                    },
                    "required": ["session_id", "source"],
                    "additionalProperties": False,
                },
            },
        }