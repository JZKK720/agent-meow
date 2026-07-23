"""Structural test for the browser-agent example bundle (examples/browser-agent).

browser-agent is the reference for the skill-only pattern (no MCP server):
browser-harness is a CLI driven by inline Python heredocs, NOT an MCP server.
The agent uses agent-meow's existing shell/terminal tools to run it, routed by
a bundled skill. This is a DIFFERENT shape than the other four integration
examples:

- memory-agent / scrapling-agent / voicebox-agent: MCP only (the MCP server
  IS the capability).
- reach-agent: skill + minimal MCP (skill routes to upstream CLIs, MCP is
  diagnostics-only).
- browser-agent: skill ONLY (no MCP — the CLI is driven via shell heredocs).

Pure spec-load — no LLM, no credentials, no running browser-harness CLI
required — modeled on ``test_example_reach_agent.py`` (which also asserts on
bundled skills).

What breaks if this fails:
- the ``browser-harness`` skill is dropped or renamed (the agent loses its
  CLI command reference — wouldn't know how to call browser-harness heredocs),
- an MCP server is accidentally added (browser-harness is NOT an MCP server;
  an MCP entry here would be wrong — the capability is reached via shell,
  not via the MCP manager),
- the executor silently changes away from claude_sdk.
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_browser_agent.py -> repo root is 3 parents up.
_BROWSER_AGENT_BUNDLE = Path(__file__).resolve().parents[3] / "examples" / "browser-agent"


@pytest.fixture(scope="module")
def browser_agent_spec() -> AgentSpec:
    """Load and validate the browser-agent bundle once for the module."""
    return load(_BROWSER_AGENT_BUNDLE)


def test_browser_agent_bundles_browser_harness_skill(
    browser_agent_spec: AgentSpec,
) -> None:
    """
    The bundle ships the ``browser-harness`` skill (from
    skills/browser-harness/SKILL.md). This skill is the CLI command reference
    — without it the agent wouldn't know how to call browser-harness heredocs
    (page_info, goto_url, click_at_xy, type_text, fill_input, js, etc.). It
    must be auto-discovered onto ``AgentSpec.skills``.
    """
    assert browser_agent_spec.name == "browser-agent"
    skill_names = {s.name for s in browser_agent_spec.skills}
    assert "browser-harness" in skill_names, (
        f"expected the browser-harness skill to be bundled, got {sorted(skill_names)}"
    )


def test_browser_agent_declares_no_mcp_servers(
    browser_agent_spec: AgentSpec,
) -> None:
    """
    browser-harness is a CLI driven by shell heredocs, NOT an MCP server. The
    bundle must declare ZERO MCP servers — the capability is reached via
    agent-meow's existing shell/terminal tools, not via the MCP manager. An
    MCP entry here would be a category error.
    """
    mcp_names = {s.name for s in browser_agent_spec.mcp_servers}
    assert mcp_names == set(), (
        f"expected no MCP servers (skill-only pattern), got {sorted(mcp_names)}"
    )


def test_browser_agent_executor_is_claude_sdk(
    browser_agent_spec: AgentSpec,
) -> None:
    """
    The bundle pins ``executor.type: claude_sdk`` so the example runs
    out-of-the-box for anyone with an Anthropic credential, mirroring the
    other four integration examples.
    """
    assert browser_agent_spec.executor.type == "claude_sdk"