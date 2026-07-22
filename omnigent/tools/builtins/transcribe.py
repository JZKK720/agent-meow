"""Speech-to-text transcription tools (``transcribe_audio``).

These tools are **runner-dispatched**: the runner shells out to a local
transcription CLI (Handy by default) to transcribe audio files. They ship
as schema-only :class:`~?omnigent.tools.base.Tool` subclasses.

- ``transcribe_audio`` â†’ calls ``handy --transcribe-file <path> --json``
  (or a configurable alternative CLI) and returns the transcription text.
- ``transcribe_audio_high_quality`` â†’ calls a VibeVoice-ASR vLLM endpoint
  for long-form transcription with diarization + timestamps.

The runner's tool dispatch intercepts these calls by name and executes
them locally (see ``omnigent/runner/tool_dispatch.py``).
"""

from __future__ import annotations

from typing import Any

from omnigent.tools.base import Tool


class TranscribeAudioTool(Tool):
    """Transcribe an audio file using a local STT CLI (Handy by default).

    Runner-dispatched: the runner shells out to ``handy --transcribe-file
    <path> --json`` (or the CLI configured via ``HANDY_CLI_PATH`` env var)
    and returns the transcription text. Handy is a free, open-source,
    offline speech-to-text desktop app â€” see https://handy.computer.

    Requires a ``path`` to an audio file (WAV 16kHz mono recommended).
    Optionally accepts a ``model`` id to override Handy's selected model.
    """

    @classmethod
    def name(cls) -> str:
        return "transcribe_audio"

    @classmethod
    def description(cls) -> str:
        return (
            "Transcribe an audio file to text using a local speech-to-text "
            "engine (Handy by default). Requires a path to an audio file on "
            "the local filesystem (WAV 16kHz mono recommended). Optionally "
            "specify a model id to override the default STT model. Returns "
            "the transcribed text. The audio never leaves the machine â€” "
            "transcription is fully offline."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": TranscribeAudioTool.name(),
                "description": TranscribeAudioTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": (
                                "Path to the audio file to transcribe. "
                                "WAV (16 kHz mono) is recommended. "
                                "MP3, M4A, and other formats may work "
                                "depending on the STT engine."
                            ),
                        },
                        "model": {
                            "type": "string",
                            "description": (
                                "Optional STT model id to override the "
                                "default (e.g. 'whisper-large-v3', "
                                "'parakeet-tdt-0.6b-v3-int8')."
                            ),
                        },
                        "language": {
                            "type": "string",
                            "description": (
                                "Optional language code (e.g. 'en', 'zh', "
                                "'ja') to hint the STT engine. Omit for "
                                "auto-detection."
                            ),
                        },
                    },
                    "required": ["path"],
                    "additionalProperties": False,
                },
            },
        }


class TranscribeAudioHighQualityTool(Tool):
    """Transcribe audio with diarization + timestamps via VibeVoice-ASR.

    Runner-dispatched: the runner calls a VibeVoice-ASR vLLM endpoint
    (configured via ``VIBEVOICE_ASR_URL`` env var) for high-quality
    long-form transcription with speaker diarization and timestamps.

    Requires a ``path`` to an audio file and the VibeVoice-ASR gateway
    to be running. Returns structured transcription with speaker labels.
    """

    @classmethod
    def name(cls) -> str:
        return "transcribe_audio_high_quality"

    @classmethod
    def description(cls) -> str:
        return (
            "Transcribe an audio file with speaker diarization and "
            "timestamps using VibeVoice-ASR (a high-quality long-form "
            "ASR model). Requires a path to an audio file and the "
            "VibeVoice-ASR gateway to be running (configured via "
            "VIBEVOICE_ASR_URL). Returns structured transcription "
            "indicating who said what and when."
        )

    def get_schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "function": {
                "name": TranscribeAudioHighQualityTool.name(),
                "description": TranscribeAudioHighQualityTool.description(),
                "parameters": {
                    "type": "object",
                    "properties": {
                        "path": {
                            "type": "string",
                            "description": "Path to the audio file to transcribe.",
                        },
                        "language": {
                            "type": "string",
                            "description": "Optional language code for the audio.",
                        },
                    },
                    "required": ["path"],
                    "additionalProperties": False,
                },
            },
        }