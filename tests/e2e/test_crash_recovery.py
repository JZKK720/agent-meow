"""E2E: Kill tts_server → dashboard shows restart → service recovers."""

from __future__ import annotations

import asyncio
import time

import httpx
import pytest

pytestmark = pytest.mark.asyncio


async def test_tts_server_crash_recovery(server_url: str = "http://127.0.0.1:6767") -> None:
    """When tts_server crashes, the supervisor restarts it within ~60s."""
    async with httpx.AsyncClient() as client:
        # 1. Get current tts_server PID from stack status
        resp = await client.get(f"{server_url}/v1/stack/status", timeout=10)
        status = resp.json()
        services = status.get("services", [])
        tts_server = next((s for s in services if s["name"] == "tts_server"), None)
        if not tts_server or not tts_server.get("pid"):
            pytest.skip("tts_server not running — supervisor not active or service unconfigured")

        original_pid = tts_server["pid"]

    # 2. Kill the tts_server process
    import subprocess

    subprocess.run(["taskkill", "/F", "/PID", str(original_pid)], check=False)

    # 3. Poll stack status until tts_server is back (up to 60s)
    deadline = time.time() + 60
    while time.time() < deadline:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{server_url}/v1/stack/status", timeout=10)
            status = resp.json()
            services = status.get("services", [])
            tts_server = next((s for s in services if s["name"] == "tts_server"), None)
            if tts_server and tts_server.get("pid") and tts_server["pid"] != original_pid:
                assert tts_server["state"] == "running"
                assert tts_server["restart_count"] >= 1
                return
        await asyncio.sleep(2)

    pytest.fail("tts_server did not recover within 60s")
