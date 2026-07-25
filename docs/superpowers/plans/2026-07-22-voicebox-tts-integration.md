# Voicebox TTS Integration Implementation Plan

> **⚠️ STALE — Never executed.** This plan was written 2026-07-22 but never
> implemented (all checkboxes unchecked). The voice dispatch it describes
> (`_VOICE_TOOLS`, `_execute_voice_tool`) does not exist in the codebase.
> Superseded by `plans/003-phase4-runner-dispatch.md` which covers all
> surface + voice tool dispatch together. Kept for design context.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable agent-meow agents to speak responses aloud via Voicebox's MCP server, with inline audio playback in the web UI.

**Architecture:** Voicebox runs locally as a standalone process exposing an MCP server (`voicebox.speak`, `voicebox.transcribe`) and a REST API (`POST /speak` on port 17493). agent-meow registers Voicebox as a per-session MCP server via the existing `MCPServerConfig` stdio transport. The agent calls `voicebox.speak(text="...")` → Voicebox synthesizes audio via one of its 7 TTS engines → returns a generation_id + poll_url. The runner's tool dispatch intercepts the call, proxies it, and returns an `audio_url` in the tool output. The web UI's existing `AudioBlock` component renders the audio inline.

**Tech Stack:** Python 3.12 (agent-meow backend), React/TypeScript (web UI), Voicebox (Python FastAPI + FastMCP), MCP protocol (stdio transport)

## Global Constraints

- Voicebox must be installed and running locally (default port 17493)
- agent-meow Python 3.12+, Node.js 22 LTS for web UI
- MCP stdio transport is the integration path (not HTTP) — Voicebox's MCP server runs as a subprocess
- The `AudioBlock.tsx` component already exists in `web/src/components/blocks/AudioBlock.tsx` — it parses `audio_url` from JSON tool output
- Voice tool names (`text_to_speech`, `speak`, `transcribe_audio`, `transcribe_audio_high_quality`) are already reserved in `_BUILTIN_REGISTRY` in `agent_meow/tools/builtins/__init__.py`
- Handy `--transcribe-file <path> --json` is already implemented in Handy main (no Handy changes needed)
- All voice tools are "runner-dispatched, schema-only" — the runner intercepts by name; the ToolManager only reserves the name
- agent-meow AGENTS.md: "Windows is not directly supported — use WSL2" for the backend; web UI dev works on Windows

---

## File Structure

| File | Responsibility |
|------|---------------|
| **Create:** `agent_meow/tools/mcp/voicebox.py` | Voicebox MCP server config helper + stdio launcher |
| **Create:** `agent_meow/tools/builtins/tts.py` | `TextToSpeechTool` / `SpeakTool` schema-only Tool subclasses (or reuse existing `transcribe.py` pattern) |
| **Modify:** `agent_meow/runner/tool_dispatch.py` | Add `_VOICE_TOOLS` frozenset + `_execute_voice_tool` dispatch handler |
| **Modify:** `agent_meow/tools/builtins/__init__.py` | Export voice tool classes (if not already exported) |
| **Modify:** `web/src/components/blocks/BlockRenderer.tsx` | Wire `AudioBlock` into tool output rendering |
| **Modify:** `web/src/components/blocks/ToolCard.tsx` | Call `parseAudioFromToolOutput` to detect audio in tool results |
| **Create:** `examples/voicebox-agent/config.yaml` | Example agent spec with Voicebox MCP server + voice tools |
| **Create:** `agent_meow/tools/mcp/voicebox.yaml` | MCP server config for Voicebox stdio transport |

---

## Task 1: Create Voicebox MCP server config

**Files:**
- Create: `agent_meow/tools/mcp/voicebox.yaml`
- Create: `agent_meow/tools/mcp/voicebox.py` (optional helper)

**Interfaces:**
- Consumes: `MCPServerConfig` from `agent_meow/spec/types.py` (transport="stdio", command, args)
- Produces: A YAML file that agent-meow's spec parser loads as an MCP server

- [ ] **Step 1: Create the MCP server YAML**

