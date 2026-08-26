"""E2E test for server local self-host (1.0).

Verifies that when the server boots in local single-user mode, it spawns
its own local host daemon so a browser lands on a server with a ready
local host — no connect-a-host CTA, no CLI.

Runs against the mock LLM server — no real API key needed::

    pytest tests/e2e/test_local_self_host.py -v
"""

from __future__ import annotations

import os
import subprocess
import sys
import time
from pathlib import Path

import httpx

from tests.e2e.conftest import find_free_port, wait_for_server

POLL_INTERVAL_S = 0.5
HOST_ONLINE_TIMEOUT_S = 45.0


def _wait_for_host_online(
    client: httpx.Client,
    host_id: str,
    timeout: float = HOST_ONLINE_TIMEOUT_S,
) -> None:
    """Poll GET /v1/hosts until the host appears online.

    :param client: HTTP client pointed at the server.
    :param host_id: Host ID to wait for.
    :param timeout: Max seconds to wait.
    :raises AssertionError: If the host never appears online.
    """
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            resp = client.get("/v1/hosts")
            if resp.status_code == 200:
                for host in resp.json().get("hosts", []):
                    if host["host_id"] == host_id and host["status"] == "online":
                        return
        except httpx.ConnectError:
            pass
        time.sleep(POLL_INTERVAL_S)
    raise AssertionError(f"Host {host_id!r} did not appear online within {timeout}s")


def test_server_self_registers_local_host(
    tmp_path: Path,
    mock_llm_server_url: str,
) -> None:
    """Boot the server in local single-user mode; assert a local host registers online.

    The server spawns its own host daemon as a child process. The daemon
    connects back over the WebSocket tunnel and registers via
    ``upsert_on_connect``, so ``GET /v1/hosts`` shows it online.
    """
    port = find_free_port()
    db_path = tmp_path / "e2e.db"
    artifact_dir = tmp_path / "artifacts"
    artifact_dir.mkdir(parents=True, exist_ok=True)
    server_log = tmp_path / "server.log"

    env = {
        **os.environ,
        "AGENT_MEOW_LOCAL_SINGLE_USER": "1",
        "OPENAI_BASE_URL": f"{mock_llm_server_url}/v1",
        "OPENAI_API_KEY": "mock-key",
    }

    server_args = [
        sys.executable,
        "-m",
        "agent_meow.cli",
        "server",
        "--port",
        str(port),
        "--database-uri",
        f"sqlite:///{db_path}",
        "--artifact-location",
        str(artifact_dir),
    ]

    with open(server_log, "w") as log_fh:
        proc = subprocess.Popen(
            server_args,
            env=env,
            stdout=log_fh,
            stderr=subprocess.STDOUT,
        )

    try:
        base_url = f"http://localhost:{port}"
        wait_for_server(base_url, timeout=20.0)

        with httpx.Client(base_url=base_url, timeout=10.0) as client:
            # The server should have spawned its own local host daemon.
            # Poll until at least one host appears online (the server-spawned
            # local host uses the machine's durable identity, so we don't
            # know its host_id ahead of time).
            deadline = time.monotonic() + HOST_ONLINE_TIMEOUT_S
            online_hosts: list[dict[str, object]] = []
            while time.monotonic() < deadline:
                try:
                    resp = client.get("/v1/hosts")
                    if resp.status_code == 200:
                        online_hosts = [
                            h for h in resp.json().get("hosts", []) if h["status"] == "online"
                        ]
                        if online_hosts:
                            break
                except httpx.ConnectError:
                    pass
                time.sleep(POLL_INTERVAL_S)
            assert online_hosts, (
                f"No host appeared online within {HOST_ONLINE_TIMEOUT_S}s. "
                f"Server log: {server_log.read_text()[-500:]}"
            )
            # The self-hosted local host is owned by the reserved "local"
            # user in no-auth mode (the default for the packaged 1.0 app).
            local = [h for h in online_hosts if h.get("owner") == "local"]
            assert local, f"Expected a local-owner host, got: {online_hosts}"
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5.0)
        except subprocess.TimeoutExpired:
            proc.kill()
