"""Text-to-speech tools (``text_to_speech`` / ``speak``).

These tools are **runner-dispatched**: the runner calls a TTS gateway
(VibeVoice via vLLM by default) to synthesize speech from text. They
ship as schema-only :class:`~?omnigent.tools.base.Tool` subclasses.

- ``text_to_speech`` â†’ calls a VibeVoice TTS vLLM endpoint to generate
    audio from text. In v1 it returns an inline audio data URL the UI can play.
- ``speak`` â†’ alias for ``text_to_speech`` with a shorter name for
    conversational agents.

The runner's tool dispatch intercepts these calls by name and proxies
them to the TTS gateway (see ``omnigent/runner/tool_dispatch.py``).
"""

from __future__ import annotations

from typing import Any

from omnigent.tools.base import Tool


class TextToSpeechTool(Tool):
    """Synthesize speech from text using a TTS gateway (VibeVoice by default).

    Runner-dispatched: the runner calls a VibeVoice TTS vLLM endpoint
    (configured via ``VIBEVOICE_TTS_URL`` env var) to generate audio
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
            "Synthesize speech from text using a text-to-speech engine "
            "(VibeVoice by default). Returns an inline audio URL that "
            "can be played in the UI. Requires text to synthesize. "
            "Optionally specify a voice/speaker id and language."
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
                                "Optional speech speed multiplier (0.5â€“2.0). "
                                "Defaults to 1.0."
                            ),
                        },
                    },
                    "required": ["text"],
                    "additionalProperties": False,
                },
            },
        }


class SpeakTool(Tool):
    """Short alias for ``text_to_speech`` â€” synthesize speech from text.

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
                    },
                    "required": ["text"],
                    "additionalProperties": False,
                },
            },
        }