Create `agent_meow/tools/mcp/voicebox.yaml`:

```yaml
# Voicebox MCP server — exposes voicebox.speak and voicebox.transcribe
# to any agent-meow agent that references this MCP server in its spec.
#
# Prerequisites:
#   - Voicebox installed and on PATH (or set command to full path)
#   - Voicebox backend running (the MCP server spawns its own backend
#     process via `voicebox mcp serve`)
transport: stdio
command: voicebox
args: ["mcp", "serve"]
description: "Voicebox TTS/STT — voice cloning, 7 TTS engines, Whisper transcription"
timeout: 120
```

- [ ] **Step 2: Verify the YAML is loadable**

```bash
cd agent-meow
uv run python -c "from agent_meow.spec.types import MCPServerConfig; import yaml; c = MCPServerConfig(name='voicebox', **yaml.safe_load(open('agent_meow/tools/mcp/voicebox.yaml'))); print(c)"
```

Expected: prints the MCPServerConfig dataclass with `transport='stdio'`, `command='voicebox'`.

- [ ] **Step 3: Commit**

```bash
git add agent_meow/tools/mcp/voicebox.yaml
git commit -m "feat: add Voicebox MCP server config for TTS/STT integration"
```

---

## Task 2: Create example voicebox-agent spec

**Files:**
- Create: `examples/voicebox-agent/config.yaml`

**Interfaces:**
- Consumes: MCP server from Task 1, voice tool names from `_BUILTIN_REGISTRY`
- Produces: A runnable agent spec that agents-meow can launch with `meow run voicebox-agent`

- [ ] **Step 1: Create the agent spec**

Create `examples/voicebox-agent/config.yaml`:

```yaml
spec_version: 1
name: voicebox-agent
description: >-
  A voice-enabled agent that speaks responses via Voicebox (7 TTS engines,
  voice cloning) and transcribes audio via Handy (offline STT). The full
  voice I/O loop: speak → Handy STT → agent → Voicebox TTS → hear response.

executor:
  type: claude_sdk

# MCP servers — Voicebox provides voicebox.speak and voicebox.transcribe
mcp_servers:
  - name: voicebox
    # Loads from agent_meow/tools/mcp/voicebox.yaml
    # Or inline:
    transport: stdio
    command: voicebox
    args: ["mcp", "serve"]

prompt: |
  You are voicebox-agent, a voice-enabled assistant. You can speak your
  responses aloud via Voicebox and transcribe audio files via Handy.

  Your voice tools (via Voicebox MCP):
  - voicebox.speak: speak text in a voice profile. Pass the text and
    optionally a profile name (e.g. "Morgan"), engine, and language.
    Returns a generation_id you can poll for status.
  - voicebox.transcribe: transcribe an audio file to text via Whisper.

  Your transcription tools (via Handy):
  - transcribe_audio: transcribe an audio file using Handy (local, offline).

  When the user asks you to speak a response, call voicebox.speak with
  the response text. When the user uploads an audio file, call
  transcribe_audio to get the text, then respond to it.

  Keep spoken responses concise — long text generates long audio.

interaction:
  modalities:
    input: [text, image, file, audio]
    output: [text, audio]
```

- [ ] **Step 2: Commit**

```bash
git add examples/voicebox-agent/config.yaml
git commit -m "feat: add voicebox-agent example with Voicebox MCP + Handy STT"
```

---

## Task 3: Wire voice tool dispatch in the runner

**Files:**
- Modify: `agent_meow/runner/tool_dispatch.py`

**Interfaces:**
- Consumes: `TranscribeAudioTool.name()` → `"transcribe_audio"`, `TextToSpeechTool.name()` → `"text_to_speech"`, `"speak"`
- Produces: `_execute_voice_tool()` function that handles `transcribe_audio` (shells out to Handy), `text_to_speech`/`speak` (calls Voicebox REST API), and `transcribe_audio_high_quality` (calls VibeVoice-ASR if configured)

This is the core task — it bridges the schema-only tools to actual execution.

- [ ] **Step 1: Add the voice tool frozenset**

