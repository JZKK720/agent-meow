# Voice surface (agent-meow)

The Voice surface adds speech-to-text (STT) input and text-to-speech (TTS)
output to the agent-meow workspace. It integrates two external open-source
projects via their local gateways/CLIs — no code from either is vendored.

## Architecture

```
agent-meow Voice surface
├── STT (speech-to-text input)
│   ├── Handy (local, offline) — global hotkey → speak → text in composer
│   └── transcribe_audio tool — agent-driven audio file transcription
├── TTS (text-to-speech output)
│   ├── VibeVoice-Realtime-0.5B via vLLM — streaming TTS gateway
│   └── text_to_speech / speak tools — agent-driven speech synthesis
├── High-quality ASR (long-form with diarization)
│   └── VibeVoice-ASR-7B via vLLM — transcribe_audio_high_quality tool
├── Builtin tools
│   └── omnigent/tools/builtins/{transcribe.py, tts.py}
├── Runner dispatch
│   └── omnigent/runner/tool_dispatch.py (_execute_voice_tool)
└── Example agents
    ├── examples/voice-agent/config.yaml (TTS + STT)
    └── examples/transcribe-agent/config.yaml (STT only)
```

## Handy integration (STT input)

[Handy](https://github.com/cjpais/Handy) is a free, open-source, offline
speech-to-text desktop app (Tauri + Rust + Whisper/Parakeet). It works
system-wide: press a global hotkey, speak, and text is pasted into any
application — including agent-meow's chat composer.

### Setup (zero code)

1. Install Handy from [handy.computer](https://handy.computer) or
   `brew install --cask handy` (macOS) / `winget install cjpais.Handy` (Windows)
2. Launch Handy, grant microphone permissions, configure a global shortcut
   (default: `Ctrl+Space` on Windows/Linux, `Option+Space` on macOS)
3. Open agent-meow in the browser, click the chat composer
4. Press the global shortcut → speak → release → Handy pastes transcribed
   text into the composer
5. Press Enter to send to the agent

### Agent-driven transcription (transcribe_audio tool)

The `transcribe_audio` builtin tool shells out to `handy --transcribe-file`:

```bash
# Handy must be installed and a model downloaded
handy --transcribe-file recording.wav --json
```

The tool is runner-dispatched — the runner calls the Handy CLI directly.
Set `HANDY_CLI_PATH` if Handy is not on the PATH.

## VibeVoice integration (TTS output + high-quality ASR)

[VibeVoice](https://github.com/microsoft/VibeVoice) is a family of open-source
frontier voice AI models from Microsoft Research. agent-meow integrates two:

- **VibeVoice-Realtime-0.5B** — real-time streaming TTS
- **VibeVoice-ASR-7B** — long-form ASR with diarization + timestamps

### Setup

Serve the models via vLLM (on a GPU machine):

```bash
# TTS gateway
vllm serve microsoft/VibeVoice-Realtime-0.5B --port 8000

# ASR gateway (optional, for high-quality transcription)
vllm serve microsoft/VibeVoice-ASR --port 8001
```

Set environment variables before starting agent-meow:

```bash
export VIBEVOICE_TTS_URL=http://127.0.0.1:8000/v1
export VIBEVOICE_ASR_URL=http://127.0.0.1:8001/v1  # optional
meow
```

### Builtin tools

| Tool | Description |
| --- | --- |
| `text_to_speech` | Synthesize speech from text via VibeVoice TTS gateway |
| `speak` | Short alias for `text_to_speech` |
| `transcribe_audio` | Transcribe an audio file via Handy CLI (offline) |
| `transcribe_audio_high_quality` | Transcribe with diarization via VibeVoice-ASR |

Tools are runner-dispatched (schema-only `Tool` subclasses); the runner's
`_execute_voice_tool` handler shells out to Handy or proxies HTTP to vLLM.

## UI

The existing `ComposerMicButton.tsx` uses the browser's Web Speech API for
cloud-backed STT. For offline STT, use Handy's global hotkey (zero code).
A future enhancement will replace the browser API with a Handy CLI
integration for in-app offline mic input.

TTS audio artifacts render as inline `<audio>` players in chat bubbles
when the agent calls `text_to_speech` / `speak`.

## v1 limitations

- **VibeVoice-TTS inference code** was removed from the upstream repo by
  Microsoft. The model weights remain on HuggingFace. The realtime
  streaming variant's code is still present. Integration assumes vLLM
  can serve the model — verify this works before relying on it.
- **Audio playback in chat**: the TTS tool returns an audio URL; a
  dedicated `AudioBlock.tsx` renderer is planned but not yet built.
  In v1 the URL is returned as text and the user can open it in a browser.
- **In-app offline mic**: Handy works system-wide via global hotkey today.
  Replacing the browser SpeechRecognition API with a Handy CLI integration
  in the composer is a future enhancement.