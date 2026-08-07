"""Voice overlay builder for injecting the agent-meow voice contract into Hermes.

When agent-meow launches a Hermes session (headless or native TUI), it already
creates a per-session ``HERMES_HOME`` with a ``config.yaml`` that registers
policy hooks and the Omnigent MCP server. This module builds the TTS overlay
that gets merged into that same config so Hermes calls the agent-meow voice
gateway instead of its own multi-provider stack.

The overlay defines exactly one Hermes-facing provider name (``agent-meow-voice``)
that POSTs to the local gateway. The fallback chain lives inside the gateway,
not in Hermes config.
"""

from __future__ import annotations

import copy
from typing import Any

_PROVIDER_NAME = "agent-meow-voice"

# The Hermes command provider that calls the agent-meow voice gateway.
# Uses a small Python one-liner (same pattern as the existing qwen3-tts
# command provider in data/config.yaml) so it works cross-platform inside
# Docker containers without needing curl.
_VOICE_COMMAND_TEMPLATE = (
    'python3 -c "\n'
    "import sys, json, urllib.request;\n"
    "text = open(sys.argv[1]).read();\n"
    "data = json.dumps(dict(text=text)).encode();\n"
    "req = urllib.request.Request('{base_url}/tts', data=data, "
    "headers={{'Content-Type': 'application/json'}});\n"
    "resp = urllib.request.urlopen(req);\n"
    'open(sys.argv[2], \'wb\').write(resp.read())\n'
    '" "{{input_path}}" "{{output_path}}"'
)


def build_hermes_voice_overlay(base_tts_url: str) -> dict[str, Any]:
    """Build the TTS overlay dict that points Hermes at the agent-meow gateway.

    :param base_tts_url: The base URL of the agent-meow voice gateway.
        For host-launched Hermes: ``http://127.0.0.1:17494``
        For Dockerized Hermes: ``http://host.docker.internal:17494``
    :returns: A dict with ``tts`` and ``providers`` keys to merge into
        the per-session Hermes config.
    """
    command = _VOICE_COMMAND_TEMPLATE.format(base_url=base_tts_url.rstrip("/"))
    return {
        "tts": {
            "provider": _PROVIDER_NAME,
            "providers": {
                _PROVIDER_NAME: {
                    "type": "command",
                    "command": command,
                    "output_format": "wav",
                    "timeout": 120,
                },
            },
        },
    }


def merge_hermes_voice_overlay(config: dict[str, Any], overlay: dict[str, Any]) -> dict[str, Any]:
    """Merge the voice overlay into an existing Hermes config dict.

    Deep-merges the ``tts`` key so existing TTS settings (if any) are replaced
    by the overlay, while all other config keys (model, hooks, mcp_servers,
    etc.) are preserved untouched.

    :param config: The existing Hermes config dict (from user config + hooks).
    :param overlay: The overlay dict from :func:`build_hermes_voice_overlay`.
    :returns: A new merged config dict; the input is not mutated.
    """
    merged = copy.deepcopy(config)
    for key, value in overlay.items():
        if key in merged and isinstance(merged[key], dict) and isinstance(value, dict):
            # Deep-merge one level: overlay sub-keys replace config sub-keys.
            merged[key] = {**merged[key], **value}
        else:
            merged[key] = value
    return merged