In `agent_meow/runner/tool_dispatch.py`, after the `_SKILL_TOOLS` definition (around line 282), add:

```python
# Priority 5n: agent-meow Voice surface — transcribe_audio (Handy CLI),
# text_to_speech / speak (VibeVoice TTS gateway or Voicebox REST),
# transcribe_audio_high_quality (VibeVoice-ASR gateway).
# Runner-dispatched: the runner shells out to Handy or proxies HTTP
# to the TTS gateway. These tools are schema-only in the ToolManager
# (reserved in _BUILTIN_REGISTRY); the runner intercepts by name.
_VOICE_TOOLS = frozenset(
    {
        "transcribe_audio",
        "transcribe_audio_high_quality",
        "text_to_speech",
        "speak",
    }
)
```

- [ ] **Step 2: Add environment variable constants**

Near the top of the file (after the other env var constants), add:

```python
# Voice surface env vars:
# HANDY_CLI_PATH — override the Handy CLI binary path (default: search PATH)
# VIBEVOICE_TTS_URL — vLLM endpoint for VibeVoice-TTS (e.g. http://127.0.0.1:8000/v1)
# VIBEVOICE_ASR_URL — vLLM endpoint for VibeVoice-ASR (e.g. http://127.0.0.1:8001/v1)
# VOICEBOX_URL — Voicebox REST API URL (default: http://127.0.0.1:17493)
# When VOICEBOX_URL is set, text_to_speech/speak route through Voicebox's
# /speak endpoint (which provides voice cloning + 7 engines + personalities).
# When VIBEVOICE_TTS_URL is set, they route through the vLLM gateway directly.
# VOICEBOX_URL takes precedence over VIBEVOICE_TTS_URL if both are set.
```

- [ ] **Step 3: Implement `_execute_voice_tool`**

Add the dispatch function. This is the core implementation:

```python
async def _execute_voice_tool(
    tool_name: str,
    arguments: dict[str, Any],
    os_env: OSEnvironment | None,
    server_client: httpx.AsyncClient | None,
) -> str:
    """Execute a voice surface tool locally in the runner.

    - ``transcribe_audio``: shell out to ``handy --transcribe-file <path> --json``
      (or the CLI at ``HANDY_CLI_PATH``) and return the transcription text.
    - ``text_to_speech`` / ``speak``: call Voicebox REST ``POST /speak`` (when
      ``VOICEBOX_URL`` is set) or VibeVoice vLLM gateway (when
      ``VIBEVOICE_TTS_URL`` is set). Returns JSON with ``audio_url``.
    - ``transcribe_audio_high_quality``: call VibeVoice-ASR vLLM gateway
      (when ``VIBEVOICE_ASR_URL`` is set).
    """
    import json as _json
    import shutil

    if tool_name == "transcribe_audio":
        path = arguments.get("path")
        if not path:
            return _json.dumps({"error": "missing 'path' argument"})
        handy_cli = os.environ.get("HANDY_CLI_PATH", shutil.which("handy"))
        if not handy_cli:
            return _json.dumps({"error": "handy CLI not found on PATH (set HANDY_CLI_PATH)"})
        cmd = [handy_cli, "--transcribe-file", str(path), "--json"]
        if model := arguments.get("model"):
            cmd.extend(["--model", str(model)])
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate, timeout=300)
        if proc.returncode != 0:
            return _json.dumps({"error": f"handy exited {proc.returncode}: {stderr.decode()}"})
        result = _json.loads(stdout.decode())
        return _json.dumps({"text": result.get("text", ""), "model": result.get("model")})

    if tool_name in ("text_to_speech", "speak"):
        text = arguments.get("text")
        if not text:
            return _json.dumps({"error": "missing 'text' argument"})

        voicebox_url = os.environ.get("VOICEBOX_URL")
        vibevoice_url = os.environ.get("VIBEVOICE_TTS_URL")

        if voicebox_url:
            # Route through Voicebox REST API (preferred — cloning, engines, personalities)
            payload = {"text": text}
            if profile := arguments.get("profile"):
                payload["profile"] = profile
            if engine := arguments.get("engine"):
                payload["engine"] = engine
            if language := arguments.get("language"):
                payload["language"] = language
            if personality := arguments.get("personality"):
                payload["personality"] = personality
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(f"{voicebox_url}/speak", json=payload)
                resp.raise_for_status()
                data = resp.json()
            return _json.dumps({
                "audio_url": f"{voicebox_url}/generate/{data.get('generation_id', '')}/status",
                "text": text,
                "profile": data.get("profile"),
                "generation_id": data.get("generation_id"),
            })

        if vibevoice_url:
            # Route through VibeVoice vLLM gateway directly
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(
                    f"{vibevoice_url}/chat/completions",
                    json={
                        "model": "vibevoice",
                        "messages": [{"role": "user", "content": text}],
                    },
                )
                resp.raise_for_status()
                data = resp.json()
            audio_url = data.get("choices", [{}])[0].get("message", {}).get("audio_url")
            return _json.dumps({"audio_url": audio_url, "text": text})

        return _json.dumps({"error": "no TTS endpoint configured (set VOICEBOX_URL or VIBEVOICE_TTS_URL)"})

    if tool_name == "transcribe_audio_high_quality":
        asr_url = os.environ.get("VIBEVOICE_ASR_URL")
        if not asr_url:
            return _json.dumps({"error": "no ASR endpoint configured (set VIBEVOICE_ASR_URL)"})
        path = arguments.get("path")
        if not path:
            return _json.dumps({"error": "missing 'path' argument"})
        # Read audio file and base64-encode for the vLLM API
        import base64
        with open(path, "rb") as f:
            audio_b64 = base64.b64encode(f.read()).decode()
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{asr_url}/chat/completions",
                json={
                    "model": "vibevoice",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "audio_url", "audio_url": {"url": f"data:audio/wav;base64,{audio_b64}"}},
                            {"type": "text", "text": "Transcribe this audio."},
                        ],
                    }],
                },
            )
            resp.raise_for_status()
            data = resp.json()
        text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
        return _json.dumps({"text": text})

    return _json.dumps({"error": f"unknown voice tool: {tool_name}"})
```

