"""Structural test for the voicebox-agent example bundle (examples/voicebox-agent).

voicebox-agent is the reference for the per-agent voicebox MCP pattern: it
declares the voicebox MCP server (FastMCP at /mcp, Streamable HTTP) in its
``tools`` block so every session created from it gets voicebox's 7-engine TTS
surface (Qwen3-TTS, Qwen CustomVoice, LuxTTS, Chatterbox, Chatterbox Turbo,
TADA/HumeAI, Kokoro 82M) plus Whisper STT, with zero core agent-meow code
changes. Pure spec-load — no LLM, no credentials, no running voicebox server
required — modeled on ``test_example_memory_agent.py``.

What breaks if this fails:
- the ``voicebox`` MCP entry is dropped or renamed (the agent loses its
  entire TTS + STT surface),
- the transport silently flips from http to stdio (voicebox exposes MCP via
  FastMCP Streamable HTTP at /mcp, not a stdio subprocess),
- the ``url`` drifts away from ``http://localhost:17493/mcp`` (the agent
  would dial the wrong endpoint; the documented default port is 17493),
- the bundle accidentally duplicates the existing ``voice-agent`` (which
  uses VibeVoice + Handy builtin tools, not voicebox — these are distinct
  examples for distinct TTS stacks).
"""

from __future__ import annotations

from pathlib import Path

import pytest

from agent_meow.spec import load
from agent_meow.spec.types import AgentSpec

# tests/e2e/omnigent/test_example_voicebox_agent.py -> repo root is 3 parents up.
_VOICEBOX_AGENT_BUNDLE = (
    Path(__file__).resolve().parents[3] / "examples" / "voicebox-agent"
)


@pytest.fixture(scope="module")
def voicebox_agent_spec() -> AgentSpec:
    """Load and validate the voicebox-agent bundle once for the module."""
    return load(_VOICEBOX_AGENT_BUNDLE)


def test_voicebox_agent_declares_voicebox_mcp_server(
    voicebox_agent_spec: AgentSpec,
) -> None:
    """The bundle declares exactly one MCP server named ``voicebox``."""
    assert voicebox_agent_spec.name == "voicebox-agent"
    mcp_names = {s.name for s in voicebox_agent_spec.mcp_servers}
    assert mcp_names == {"voicebox"}, (
        f"expected only the voicebox MCP server, got {sorted(mcp_names)}"
    )


def test_voicebox_mcp_is_http_on_default_port(
    voicebox_agent_spec: AgentSpec,
) -> None:
    """
    The voicebox entry is an HTTP MCP server at the documented default
    endpoint ``http://localhost:17493/mcp``. voicebox exposes MCP via
    FastMCP Streamable HTTP, not a stdio subprocess — so transport MUST be
    ``http`` and the URL MUST point at the /mcp path.
    """
    (server,) = [s for s in voicebox_agent_spec.mcp_servers if s.name == "voicebox"]
    assert server.transport == "http"
    assert server.url == "http://localhost:17493/mcp"


def test_voicebox_agent_executor_is_claude_sdk(
    voicebox_agent_spec: AgentSpec,
) -> None:
    """
    The bundle pins ``executor.type: claude_sdk`` so the example runs
    out-of-the-box for anyone with an Anthropic credential, mirroring
    ``examples/doc-writer``, ``examples/memory-agent``, and
    ``examples/scrapling-agent``.
    """
    assert voicebox_agent_spec.executor.type == "claude_sdk"