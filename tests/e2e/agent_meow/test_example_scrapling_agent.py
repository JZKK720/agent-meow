"""Structural test for the scrapling-agent example bundle (examples/scrapling-agent).

scrapling-agent is the reference for the per-agent Scrapling MCP pattern: it
declares the ``scrapling mcp`` stdio server in its ``tools`` block so every
session created from it gets the 9-tool Scrapling surface (get, bulk_get,
fetch, bulk_fetch, stealthy_fetch, bulk_stealthy_fetch, open_session,
close_session, list_sessions, screenshot) with zero core agent-meow code
changes. Pure spec-load — no LLM, no credentials, no running Scrapling server
required — modeled on ``test_example_memory_agent.py``.

What breaks if this fails:
- the ``scrapling`` MCP entry is dropped or renamed (the agent loses its
  entire scraping surface),
- the transport silently flips from stdio to http (the per-session stdio
  spawn is the documented simple path; an http entry would imply a
  separately-run server the bundle doesn't document),
- the ``command`` / ``args`` drift so the MCP server no longer launches
  ``scrapling mcp`` (the agent would spawn the wrong process).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_scrapling_agent.py -> repo root is 3 parents up.
_SCRAPLING_AGENT_BUNDLE = (
    Path(__file__).resolve().parents[3] / "examples" / "scrapling-agent"
)


@pytest.fixture(scope="module")
def scrapling_agent_spec() -> AgentSpec:
    """Load and validate the scrapling-agent bundle once for the module."""
    return load(_SCRAPLING_AGENT_BUNDLE)


def test_scrapling_agent_declares_scrapling_mcp_server(
    scrapling_agent_spec: AgentSpec,
) -> None:
    """The bundle declares exactly one MCP server named ``scrapling``."""
    assert scrapling_agent_spec.name == "scrapling-agent"
    mcp_names = {s.name for s in scrapling_agent_spec.mcp_servers}
    assert mcp_names == {"scrapling"}, (
        f"expected only the scrapling MCP server, got {sorted(mcp_names)}"
    )


def test_scrapling_mcp_is_stdio_scrapling_command(
    scrapling_agent_spec: AgentSpec,
) -> None:
    """
    The scrapling entry is a stdio MCP server launching ``scrapling mcp``.
    Scrapling's MCP server is the scraper itself (unlike agentmemory's shim),
    so per-session stdio spawn is the simple, isolated path. An http transport
    here would imply a separately-run server the bundle doesn't document.
    """
    (server,) = [s for s in scrapling_agent_spec.mcp_servers if s.name == "scrapling"]
    assert server.transport == "stdio"
    assert server.command == "scrapling"
    assert server.args == ["mcp"]


def test_scrapling_agent_executor_is_claude_sdk(
    scrapling_agent_spec: AgentSpec,
) -> None:
    """
    The bundle pins ``executor.type: claude_sdk`` so the example runs
    out-of-the-box for anyone with an Anthropic credential, mirroring
    ``examples/doc-writer`` and ``examples/memory-agent``.
    """
    assert scrapling_agent_spec.executor.type == "claude_sdk"