- [ ] **Step 4: Wire `_VOICE_TOOLS` into the dispatch routing**

Find the main dispatch function (the `should_dispatch_locally` check or the `dispatch_tool_locally` function). Add `_VOICE_TOOLS` to the set of locally-dispatched tools and route to `_execute_voice_tool`.

Look for the pattern where other tool sets are checked (e.g., `if tool_name in _OS_ENV_TOOLS:`) and add:

```python
if tool_name in _VOICE_TOOLS:
    result = await _execute_voice_tool(tool_name, arguments, os_env, server_client)
    return result
```

- [ ] **Step 5: Write the test**

Create `tests/runner/test_voice_tool_dispatch.py`:

```python
"""Tests for voice tool dispatch in the runner."""

import json
import os
from unittest.mock import AsyncMock, patch, MagicMock

import pytest


@pytest.mark.asyncio
async def test_transcribe_audio_calls_handy_cli():
    """transcribe_audio shells out to handy --transcribe-file --json."""
    from agent_meow.runner.tool_dispatch import _execute_voice_tool

    mock_proc = AsyncMock()
    mock_proc.returncode = 0
    mock_proc.communicate = AsyncMock(return_value=(
        json.dumps({"text": "hello world", "model": "whisper-small"}).encode(),
        b"",
    ))

    with patch("asyncio.create_subprocess_exec", return_value=mock_proc):
        with patch.dict(os.environ, {"HANDY_CLI_PATH": "/usr/local/bin/handy"}):
            result = await _execute_voice_tool(
                "transcribe_audio",
                {"path": "/tmp/test.wav"},
                os_env=None,
                server_client=None,
            )

    parsed = json.loads(result)
    assert parsed["text"] == "hello world"
    assert parsed["model"] == "whisper-small"


@pytest.mark.asyncio
async def test_text_to_speech_calls_voicebox():
    """text_to_speech routes to Voicebox /speak when VOICEBOX_URL is set."""
    from agent_meow.runner.tool_dispatch import _execute_voice_tool

    mock_response = MagicMock()
    mock_response.json.return_value = {"generation_id": "gen_123", "profile": "Morgan"}
    mock_response.raise_for_status = MagicMock()

    mock_client = AsyncMock()
    mock_client.__aenter__ = AsyncMock(return_value=mock_client)
    mock_client.__aexit__ = AsyncMock(return_value=None)
    mock_client.post = AsyncMock(return_value=mock_response)

    with patch("httpx.AsyncClient", return_value=mock_client):
        with patch.dict(os.environ, {"VOICEBOX_URL": "http://127.0.0.1:17493"}):
            result = await _execute_voice_tool(
                "text_to_speech",
                {"text": "Hello world", "profile": "Morgan"},
                os_env=None,
                server_client=None,
            )

    parsed = json.loads(result)
    assert "audio_url" in parsed
    assert parsed["text"] == "Hello world"
    assert parsed["profile"] == "Morgan"
    assert parsed["generation_id"] == "gen_123"


@pytest.mark.asyncio
async def test_text_to_speech_no_endpoint_configured():
    """text_to_speech returns error when no TTS endpoint is configured."""
    from agent_meow.runner.tool_dispatch import _execute_voice_tool

    # Clear env vars
    env = {k: v for k, v in os.environ.items()
           if k not in ("VOICEBOX_URL", "VIBEVOICE_TTS_URL")}
    with patch.dict(os.environ, env, clear=True):
        result = await _execute_voice_tool(
            "text_to_speech",
            {"text": "Hello"},
            os_env=None,
            server_client=None,
        )

    parsed = json.loads(result)
    assert "error" in parsed
    assert "VOICEBOX_URL" in parsed["error"]
```

