"""Tests for the new doc_* office/convert tool schemas (Phase A1).

Verifies the four new runner-dispatched doc tools expose correct names,
descriptions, and OpenAI-format schemas. The runner dispatch (officecli /
markitdown shell-out) is exercised in tests/e2e/test_doc_office_flow.py
because it shells out to external binaries.
"""

from __future__ import annotations

import json

from agent_meow.tools.builtins.docs import (
    DocConvertTool,
    DocCreateOfficeTool,
    DocEditOfficeTool,
    DocExportTool,
)


def test_doc_create_office_tool_name_and_schema() -> None:
    tool = DocCreateOfficeTool()
    assert tool.name() == "doc_create_office"
    schema = tool.get_schema()
    assert schema["type"] == "function"
    fn = schema["function"]
    assert fn["name"] == "doc_create_office"
    assert "docx" in fn["description"]
    params = fn["parameters"]
    assert params["type"] == "object"
    assert set(params["required"]) == {"session_id", "title", "format"}
    props = params["properties"]
    assert set(props.keys()) == {"session_id", "title", "format", "content_md"}
    assert props["format"]["enum"] == ["docx", "xlsx", "pptx"]


def test_doc_edit_office_tool_name_and_schema() -> None:
    tool = DocEditOfficeTool()
    assert tool.name() == "doc_edit_office"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "doc_edit_office"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "document_id", "command", "path"}
    props = params["properties"]
    assert props["command"]["enum"] == ["add", "set", "move", "remove", "query"]


def test_doc_export_tool_name_and_schema() -> None:
    tool = DocExportTool()
    assert tool.name() == "doc_export"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "doc_export"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "document_id", "mode"}
    props = params["properties"]
    assert props["mode"]["enum"] == ["html", "png", "pdf"]


def test_doc_convert_tool_name_and_schema() -> None:
    tool = DocConvertTool()
    assert tool.name() == "doc_convert"
    schema = tool.get_schema()
    fn = schema["function"]
    assert fn["name"] == "doc_convert"
    params = fn["parameters"]
    assert set(params["required"]) == {"session_id", "source"}
    props = params["properties"]
    assert "source" in props
    assert "persist" in props


def test_all_new_doc_schemas_are_valid_json() -> None:
    """Every new doc tool schema must round-trip through JSON."""
    for cls in (DocCreateOfficeTool, DocEditOfficeTool, DocExportTool, DocConvertTool):
        schema = cls().get_schema()
        # Must be JSON-serializable (the harness serializes these).
        json.dumps(schema)
        assert schema["function"]["name"] == cls.name()
        assert schema["function"]["description"]  # non-empty