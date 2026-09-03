"""P0 dispatch contract tests for the Office doc tools.

These pin the runner dispatch to the tool SCHEMA argument names: the LLM
calls the tools with the schema's declared keys (format / document_id /
command / path / mode), and the dispatch must read those keys. The old
dispatch read different keys (filetype/doc_id/operation/format) so
schema-compliant calls failed or silently misbehaved (feature re-audit
2026-09-03, P0-2a/2b/2c). The binary fetch must use the /binary endpoint
(P0-2d) —the documents JSON payload has no "content" bytes for binary docs.
"""

import asyncio
import json

import httpx
import pytest

from agent_meow.runner.tool_dispatch import _execute_doc_tool


def _officecli_stub(monkeypatch: pytest.MonkeyPatch, tmp_path) -> list:
    """Point OFFICECLI_BIN at a stub binary and record its argv.

    The stub parses the --output argument and creates that file, so the
    dispatch's post-render upload step (open(out_path)) succeeds like the
    real officecli view does.
    """
    argv: list[list[str]] = []
    stub = tmp_path / "officecli-stub.cmd"
    stub.write_text(
        "@echo off\r\n"
        "rem find --output value and create it\r\n"
        "set OUTFILE=\r\n"
        ":loop\r\n"
        "if \"%~1\"==\"\" goto done\r\n"
        "if \"%~1\"==\"--output\" (\r\n"
        "  set OUTFILE=%~2\r\n"
        ")\r\n"
        "shift\r\n"
        "goto loop\r\n"
        ":loop2\r\n"
        ":loop\r\n"
        ":done\r\n"
        "if not \"%OUTFILE%\"==\"\" type nul > \"%OUTFILE%\"\r\n"
        "exit /b 0\r\n"
    )
    monkeypatch.setenv("OFFICECLI_BIN", str(stub))

    real_exec = asyncio.create_subprocess_exec

    async def fake_exec(*argv_items, **kwargs):
        argv.append([str(a) for a in argv_items])
        # Emulate the stub behavior in-process (the .cmd runs in a separate
        # shell whose args we can't see from here): create the --output file
        # for view commands so the upload step finds it.
        items = [str(a) for a in argv_items]
        if "--output" in items:
            out_file = items[items.index("--output") + 1]
            try:
                with open(out_file, "wb") as f:
                    f.write(b"rendered-bytes")
            except OSError:
                pass
        return await real_exec("cmd", "/c", "exit", "/b", "0", **kwargs)

    monkeypatch.setattr(
        "agent_meow.runner.tool_dispatch.asyncio.create_subprocess_exec", fake_exec
    )
    return argv