- [ ] **Step 6: Run the tests**

```bash
cd agent-meow
uv run pytest tests/runner/test_voice_tool_dispatch.py -v
```

Expected: all 3 tests pass.

- [ ] **Step 7: Commit**

```bash
git add agent_meow/runner/tool_dispatch.py tests/runner/test_voice_tool_dispatch.py
git commit -m "feat: wire voice tool dispatch for Handy STT + Voicebox TTS"
```

---

## Task 4: Wire AudioBlock into the web UI render pipeline

**Files:**
- Modify: `web/src/components/blocks/ToolCard.tsx`
- Modify: `web/src/components/blocks/BlockRenderer.tsx`

**Interfaces:**
- Consumes: `parseAudioFromToolOutput` from `AudioBlock.tsx` (already exists)
- Produces: Tool outputs containing `audio_url` render as inline audio players instead of raw JSON

The `AudioBlock.tsx` component and `parseAudioFromToolOutput()` function already exist and are tested. They are **not yet wired** into the tool output rendering pipeline.

- [ ] **Step 1: Read the current ToolCard rendering**

Read `web/src/components/blocks/ToolCard.tsx` to find where tool output/result text is rendered. Look for the section that displays the tool's output string.

- [ ] **Step 2: Add audio detection to ToolCard**

In `ToolCard.tsx`, import `parseAudioFromToolOutput` and `AudioBlock`:

```tsx
import { AudioBlock, parseAudioFromToolOutput } from "./AudioBlock";
```

In the tool output rendering section (where the result string is displayed), add a check before rendering raw text:

```tsx
// Check if the tool output contains an audio_url (TTS result)
const audioData = parseAudioFromToolOutput(output);
if (audioData) {
  return <AudioBlock url={audioData.url} text={audioData.text} />;
}
```

This should go in the branch that renders completed tool output, before the default text/JSON rendering.

- [ ] **Step 3: Write the test**

Add to `web/src/components/blocks/BlockRenderer.test.tsx` (or create a new test file):

