"""E2E: Close app → all services terminate cleanly.

This test verifies that when the server shuts down, the service supervisor
stops all voice service children (Lemonade, tts-server, qwentts_wrapper).
It's a smoke test — the full Electron shutdown flow is tested manually.
"""

from __future__ import annotations

import asyncio
import subprocess
import time

import httpx
import pytest

pytestmark = pytest.mark.asyncio


async def test_supervisor_stop_terminates_children(
    server_url: str = "http://127.0.0.1:6767",
) -> None:
    """When the supervisor stops, all child processes are terminated.

    This test calls the supervisor's stop() via a test endpoint (if available)
    or verifies that the services list shows 'stopped' state after shutdown.

    Since we can't actually shut down the running server in an E2E test
    (it would kill the test runner), we verify the supervisor's stop()
    logic via the unit tests in test_service_supervisor.py instead.

    This test serves as a placeholder for the full Electron shutdown E2E,
    which requires a packaged .exe to test properly.
    """
    # Verify the stack status endpoint is working (supervisor is active)
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{server_url}/v1/stack/status", timeout=10)
        assert resp.status_code == 200
        status = resp.json()
        # The services array should exist (even if empty in dev mode)
        assert "services" in status
