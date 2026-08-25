"""Tests for the agent-meow Hermes voice overlay (Task 2).

Verifies that the overlay builder produces the correct provider config and
that merging it into an existing Hermes config preserves other keys.
"""

from __future__ import annotations

import json

from agent_meow.hermes_voice_overlay import (
    build_hermes_voice_overlay,
    merge_hermes_voice_overlay,
)


def test_overlay_sets_provider_name() -> None:
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    assert overlay["tts"]["provider"] == "edge"


def test_overlay_sets_stt_language_zh() -> None:
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    assert overlay["stt"]["language"] == "zh"


def test_overlay_defines_exactly_one_provider() -> None:
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    providers = overlay["tts"]["providers"]
    assert len(providers) == 1
    assert "qwen-offline" in providers


def test_overlay_command_contains_tts_url() -> None:
    overlay = build_hermes_voice_overlay("http://host.docker.internal:8890")
    cmd = overlay["tts"]["providers"]["qwen-offline"]["command"]
    assert "host.docker.internal:8890/tts" in cmd


def test_overlay_command_strips_trailing_slash() -> None:
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890/")
    cmd = overlay["tts"]["providers"]["qwen-offline"]["command"]
    assert "127.0.0.1:8890/tts" in cmd
    assert "8890//tts" not in cmd


def test_overlay_command_uses_python3_not_curl() -> None:
    """The command must work inside Docker containers without curl installed."""
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    cmd = overlay["tts"]["providers"]["qwen-offline"]["command"]
    assert "python3 -c" in cmd
    assert "curl" not in cmd


def test_merge_preserves_existing_hooks() -> None:
    """Merging the overlay must not destroy hooks/mcp_servers from the base config."""
    base = {
        "model": {"default": "test-model"},
        "hooks": {"pre_tool_call": [{"command": "/hook.sh", "timeout": 86400}]},
        "mcp_servers": {"omnigent": {"command": "python", "args": []}},
    }
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    merged = merge_hermes_voice_overlay(base, overlay)

    # Hooks and MCP servers are preserved.
    assert "pre_tool_call" in merged["hooks"]
    assert "omnigent" in merged["mcp_servers"]
    # Model is preserved.
    assert merged["model"]["default"] == "test-model"
    # TTS overlay is present with edge as primary.
    assert merged["tts"]["provider"] == "edge"
    # STT language is set to zh.
    assert merged["stt"]["language"] == "zh"


def test_merge_replaces_existing_tts() -> None:
    """If the base config already has a tts block, the overlay replaces it."""
    base = {"tts": {"provider": "edge", "edge": {"voice": "en-US-AriaNeural"}}}
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    merged = merge_hermes_voice_overlay(base, overlay)
    assert merged["tts"]["provider"] == "edge"
    assert "qwen-offline" in merged["tts"]["providers"]


def test_merge_does_not_mutate_input() -> None:
    base = {"model": {"default": "test"}}
    overlay = build_hermes_voice_overlay("http://127.0.0.1:8890")
    merge_hermes_voice_overlay(base, overlay)
    # Input is not mutated.
    assert "tts" not in base
