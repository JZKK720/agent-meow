"""Structural test for the reach-agent example bundle (examples/reach-agent).

reach-agent is the reference for the per-agent agent-reach integration, which
uses a DIFFERENT shape than the other MCP-only examples (memory-agent,
scrapling-agent, voicebox-agent). agent-reach is a capability router, not a
fetcher, so this bundle combines:

1. A bundled skill (skills/agent-reach/SKILL.md, auto-discovered) — tells the
   agent which upstream CLI to call per platform.
2. A minimal MCP server (@agent-reach/mcp, one tool: get_status) — diagnostics
   only.

The actual fetching is done by the agent calling upstream CLIs directly
(twitter-cli, yt-dlp, mcporter, gh, opencli, bili-cli). Pure spec-load — no
LLM, no credentials, no running agent-reach CLI required — modeled on
``test_example_memory_agent.py`` and ``test_example_scribe.py`` (which also
asserts on bundled skills).

What breaks if this fails:
- the ``agent-reach`` skill is dropped or renamed (the agent loses its
  platform-routing knowledge — it wouldn't know that Twitter needs
  twitter-cli, XiaoHongShu needs OpenCLI, etc.),
- the ``agentreach`` MCP entry is dropped or renamed (the agent loses its
  diagnostics surface — can't check which backend is active per platform),
- the MCP transport silently flips from stdio to http (the @agent-reach/mcp
  package is a stdio shim),
- the ``command`` / ``args`` drift so the shim no longer launches
  ``npx -y @agent-reach/mcp``,
- the bundle accidentally loses the skill OR the MCP server (both are
  required — the skill routes, the MCP diagnoses).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_reach_agent.py -> repo root is 3 parents up.
_REACH_AGENT_BUNDLE = Path(__file__).resolve().parents[3] / "examples" / "reach-agent"


@pytest.fixture(scope="module")
def reach_agent_spec() -> AgentSpec:
    """Load and validate the reach-agent bundle once for the module."""
    return load(_REACH_AGENT_BUNDLE)


def test_reach_agent_bundles_agent_reach_skill(reach_agent_spec: AgentSpec) -> None:
    """
    The bundle ships the ``agent-reach`` skill (from skills/agent-reach/SKILL.md).
    This skill is the routing table — without it the agent wouldn't know which
    upstream CLI to call per platform. It must be auto-discovered onto
    ``AgentSpec.skills``.
    """
    assert reach_agent_spec.name == "reach-agent"
    skill_names = {s.name for s in reach_agent_spec.skills}
    assert "agent-reach" in skill_names, (
        f"expected the agent-reach skill to be bundled, got {sorted(skill_names)}"
    )


def test_reach_agent_declares_agentreach_mcp_server(
    reach_agent_spec: AgentSpec,
) -> None:
    """
    The bundle declares exactly one MCP server named ``agentreach`` (the
    diagnostics-only @agent-reach/mcp shim). Unlike the fetcher MCP servers
    (scrapling, voicebox), this one exposes only ``get_status`` — the actual
    fetching is done by the agent calling upstream CLIs routed by the skill.
    """
    mcp_names = {s.name for s in reach_agent_spec.mcp_servers}
    assert mcp_names == {"agentreach"}, (
        f"expected only the agentreach MCP server, got {sorted(mcp_names)}"
    )


def test_agentreach_mcp_is_stdio_npx_shim(reach_agent_spec: AgentSpec) -> None:
    """
    The agentreach entry is a stdio MCP server launching
    ``npx -y @agent-reach/mcp``. The published @agent-reach/mcp package is a
    stdio shim (like @agentmemory/mcp); an http transport here would be wrong.
    """
    (server,) = [s for s in reach_agent_spec.mcp_servers if s.name == "agentreach"]
    assert server.transport == "stdio"
    assert server.command == "npx"
    assert server.args == ["-y", "@agent-reach/mcp"]


def test_reach_agent_executor_is_claude_sdk(reach_agent_spec: AgentSpec) -> None:
    """
    The bundle pins ``executor.type: claude_sdk`` so the example runs
    out-of-the-box for anyone with an Anthropic credential, mirroring
    ``examples/doc-writer``, ``examples/memory-agent``,
    ``examples/scrapling-agent``, and ``examples/voicebox-agent``.
    """
    assert reach_agent_spec.executor.type == "claude_sdk"