```tsx
import { render, screen } from "@testing-library/react";
import { parseAudioFromToolOutput } from "./AudioBlock";

describe("AudioBlock parsing", () => {
  it("parses audio_url from JSON tool output", () => {
    const output = JSON.stringify({
      audio_url: "http://127.0.0.1:17493/generate/gen_123/status",
      text: "Hello world",
    });
    const result = parseAudioFromToolOutput(output);
    expect(result).not.toBeNull();
    expect(result!.url).toBe("http://127.0.0.1:17493/generate/gen_123/status");
    expect(result!.text).toBe("Hello world");
  });

  it("returns null for non-audio tool output", () => {
    const output = JSON.stringify({ text: "hello world", model: "whisper-small" });
    const result = parseAudioFromToolOutput(output);
    expect(result).toBeNull();
  });

  it("returns null for non-JSON output", () => {
    const result = parseAudioFromToolOutput("plain text output");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 4: Run the tests**

```bash
cd web
npm test -- --run AudioBlock
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add web/src/components/blocks/ToolCard.tsx web/src/components/blocks/BlockRenderer.test.tsx
git commit -m "feat: render TTS audio inline via AudioBlock in tool output"
```

---

## Task 5: End-to-end integration test

**Files:**
- Create: `tests/e2e/test_voice_e2e.py` (or `tests/e2e_ui/` if using Playwright)

**Interfaces:**
- Consumes: Tasks 1-4 (MCP config, voice dispatch, AudioBlock rendering)
- Produces: A passing E2E test that verifies the full voice loop

This is a manual/Integration test — it requires Handy and Voicebox installed.

- [ ] **Step 1: Create a test WAV file**

Generate a 1-second 16kHz mono 16-bit PCM WAV with silence (or use ffmpeg):

```bash
ffmpeg -f lavfi -i "anullsrc=r=16000:cl=mono" -t 1 -c:a pcm_s16le /tmp/test_silence.wav
```

- [ ] **Step 2: Verify Handy transcribe works**

```bash
handy --transcribe-file /tmp/test_silence.wav --json
```

Expected: JSON with `"text": ""` (silence produces empty transcript).

- [ ] **Step 3: Verify Voicebox speak works**

```bash
# Start Voicebox if not running
voicebox &

# Test the /speak endpoint
curl -X POST http://127.0.0.1:17493/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from agent-meow", "profile": "default"}'
```

Expected: JSON with `generation_id`.

- [ ] **Step 4: Launch the voicebox-agent and test end-to-end**

```bash
cd agent-meow
export VOICEBOX_URL=http://127.0.0.1:17493
export HANDY_CLI_PATH=$(which handy)
meow run voicebox-agent
```

In the agent-meow web UI, type: "Say hello to me"
Expected: The agent calls `voicebox.speak(text="Hello!")`, the web UI shows an inline audio player.

- [ ] **Step 5: Test the full voice I/O loop (manual)**

1. Open agent-meow web UI with voicebox-agent running
2. Press Handy hotkey, say "tell me a joke", release
3. Transcript pastes into composer, press Enter
4. Agent processes via Hermes, generates a joke
5. Agent calls `voicebox.speak(text="<joke>")`
6. Audio player appears in chat, click play → hear the joke

- [ ] **Step 6: Document the setup in VOICE_SURFACE.md**

Update `docs/VOICE_SURFACE.md` to reflect the Voicebox MCP integration as the primary TTS path (replacing the VibeVoice-only documentation).

- [ ] **Step 7: Commit**

```bash
git add docs/VOICE_SURFACE.md tests/e2e/test_voice_e2e.py
git commit -m "docs: update VOICE_SURFACE with Voicebox MCP integration + e2e test"
```

---

## Appendix: Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `HANDY_CLI_PATH` | `which handy` | Path to Handy CLI binary for `transcribe_audio` |
| `VOICEBOX_URL` | (unset) | Voicebox REST API URL. When set, `text_to_speech`/`speak` route through Voicebox (preferred — cloning, engines, personalities) |
| `VIBEVOICE_TTS_URL` | (unset) | VibeVoice vLLM endpoint for direct TTS (fallback when Voicebox not available) |
| `VIBEVOICE_ASR_URL` | (unset) | VibeVoice vLLM endpoint for `transcribe_audio_high_quality` |

Precedence: `VOICEBOX_URL` > `VIBEVOICE_TTS_URL` for TTS. Only one needs to be set.