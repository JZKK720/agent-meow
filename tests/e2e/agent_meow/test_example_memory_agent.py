"""Structural test for the memory-agent example bundle (examples/memory-agent).

memory-agent is the reference for the per-agent MCP memory pattern: it declares
the ``@agentmemory/mcp`` stdio server in its ``tools`` block so every session
created from it gets the full 53-tool agentmemory surface with zero core
agent-meow code changes. Pure spec-load — no LLM, no credentials, no running
agentmemory server required — modeled on ``test_example_scribe.py``.

What breaks if this fails:
- the ``agentmemory`` MCP entry is dropped or renamed (the agent loses its
  entire memory surface),
- the transport silently flips from stdio to http (the shim is stdio-only;
  an http entry would try to dial a URL the shim doesn't expose),
- the ``command`` / ``args`` drift so the shim no longer launches
  ``npx -y @agentmemory/mcp`` (the agent would spawn the wrong process),
- the ``AGENTMEMORY_URL`` env var disappears (the shim falls back to its
  default, which is fine on localhost but breaks sandboxed/remote deployments
  that relied on the explicit URL).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_memory_agent.py -> repo root is 3 parents up.
_MEMORY_AGENT_BUNDLE = Path(__file__).resolve().parents[3] / "examples" / "memory-agent"


@pytest.fixture(scope="module")
def memory_agent_spec() -> AgentSpec:
    """Load and validate the memory-agent bundle once for the module."""
    return load(_MEMORY_AGENT_BUNDLE)


def test_memory_agent_declares_agentmemory_mcp_server(memory_agent_spec: AgentSpec) -> None:
    """The bundle declares exactly one MCP server named ``agentmemory``."""
    assert memory_agent_spec.name == "memory-agent"
    mcp_names = {s.name for s in memory_agent_spec.mcp_servers}
    assert mcp_names == {"agentmemory"}, (
        f"expected only the agentmemory MCP server, got {sorted(mcp_names)}"
    )


def test_agentmemory_mcp_is_stdio_npx_shim(memory_agent_spec: AgentSpec) -> None:
    """
    The agentmemory entry is a stdio MCP server launching ``npx -y
    @agentmemory/mcp``. An http transport here would be wrong: the published
    ``@agentmemory/mcp`` package is a stdio shim that proxies to a separately
    run agentmemory server via ``AGENTMEMORY_URL``.
    """
    (server,) = [s for s in memory_agent_spec.mcp_servers if s.name == "agentmemory"]
    assert server.transport == "stdio"
    assert server.command == "npx"
    assert server.args == ["-y", "@agentmemory/mcp"]


def test_agentmemory_mcp_points_at_local_server(memory_agent_spec: AgentSpec) -> None:
    """
    The shim's env sets ``AGENTMEMORY_URL`` to the default local server so
    sandboxed / non-default-port deployments have an explicit override point.
    The value here is the documented default; the env entry is what matters —
    it is the knob operators flip when the server is not on localhost:3111.
    """
    (server,) = [s for s in memory_agent_spec.mcp_servers if s.name == "agentmemory"]
    assert "AGENTMEMORY_URL" in server.env
    assert server.env["AGENTMEMORY_URL"] == "http://localhost:3111"


def test_memory_agent_executor_is_claude_sdk(memory_agent_spec: AgentSpec) -> None:
    """
    The bundle pins ``executor.type: claude_sdk`` so the example runs
    out-of-the-box for anyone with an Anthropic credential, mirroring
    ``examples/doc-writer``.
    """
    assert memory_agent_spec.executor.type == "claude_sdk"