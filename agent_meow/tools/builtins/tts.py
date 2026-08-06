"""Text-to-speech tools (``text_to_speech`` / ``speak``).

These tools are **runner-dispatched**: the runner calls a TTS gateway
to synthesize speech from text. They ship as schema-only
:class:`~?agent_meow.tools.base.Tool` subclasses.

- ``text_to_speech`` → calls a TTS gateway to generate audio from text.
  In v1 it returns an inline audio data URL the UI can play.
- ``speak`` → alias for ``text_to_speech`` with a shorter name for
  conversational agents.

The runner's tool dispatch intercepts these calls by name and proxies
them to the TTS gateway (see ``agent_meow/runner/tool_dispatch.py``).
"""

from __future__ import annotations

from typing import Any

from agent_meow.tools.base import Tool


class TextToSpeechTool(Tool):
    """Synthesize speech from text using a TTS gateway.

    Runner-dispatched: the runner calls a TTS gateway
    (configured via ``HERMES_TTS_URL`` env var) to generate audio
    from the provided text. In v1 the generated audio is returned as
    an inline data URL the UI can play directly.

    Requires ``text`` to synthesize. Optionally accepts a ``voice`` /
    ``speaker`` id and ``language`` code.
    """

    @classmethod
    def name(cls) -> str:
        return "text_to_speech"

    @classmethod
    def description(cls) -> str:
        return (
            "Synthesize speech from text using a text-to-speech engine. "
            "Returns an inline audio URL that can be played in the UI. "
            "Requires text to synthesize. Optionally specify a voice/speaker "
            "id and language."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": TextToSpeechTool.name(),
                "description": TextToSpeechTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "The text to synthesize into speech.",
                        },
                        "voice": {
                            "type": "string",
                            "description": (
                                "Optional voice/speaker id (e.g. 'speaker_1', "
                                "'speaker_2'). Defaults to the first speaker."
                            ),
                        },
                        "language": {
                            "type": "string",
                            "description": (
                                "Optional language code (e.g. 'en', 'zh'). "
                                "Defaults to auto-detect from text."
                            ),
                        },
                        "speed": {
                            "type": "number",
                            "description": (
                                "Optional speech speed multiplier (0.5–2.0). "
                                "Defaults to 1.0."
                            ),
                        },
                        "engine": {
                            "type": "string",
                            "enum": ["kokoro", "qwen", "luxtts", "chatterbox", "chatterbox_turbo", "tada"],
                            "description": (
                                "TTS engine to use. kokoro is fastest on CPU "
                                "(82M params, 53 preset voices, sub-second). "
                                "Default: qwen (1.7B, highest quality)."
                            ),
                        },
                    },
                    "required": ["text"],
                    "additionalProperties": False,
                },
            },
        }


class SpeakTool(Tool):
    """Short alias for ``text_to_speech`` — synthesize speech from text.

    Convenience tool with a shorter name for conversational agents that
    speak frequently. Same behavior as ``text_to_speech``.
    """

    @classmethod
    def name(cls) -> str:
        return "speak"

    @classmethod
    def description(cls) -> str:
        return (
            "Synthesize speech from text (alias for text_to_speech). "
            "Returns an audio artifact URL. Requires text to synthesize."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": SpeakTool.name(),
                "description": SpeakTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "The text to speak.",
                        },
                        "voice": {
                            "type": "string",
                            "description": "Optional voice/speaker id.",
                        },
                        "engine": {
                            "type": "string",
                            "enum": ["kokoro", "qwen", "luxtts", "chatterbox", "chatterbox_turbo", "tada"],
                            "description": (
                                "TTS engine to use. kokoro is fastest on CPU. "
                                "Default: qwen (1.7B, highest quality)."
                            ),
                        },
                    },
                    "required": ["text"],
                    "additionalProperties": False,
                },
            },
        }