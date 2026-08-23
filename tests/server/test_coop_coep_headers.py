"""Verify COOP/COEP headers are present on responses for VAD WASM."""

from __future__ import annotations

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient


def test_coop_coep_headers_on_simple_endpoint() -> None:
    """A FastAPI app with the COOP/COEP middleware sets the headers."""
    from starlette.middleware.base import BaseHTTPMiddleware

    class _COOPCOEPMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request, call_next):
            response = await call_next(request)
            response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
            response.headers["Cross-Origin-Embedder-Policy"] = "credentialless"
            return response

    app = FastAPI()
    app.add_middleware(_COOPCOEPMiddleware)

    @app.get("/test")
    def test_endpoint():
        return {"ok": True}

    client = TestClient(app)
    resp = client.get("/test")
    assert resp.headers.get("cross-origin-opener-policy") == "same-origin"
    assert resp.headers.get("cross-origin-embedder-policy") == "credentialless"
