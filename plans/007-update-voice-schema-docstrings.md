# Plan 007: Update voice schema docstrings (Voicebox preferred)

> **Executor instructions**: Follow this plan step by step.

> **Drift check**: `git diff --stat 1090799b..HEAD -- omnigent/tools/builtins/tts.py omnigent/tools/builtins/transcribe.py`

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs
- **Planned at**: commit `1090799b`, 2026-07-22

## Why this matters

The schema docstrings in `tts.py` and `transcribe.py` describe VibeVoice as
the default TTS backend, but the runner dispatch now prefers Voicebox (via
`VOICEBOX_URL`) with VibeVoice as the fallback. The LLM sees tool descriptions
that understate the actual capability (voice cloning, 7 engines, per-profile
personalities) and would misconfigure the system. Stale docs that are
actively wrong are worse than missing docs.

## Current state

**File**: `omnigent/tools/builtins/tts.py`
- Line 7–10: module docstring says "the runner calls a TTS gateway (VibeVoice via vLLM by default)"
- Line 33: `TextToSpeechTool.description()` says "VibeVoice by default"

**File**: `omnigent/tools/builtins/transcribe.py`
- Line 5–7: describes only Handy CLI, not the VibeVoice-ASR high-quality path

**Runner dispatch** (`tool_dispatch.py:6090`): checks `VOICEBOX_URL` first,
falls back to `VIBEVOICE_TTS_URL`.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Import check | `uv run python -c "from omnigent.tools.builtins.tts import TextToSpeechTool; print(TextToSpeechTool().description()[:80])"` | description starts with updated text |
| Run voice tests | `uv run pytest tests/runner/test_voice_tool_dispatch.py -v` | 11 passed |

## Steps

1. **Update `tts.py` module docstring** (line 7–10)

   Change from:
   ```python
   """TTS tool — text-to-speech via VibeVoice TTS gateway.
   ...
   """
   ```
   To:
   ```python
   """TTS tool — text-to-speech via Voicebox (preferred) or VibeVoice (fallback).

   When VOICEBOX_URL is set, the runner dispatches to Voicebox REST POST /speak
   (voice cloning, 7 TTS engines, per-profile personalities). When only
   VIBEVOICE_TTS_URL is set, the runner falls back to VibeVoice-TTS via vLLM.
   """
   ```

2. **Update `TextToSpeechTool.description()`** (line ~33)

   Change from "VibeVoice by default" to "Voicebox (preferred, when
   VOICEBOX_URL is set) or VibeVoice vLLM (fallback)"

3. **Update `SpeakTool.description()`** similarly if it mentions VibeVoice

4. **Update `transcribe.py` module docstring** (line 5–7)

   Add mention of the `transcribe_audio_high_quality` VibeVoice-ASR path:
   ```python
   """Transcription tools — Handy CLI (offline STT) and VibeVoice-ASR (high-quality).

   transcribe_audio shells out to handy --transcribe-file --json (offline,
   cross-platform, Whisper/Parakeet). transcribe_audio_high_quality calls a
   VibeVoice-ASR vLLM endpoint (VIBEVOICE_ASR_URL) for diarized long-form
   transcription.
   """
   ```

5. **Run voice tests to confirm no regression**

   Run: `uv run pytest tests/runner/test_voice_tool_dispatch.py -v`

   Expected: 11 passed.

6. **Commit with DCO**

   ```bash
   git add omnigent/tools/builtins/tts.py omnigent/tools/builtins/transcribe.py
   git commit -s -m "docs(tools): update voice schema docstrings to reflect Voicebox preference

   The runner dispatch now prefers Voicebox (VOICEBOX_URL) over VibeVoice
   (VIBEVOICE_TTS_URL), but the schema docstrings still described VibeVoice
   as the default. Updates tts.py and transcribe.py to match the actual
   dispatch priority."
   ```

## Out of scope

- Do NOT modify the runner dispatch logic — only docstrings/descriptions.
- Do NOT modify `__init__.py` — its comment already correctly describes the priority.

## STOP conditions

- If the description text is used in a test assertion — update the test too.
  Check: `grep -r "VibeVoice by default" tests/`