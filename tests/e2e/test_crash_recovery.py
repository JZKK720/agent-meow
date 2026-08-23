"""E2E: Kill Lemonade → dashboard shows restart → service recovers."""

from __future__ import annotations

import asyncio
import time

import httpx
import pytest

pytestmark = pytest.mark.asyncio


async def test_lemonade_crash_recovery(server_url: str = "http://127.0.0.1:6767") -> None:
    """When Lemonade crashes, the supervisor restarts it within ~60s."""
    async with httpx.AsyncClient() as client:
        # 1. Get current Lemonade PID from stack status
        resp = await client.get(f"{server_url}/v1/stack/status", timeout=10)
        status = resp.json()
        services = status.get("services", [])
        lemonade = next((s for s in services if s["name"] == "lemonade"), None)
        if not lemonade or not lemonade.get("pid"):
            pytest.skip("Lemonade not running — supervisor not active or service unconfigured")

        original_pid = lemonade["pid"]

    # 2. Kill the Lemonade process
    import subprocess

    subprocess.run(["taskkill", "/F", "/PID", str(original_pid)], check=False)

    # 3. Poll stack status until Lemonade is back (up to 60s)
    deadline = time.time() + 60
    while time.time() < deadline:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{server_url}/v1/stack/status", timeout=10)
            status = resp.json()
            services = status.get("services", [])
            lemonade = next((s for s in services if s["name"] == "lemonade"), None)
            if lemonade and lemonade.get("pid") and lemonade["pid"] != original_pid:
                assert lemonade["state"] == "running"
                assert lemonade["restart_count"] >= 1
                return
        await asyncio.sleep(2)

    pytest.fail("Lemonade did not recover within 60s")
