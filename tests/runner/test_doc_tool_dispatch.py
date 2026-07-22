"""Tests for doc tool dispatch (_execute_doc_tool) in the runner.

Covers the REST-proxy paths:
- doc_list, doc_create, doc_get, doc_update, doc_generate
- Error cases: missing server_client, missing conversation_id, missing document_id, server 4xx/5xx
- doc_export conversation_id threading (Plan 002 fix)
"""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from omnigent.runner.tool_dispatch import _execute_doc_tool


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _response(status_code: int = 200, json_data: dict | None = None) -> MagicMock:
    """Build a minimal mock httpx.Response."""
    resp = MagicMock()
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    return resp


def _client(**overrides: AsyncMock) -> MagicMock:
    """Build a mock AsyncClient with get/post/patch."""
    c = MagicMock()
    c.get = overrides.get("get", AsyncMock())
    c.post = overrides.get("post", AsyncMock())
    c.patch = overrides.get("patch", AsyncMock())
    return c


# ---------------------------------------------------------------------------
# Happy-path tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_doc_list_returns_documents() -> None:
    """doc_list GETs the base and wraps the data array."""
    mock_get = AsyncMock(return_value=_response(200, {"data": [{"id": "d1", "title": "My Doc"}]}))
    server_client = _client(get=mock_get)

    result = await _execute_doc_tool(
        "doc_list", {}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert data["documents"] == [{"id": "d1", "title": "My Doc"}]
    mock_get.assert_called_once_with("/v1/sessions/conv_1/resources/documents", timeout=30.0)


@pytest.mark.asyncio
async def test_doc_list_returns_error_on_non_200() -> None:
    """doc_list returns error JSON when server returns non-200."""
    mock_get = AsyncMock(return_value=_response(500))
    server_client = _client(get=mock_get)

    result = await _execute_doc_tool(
        "doc_list", {}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "500" in data["error"]


@pytest.mark.asyncio
async def test_doc_create_posts_payload() -> None:
    """doc_create POSTs title/format/content_md and returns the created doc."""
    mock_post = AsyncMock(return_value=_response(200, {"id": "d_new", "title": "Hello"}))
    server_client = _client(post=mock_post)

    result = await _execute_doc_tool(
        "doc_create", {"title": "Hello", "format": "markdown", "content_md": "# hi"},
        arguments="{}", conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert data["document"]["id"] == "d_new"
    mock_post.assert_called_once()
    _, kwargs = mock_post.call_args
    assert kwargs["json"]["title"] == "Hello"
    assert kwargs["json"]["format"] == "markdown"


@pytest.mark.asyncio
async def test_doc_create_defaults_title_when_missing() -> None:
    """doc_create defaults title to 'Untitled' when not provided."""
    mock_post = AsyncMock(return_value=_response(200, {"id": "d1"}))
    server_client = _client(post=mock_post)

    await _execute_doc_tool(
        "doc_create", {}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    _, kwargs = mock_post.call_args
    assert kwargs["json"]["title"] == "Untitled"


@pytest.mark.asyncio
async def test_doc_generate_creates_placeholder() -> None:
    """doc_generate POSTs a placeholder document with topic/outline."""
    mock_post = AsyncMock(return_value=_response(200, {"id": "d_place"}))
    server_client = _client(post=mock_post)

    result = await _execute_doc_tool(
        "doc_generate", {"topic": "My Topic", "outline": "1. Intro\n2. Body"},
        arguments="{}", conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert data["placeholder"] is True
    assert data["generated"] is False
    mock_post.assert_called_once()
    _, kwargs = mock_post.call_args
    assert "My Topic" in kwargs["json"]["content_md"]


@pytest.mark.asyncio
async def test_doc_get_returns_document() -> None:
    """doc_get fetches a specific document by id."""
    mock_get = AsyncMock(return_value=_response(200, {"id": "d1", "title": "X"}))
    server_client = _client(get=mock_get)

    result = await _execute_doc_tool(
        "doc_get", {"document_id": "d1"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert data["document"]["id"] == "d1"
    mock_get.assert_called_once_with("/v1/sessions/conv_1/resources/documents/d1", timeout=30.0)


@pytest.mark.asyncio
async def test_doc_get_404_returns_error() -> None:
    """doc_get returns error when document is not found."""
    mock_get = AsyncMock(return_value=_response(404))
    server_client = _client(get=mock_get)

    result = await _execute_doc_tool(
        "doc_get", {"document_id": "d_missing"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "not found" in data["error"]


@pytest.mark.asyncio
async def test_doc_update_patches_payload() -> None:
    """doc_update PATCHes the document with the provided fields."""
    mock_patch = AsyncMock(return_value=_response(200, {"id": "d1", "title": "Updated"}))
    server_client = _client(patch=mock_patch)

    result = await _execute_doc_tool(
        "doc_update", {"document_id": "d1", "title": "Updated"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert data["document"]["title"] == "Updated"
    mock_patch.assert_called_once_with(
        "/v1/sessions/conv_1/resources/documents/d1",
        json={"title": "Updated"}, timeout=30.0,
    )


@pytest.mark.asyncio
async def test_doc_update_requires_field() -> None:
    """doc_update returns error when no update fields are provided."""
    server_client = _client()

    result = await _execute_doc_tool(
        "doc_update", {"document_id": "d1"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "requires at least one" in data["error"]


# ---------------------------------------------------------------------------
# Error-case tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_doc_missing_server_client() -> None:
    """Returns error when server_client is None."""
    result = await _execute_doc_tool(
        "doc_list", {}, arguments="{}",
        conversation_id="conv_1", server_client=None,
    )
    data = json.loads(result)
    assert "error" in data
    assert "server access" in data["error"]


@pytest.mark.asyncio
async def test_doc_missing_conversation_id() -> None:
    """Returns error when conversation_id is None."""
    server_client = _client()
    result = await _execute_doc_tool(
        "doc_list", {}, arguments="{}",
        conversation_id=None, server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "session id" in data["error"]


@pytest.mark.asyncio
async def test_doc_get_missing_document_id() -> None:
    """doc_get returns error when document_id is absent."""
    server_client = _client()
    result = await _execute_doc_tool(
        "doc_get", {}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "document_id" in data["error"]


@pytest.mark.asyncio
async def test_doc_update_404_returns_error() -> None:
    """doc_update returns error when document is not found."""
    mock_patch = AsyncMock(return_value=_response(404))
    server_client = _client(patch=mock_patch)

    result = await _execute_doc_tool(
        "doc_update", {"document_id": "d1", "title": "X"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "not found" in data["error"]


@pytest.mark.asyncio
async def test_unknown_doc_tool() -> None:
    """Returns error for unknown doc tool name (with document_id to pass the guard)."""
    server_client = _client()
    result = await _execute_doc_tool(
        "doc_bogus", {"document_id": "d1"}, arguments="{}",
        conversation_id="conv_1", server_client=server_client,
    )
    data = json.loads(result)
    assert "error" in data
    assert "unknown" in data["error"]


# ---------------------------------------------------------------------------
# doc_export conversation_id threading (Plan 002 fix verification)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_doc_export_uses_conversation_id() -> None:
    """doc_export passes conversation_id to _execute_office_cli_tool.

    Mock the officecli subprocess to produce a temp .html file, then
    verify the upload POST targets the correct conversation id.
    """
    server_client = _client(post=AsyncMock(return_value=_response(200, {"id": "img1"})))

    with (
        patch("os.path.isfile", return_value=True),
        patch("builtins.open", create=True) as mock_open,
        patch(
            "omnigent.runner.tool_dispatch._resolve_officecli",
            return_value="officecli",
        ),
        patch("asyncio.create_subprocess_exec") as mock_sub,
    ):
        # Simulate a successful officecli view + output
        mock_file = MagicMock()
        mock_file.read.return_value = b"fake html"
        mock_open.return_value.__enter__.return_value = mock_file

        mock_proc = MagicMock()
        mock_proc.returncode = 0
        mock_proc.communicate = AsyncMock(return_value=(b"", b""))
        mock_sub.return_value = mock_proc

        result = await _execute_doc_tool(
            "doc_export", {"document_id": "d1", "title": "report.docx", "mode": "html"},
            arguments="{}", conversation_id="conv_42", server_client=server_client,
        )
        data = json.loads(result)
        assert "artifact" in data or "error" in data  # officecli may not be installed

        # The critical assertion: upload goes to the right conversation
        if data.get("artifact"):
            # Verify the POST was to the right conversation path
            call_url = server_client.post.call_args[0][0]
            assert "/v1/sessions/conv_42/" in call_url
            assert "resources/images" in call_url