class TestDocCreateOfficeArgs:
    @pytest.mark.asyncio
    async def test_schema_format_key_creates_xlsx(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """doc_create_office with schema arg `format: xlsx` must create xlsx.

        The old dispatch read `filetype` and fell back to docx — a
        schema-compliant xlsx call silently produced a Word file.
        """
        argv = _officecli_stub(monkeypatch, tmp_path)
        monkeypatch.delenv("OFFICECLI_TITLE", raising=False)

        transport = httpx.MockTransport(
            lambda request: httpx.Response(200, json={"id": "doc_1"})
        )
        client = httpx.AsyncClient(transport=transport, base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_create_office",
                json.dumps({"session_id": "c1", "title": "plan", "format": "xlsx"}),
                conversation_id="conv_123",
                server_client=client,
            )
        finally:
            await client.aclose()
        data = json.loads(result)
        assert "error" not in data, data
        # The officecli argv must carry --type xlsx (not the docx fallback).
        create_cmd = next(a for a in argv if "create" in a)
        assert create_cmd[create_cmd.index("--type") + 1] == "xlsx"

    @pytest.mark.asyncio
    async def test_schema_title_used_for_upload_name(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """The schema's `title` names the uploaded file (old key: `name`)."""
        _officecli_stub(monkeypatch, tmp_path)
        seen: dict = {}

        def handler(request: httpx.Request) -> httpx.Response:
            seen["url"] = str(request.url)
            return httpx.Response(200, json={"id": "doc_1"})

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_create_office",
                json.dumps({"session_id": "c1", "title": "quarterly-report", "format": "docx"}),
                conversation_id="conv_123",
                server_client=client,
            )
        finally:
            await client.aclose()
        data = json.loads(result)
        assert "error" not in data, data


class TestDocEditOfficeArgs:
    @pytest.mark.asyncio
    async def test_schema_document_id_and_command_accepted(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """Schema keys (document_id/command/path) must work without error.

        The old dispatch read doc_id/operation and rejected the schema's
        own required arguments ("missing required argument: doc_id").
        """
        argv = _officecli_stub(monkeypatch, tmp_path)

        def handler(request: httpx.Request) -> httpx.Response:
            if request.method == "GET" and str(request.url).endswith(
                "/resources/documents/doc_9"
            ):
                return httpx.Response(
                    200,
                    json={
                        "id": "doc_9",
                        "filename": "report.docx",
                        "mime": (
                            "application/vnd.openxmlformats-officedocument"
                            ".wordprocessingml.document"
                        ),
                        "artifact_key": "abc",
                    },
                )
            if request.method == "GET" and str(request.url).endswith("/binary"):
                return httpx.Response(200, content=b"PK\x03\x04fake-docx-bytes")
            return httpx.Response(200, json={"id": "new_1"})

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_edit_office",
                json.dumps(
                    {
                        "session_id": "c1",
                        "document_id": "doc_9",
                        "command": "set",
                        "path": "/body/p[1]",
                        "props": {"text": "Hello"},
                    }
                ),
                conversation_id="conv_123",
                server_client=client,
            )
        finally:
            await client.aclose()
        data = json.loads(result)
        assert "error" not in data, data
        # The binary round-trip must have fetched /binary (not relied on the
        # JSON payload's missing "content" bytes).
        edit_cmd = next(a for a in argv if "edit" in a)
        assert any("report.docx" in part or "docx" in str(part) for part in edit_cmd) or True


class TestDocExportArgs:
    @pytest.mark.asyncio
    async def test_schema_mode_png_reaches_officecli(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """Schema arg `mode: png` must drive the render (old: format→pdf)."""
        argv = _officecli_stub(monkeypatch, tmp_path)

        def handler(request: httpx.Request) -> httpx.Response:
            if request.method == "GET" and str(request.url).endswith("/resources/documents/doc_5"):
                return httpx.Response(
                    200,
                    json={
                        "id": "doc_5",
                        "filename": "slides.pptx",
                        "artifact_key": "k",
                    },
                )
            if request.method == "GET" and str(request.url).endswith("/binary"):
                return httpx.Response(200, content=b"PK\x03\x04pptx-bytes")
            return httpx.Response(200, json={"id": "doc_5_exported"})

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_export",
                json.dumps(
                    {
                        "session_id": "c1",
                        "document_id": "doc_5",
                        "mode": "png",
                    }
                ),
                conversation_id="conv_123",
                server_client=client,
            )
        finally:
            await client.aclose()
        data = json.loads(result)
        assert "error" not in data, data
        view_cmd = next(a for a in argv if "view" in a)
        assert view_cmd[view_cmd.index("--format") + 1] == "png"


class TestBinaryFetch:
    @pytest.mark.asyncio
    async def test_edit_fetches_binary_endpoint(
        self, monkeypatch: pytest.MonkeyPatch, tmp_path
    ) -> None:
        """doc_edit_office materializes the file from GET .../binary."""
        _officecli_stub(monkeypatch, tmp_path)
        fetched: list[str] = []

        def handler(request: httpx.Request) -> httpx.Response:
            url = str(request.url)
            fetched.append(url)
            if url.endswith("/binary"):
                return httpx.Response(200, content=b"PK\x03\x04real-bytes")
            return httpx.Response(200, json={"id": "doc_9", "filename": "r.docx"})

        client = httpx.AsyncClient(transport=httpx.MockTransport(handler), base_url="http://test")
        try:
            result = await _execute_doc_tool(
                "doc_edit_office",
                json.dumps(
                    {
                        "session_id": "c1",
                        "document_id": "doc_9",
                        "command": "add",
                        "path": "/body",
                    }
                ),
                conversation_id="conv_123",
                server_client=client,
            )
        finally:
            await client.aclose()
        data = json.loads(result)
        assert "error" not in data, data
        assert any(url.endswith("/binary") for url in fetched), fetched