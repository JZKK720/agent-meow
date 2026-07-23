"""Structural test for the web-research-agent example bundle (examples/web-research-agent).

web-research-agent is the reference for the multi-MCP pattern: it declares TWO
MCP servers in its tools block — Scrapling (scrapling mcp, stdio, 9 scraping
tools) and Playwright MCP (@playwright/mcp, stdio, live browser interaction) —
so every session gets both stateless scraping AND stateful browser control with
zero core agent-meow code changes. Pure spec-load — no LLM, no credentials, no
running Scrapling or Playwright required — modeled on test_example_memory_agent.py.

What breaks if this fails:
- one of the two MCP servers is dropped (the agent loses either scraping or
  live browser control),
- a transport silently flips from stdio to http (both are stdio shims),
- the commands/args drift so the shims no longer launch correctly,
- the bundle accidentally declares only one MCP server (the whole point is
  having BOTH — Scrapling for read, Playwright MCP for interact).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_web_research_agent.py -> repo root is 3 parents up.
_WEB_RESEARCH_AGENT_BUNDLE = (
    Path(__file__).resolve().parents[3] / "examples" / "web-research-agent"
)


@pytest.fixture(scope="module")
def web_research_agent_spec() -> AgentSpec:
    """Load and validate the web-research-agent bundle once for the module."""
    return load(_WEB_RESEARCH_AGENT_BUNDLE)


def test_web_research_agent_declares_both_mcp_servers(
    web_research_agent_spec: AgentSpec,
) -> None:
    """The bundle declares exactly two MCP servers: scrapling + playwright."""
    assert web_research_agent_spec.name == "web-research-agent"
    mcp_names = {s.name for s in web_research_agent_spec.mcp_servers}
    assert mcp_names == {"scrapling", "playwright"}, (
        f"expected scrapling + playwright MCP servers, got {sorted(mcp_names)}"
    )


def test_scrapling_mcp_is_stdio_scrapling_command(
    web_research_agent_spec: AgentSpec,
) -> None:
    """The scrapling entry is a stdio MCP server launching `scrapling mcp`."""
    (server,) = [s for s in web_research_agent_spec.mcp_servers if s.name == "scrapling"]
    assert server.transport == "stdio"
    assert server.command == "scrapling"
    assert server.args == ["mcp"]


def test_playwright_mcp_is_stdio_npx_shim(
    web_research_agent_spec: AgentSpec,
) -> None:
    """The playwright entry is a stdio MCP server launching `npx -y @playwright/mcp@latest`."""
    (server,) = [s for s in web_research_agent_spec.mcp_servers if s.name == "playwright"]
    assert server.transport == "stdio"
    assert server.command == "npx"
    assert server.args == ["-y", "@playwright/mcp@latest"]


def test_web_research_agent_executor_is_claude_sdk(
    web_research_agent_spec: AgentSpec,
) -> None:
    """The bundle pins executor.type: claude_sdk (same as the other examples)."""
    assert web_research_agent_spec.executor.type == "claude_sdk"