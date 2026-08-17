"""E2E: the "Scan Workspace" button imports workspace files into surface panels.

The Docs / Images / Videos tabs each render a ``ScanWorkspaceButton`` that
POSTs ``/v1/sessions/{id}/resources/scan-workspace``. The backend walks the
session's workspace directory for ``.md`` / image / video files and imports
them into the DocumentStore / ImageStore / VideoStore so they appear in the
panels. This test exercises the full round trip in a real browser:

  1. Create a workspace directory with a ``.md`` file and a small PNG.
  2. Create a session whose ``metadata.workspace`` points at that directory
     and bind it to the spawned runner.
  3. Navigate to ``/c/{session_id}``, open the right rail, and click the
     Docs tab so the ``ScanWorkspaceButton`` is visible.
  4. Click "Scan Workspace" and assert the result message reports the
     imported doc count.

No LLM turn runs — the scan is a pure filesystem → store bridge, so this
stays a fast, creds-free check (like ``test_files_panel_header``).
"""

from __future__ import annotations

import gzip
import io
import json
import re
import struct
import tarfile
import zlib
from collections.abc import Iterator
from pathlib import Path

import httpx
import pytest
from playwright.sync_api import Page, expect

from tests.e2e_ui.conftest import open_right_rail

_AGENT_NAME = "scan_ws_demo"
_DOC_FILE = "scan_test_notes.md"
_DOC_CONTENT = "# Scan Test\n\nWorkspace file for the scan-workspace e2e test.\n"


def _png_bytes(width: int = 2, height: int = 2) -> bytes:
    """Build a minimal valid PNG (2×2 RGBA) without a third-party dependency.

    :param width: Pixel width of the image.
    :param height: Pixel height of the image.
    :returns: Raw PNG bytes (IHDR + IDAT + IEND chunks).
    """
    signature = b"\x89PNG\r\n\x1a\n"
    ihdr_data = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    ihdr = b"IHDR" + ihdr_data
    ihdr_chunk = struct.pack(">I", len(ihdr_data)) + ihdr + struct.pack(
        ">I", zlib.crc32(ihdr) & 0xFFFFFFFF
    )
    raw = b""
    for _y in range(height):
        raw += b"\x00"  # filter byte (None)
        raw += b"\x00\x00\x00\xff" * width  # RGBA black opaque
    compressed = zlib.compress(raw)
    idat = b"IDAT" + compressed
    idat_chunk = struct.pack(">I", len(compressed)) + idat + struct.pack(
        ">I", zlib.crc32(idat) & 0xFFFFFFFF
    )
    iend = b"IEND"
    iend_chunk = struct.pack(">I", 0) + iend + struct.pack(
        ">I", zlib.crc32(iend) & 0xFFFFFFFF
    )
    return signature + ihdr_chunk + idat_chunk + iend_chunk


def _agent_bundle() -> bytes:
    """Gzip-tar a minimal agent YAML that the strict validator accepts.

    Mirrors the executor block of the conftest test agent. The model is never
    invoked — the scan is filesystem-only — so the provider config is inert.

    :returns: ``.tar.gz`` bytes for multipart upload.
    """
    yaml_text = f"""\
name: {_AGENT_NAME}
prompt: You are a deterministic test assistant.

executor:
  model: gpt-4o-mini
  config:
    harness: openai-agents
"""
    buf = io.BytesIO()
    with (
        gzip.GzipFile(fileobj=buf, mode="wb", mtime=0) as gz,
        tarfile.open(fileobj=gz, mode="w") as tar,
    ):
        data = yaml_text.encode()
        info = tarfile.TarInfo(name=f"{_AGENT_NAME}.yaml")
        info.size = len(data)
        tar.addfile(info, io.BytesIO(data))
    return buf.getvalue()


@pytest.fixture
def scan_workspace_session(
    live_server: str,
    runner_id: str,
    tmp_path: Path,
) -> Iterator[tuple[str, str]]:
    """Create a session with a workspace containing a .md + PNG and yield its id.

    :param live_server: Spawned server base URL.
    :param runner_id: Token-bound runner id to bind the session to.
    :param tmp_path: Pytest per-test temp dir (workspace lives here).
    :returns: ``(base_url, session_id)``.
    """
    ws = tmp_path / "scan_ws"
    ws.mkdir()
    (ws / _DOC_FILE).write_text(_DOC_CONTENT, encoding="utf-8")
    (ws / "scan_test_image.png").write_bytes(_png_bytes())

    create_resp = httpx.post(
        f"{live_server}/v1/sessions",
        data={"metadata": json.dumps({"workspace": str(ws)})},
        files={"bundle": ("agent.tar.gz", _agent_bundle(), "application/gzip")},
        timeout=30.0,
    )
    create_resp.raise_for_status()
    session_id = create_resp.json()["session_id"]

    patch_resp = httpx.patch(
        f"{live_server}/v1/sessions/{session_id}",
        json={"runner_id": runner_id},
        timeout=10.0,
    )
    patch_resp.raise_for_status()

    try:
        yield (live_server, session_id)
    finally:
        httpx.delete(f"{live_server}/v1/sessions/{session_id}", timeout=10.0)


def test_scan_workspace_button_imports_files(
    page: Page,
    scan_workspace_session: tuple[str, str],
) -> None:
    """Clicking "Scan Workspace" in the Docs tab imports the .md file."""
    base_url, session_id = scan_workspace_session
    page.goto(f"{base_url}/c/{session_id}")

    open_right_rail(page)
    rail = page.get_by_role("complementary", name="Workspace")

    # Click the Docs tab so the ScanWorkspaceButton renders.
    rail.get_by_role("tab", name=re.compile("Docs")).click()

    # The button is labeled by the i18n key "workspace.scanWorkspace".
    scan_button = rail.get_by_role("button", name=re.compile("Scan Workspace"))
    expect(scan_button).to_be_visible(timeout=30_000)
    scan_button.click()

    # The result message appears next to the button and reports the imported
    # doc count. "1 docs" is the format from ScanWorkspaceButton's onSuccess.
    result = rail.get_by_text(re.compile(r"1\s*docs"))
    expect(result).to_be_visible(timeout=30_000)