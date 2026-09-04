"""
End-to-end tests for the binary documents round-trip.

Drives the REAL server subprocess (session-scoped ``live_server``) through
the same multipart route the web UI and the runner's ``doc_create_office``
use:

1. ``POST /v1/sessions/{id}/resources/documents`` (multipart) stores an
   office file's bytes in the ArtifactStore and returns the document row
   (``format: "binary"``, ``artifact_key`` set).
2. ``GET .../resources/documents/{doc_id}/binary`` serves the exact bytes
   back with ``Content-Disposition: attachment`` and the stored MIME type.

The in-process route tests (``tests/server/routes/test_documents_binary.py``)
prove the handler logic; this file proves the wiring on a live server —
process env, artifact dir flags, and the trusted-origin guard included.

Run with::

    python -m pytest tests/e2e/test_documents_binary_e2e.py -v
"""

from __future__ import annotations

import uuid

import httpx

from tests.e2e.conftest import (
    create_runner_bound_session,
    register_inline_agent,
)

# A valid minimal OOXML word-processing document is not required here: the
# server stores arbitrary bytes for format "binary" (no schema validation at
# this layer — the runner's officecli tools produce the real files). A small
# recognizable payload is enough to prove byte-fidelity.
_DOCX_PAYLOAD = b"PK\x03\x04-e2e-docx-roundtrip-payload-\x00\x01\x02"
_XLSX_PAYLOAD = b"PK\x03\x04-e2e-xlsx-roundtrip-payload-\x03\x04\x05"

_DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
_XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _new_session(client: httpx.Client, runner_id: str) -> str:
    """Register an inline chat agent and return a session bound to it."""
    agent_name = register_inline_agent(
        client,
        name=f"docs-bin-e2e-{uuid.uuid4().hex[:6]}",
        harness="openai-agents",
        model="mock-docs-e2e",
        profile="",
        prompt="You store documents.",
    )
    return create_runner_bound_session(
        client,
        agent_name=agent_name,
        runner_id=runner_id,
    )


def test_binary_document_upload_and_download_roundtrip(
    http_client: httpx.Client,
    live_runner_id: str,
) -> None:
    """Multipart upload stores bytes; /binary serves them back verbatim."""
    session_id = _new_session(http_client, live_runner_id)

    # ── Upload: multipart POST with a file part ──────────────
    upload_resp = http_client.post(
        f"/v1/sessions/{session_id}/resources/documents",
        files={"file": ("Report.docx", _DOCX_PAYLOAD, _DOCX_MIME)},
    )
    assert upload_resp.status_code == 200, upload_resp.text
    doc = upload_resp.json()
    assert doc["format"] == "binary"
    assert doc["filename"] == "Report.docx"
    assert doc["mime"] == _DOCX_MIME
    assert doc["bytes_size"] == len(_DOCX_PAYLOAD)
    assert doc["artifact_key"], "upload must register an artifact key"
    assert doc["title"] == "Report", "title is the filename minus extension"

    # ── Document appears in the list with binary metadata ────
    list_resp = http_client.get(f"/v1/sessions/{session_id}/resources/documents")
    assert list_resp.status_code == 200
    listed = [d for d in list_resp.json()["data"] if d["id"] == doc["id"]]
    assert len(listed) == 1
    assert listed[0]["artifact_key"] == doc["artifact_key"]

    # ── Download: exact bytes + disposition headers ──────────
    download_resp = http_client.get(
        f"/v1/sessions/{session_id}/resources/documents/{doc['id']}/binary"
    )
    assert download_resp.status_code == 200, download_resp.text
    assert download_resp.content == _DOCX_PAYLOAD, (
        "binary round-trip is not byte-faithful — payload mutated in storage"
    )
    assert download_resp.headers["content-type"].startswith(_DOCX_MIME)
    assert 'filename="Report.docx"' in download_resp.headers["content-disposition"]
    assert download_resp.headers["x-content-type-options"] == "nosniff"


def test_binary_second_file_markdown_doc_and_delete(
    http_client: httpx.Client,
    live_runner_id: str,
) -> None:
    """A second binary doc coexists; markdown docs 404 on /binary; DELETE works."""
    session_id = _new_session(http_client, live_runner_id)

    resp = http_client.post(
        f"/v1/sessions/{session_id}/resources/documents",
        files={"file": ("Sheet.xlsx", _XLSX_PAYLOAD, _XLSX_MIME)},
    )
    assert resp.status_code == 200, resp.text
    doc = resp.json()
    assert doc["filename"] == "Sheet.xlsx"
    assert doc["mime"] == _XLSX_MIME

    # A markdown (JSON-body) doc in the same session has no binary payload.
    md_resp = http_client.post(
        f"/v1/sessions/{session_id}/resources/documents",
        json={"title": "Notes", "format": "markdown", "content_md": "# hi"},
    )
    assert md_resp.status_code == 200, md_resp.text
    md_doc = md_resp.json()
    assert md_doc["artifact_key"] is None

    md_download = http_client.get(
        f"/v1/sessions/{session_id}/resources/documents/{md_doc['id']}/binary"
    )
    assert md_download.status_code == 404, "markdown documents have no binary payload"

    # DELETE removes the binary doc; a later download 404s.
    del_resp = http_client.delete(
        f"/v1/sessions/{session_id}/resources/documents/{doc['id']}"
    )
    assert del_resp.status_code == 200, del_resp.text
    gone = http_client.get(
        f"/v1/sessions/{session_id}/resources/documents/{doc['id']}/binary"
    )
    assert gone.status_code == 404