"""Tests for the save_artifact client tool."""

from __future__ import annotations

import json
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from agent_meow.client_tools.save_artifact import TOOLS, execute_tool


def test_tools_schema_has_save_artifact():
    """The TOOLS list includes a save_artifact tool definition."""
    names = [t["function"]["name"] for t in TOOLS]
    assert "save_artifact" in names


def test_save_artifact_schema_has_required_params():
    """The save_artifact tool requires file_path and session_id."""
    tool_def = next(t for t in TOOLS if t["function"]["name"] == "save_artifact")
    params = tool_def["function"]["parameters"]
    assert "file_path" in params.get("required", [])
    assert "session_id" in params.get("required", [])


def test_save_artifact_returns_content_url(tmp_path: Path):
    """execute_tool returns a JSON string with content_url."""
    test_file = tmp_path / "output.png"
    test_file.write_bytes(b"\x89PNG fake image data")

    mock_response = MagicMock()
    mock_response.status_code = 201
    mock_response.json.return_value = {
        "id": "file_abc123",
        "object": "file",
        "filename": "output.png",
        "bytes": 22,
        "content_type": "image/png",
        "session_id": "conv123",
    }
    mock_response.raise_for_status = MagicMock()

    with patch("agent_meow.client_tools.save_artifact.httpx") as mock_httpx:
        mock_client = MagicMock()
        mock_client.post.return_value = mock_response
        mock_httpx.Client.return_value.__enter__ = MagicMock(return_value=mock_client)
        mock_httpx.Client.return_value.__exit__ = MagicMock(return_value=False)

        result = execute_tool(
            "save_artifact",
            {
                "file_path": str(test_file),
                "session_id": "conv123",
            },
        )

    parsed = json.loads(result)
    assert "content_url" in parsed
    assert "conv123" in parsed["content_url"]
    assert "file_abc123" in parsed["content_url"]


def test_save_artifact_missing_file_returns_error(tmp_path: Path):
    """execute_tool returns an error for a non-existent file."""
    result = execute_tool(
        "save_artifact",
        {
            "file_path": str(tmp_path / "nonexistent.png"),
            "session_id": "conv123",
        },
    )
    parsed = json.loads(result)
    assert "error" in parsed