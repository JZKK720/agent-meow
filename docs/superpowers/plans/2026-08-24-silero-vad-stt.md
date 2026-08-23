# Silero VAD for Whisper STT Anti-Hallucination — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable Silero VAD v6.2.0 on the lemonade whisper-server to prevent Whisper from hallucinating text on silent audio.

**Architecture:** The VAD model (885KB ggml file) is downloaded to lemonade's standard models directory. Lemonade's `whispercpp.args` config is set to `--vad --vad-model <path> --vad-threshold 0.6`. The whisper-server filters silence before the Whisper encoder sees it. No changes to `voice_proxy.py`, `dictation.py`, or `service_supervisor.py` — VAD is a lemonade config change, not a code change. The bootstrap wizard's voice-stack step is updated to download the VAD model and set the config instead of the broken `pip install lemonade-server`.

**Tech Stack:** lemonade-server (C++ binary), whisper.cpp Silero VAD, Electron wizard (Node.js), Python pytest

**Spec:** `docs/superpowers/specs/2026-08-24-silero-vad-stt-design.md`

## Global Constraints

- Windows 10/11 x64 target (lemonade MSI install path: `%LOCALAPPDATA%\lemonade_server\bin\`)
- VAD model: `ggml-silero-v6.2.0.bin` (885KB), from `https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin`
- VAD model location: `~/.cache/lemonade/models/ggml-silero-v6.2.0.bin` (lemonade's standard models dir)
- VAD threshold: 0.6 (configurable via `whispercpp.args`)
- Lemonade is a C++ binary — NEVER `pip install lemonade-server` or `python -m lemonade.server` (both are nonexistent)
- All commits use `git commit -s` (DCO sign-off required)

---

### Task 1: Regression test — silence produces empty text

**Files:**
- Create: `tests/server/test_stt_vad.py`
- Test: `tests/server/test_stt_vad.py`

**Interfaces:**
- Consumes: lemonade server running on `http://127.0.0.1:13305` with Whisper-Large-v3-Turbo loaded
- Produces: a regression test that catches any future VAD misconfiguration

- [ ] **Step 1: Write the failing test**

Create `tests/server/test_stt_vad.py`:

```python
"""Regression test: Whisper+VAD must not hallucinate on silent audio.

Without VAD, whisper.cpp with the Turbo model hallucinates "Thank you."
on 2 seconds of pure silence. With Silero VAD enabled, the whisper-server
filters silence before the encoder sees it and returns empty text.

This test sends 2 seconds of silence to the lemonade STT endpoint and
asserts the response text is empty. It requires a running lemonade
server with the Whisper-Large-v3-Turbo model loaded — skip if unavailable.
"""

from __future__ import annotations

import io
import json
import os
import struct
import urllib.error
import urllib.request
import wave

import pytest

LEMONADE_STT_URL = os.environ.get("LEMONADE_STT_URL", "http://127.0.0.1:13305")
LEMONADE_STT_MODEL = os.environ.get("LEMONADE_STT_MODEL", "Whisper-Large-v3-Turbo")


def _is_lemonade_available() -> bool:
    """Check if the lemonade server is reachable."""
    try:
        urllib.request.urlopen(
            f"{LEMONADE_STT_URL}/v1/health", timeout=3
        )
        return True
    except Exception:
        return False


def _silence_wav(duration_s: float = 2.0, sample_rate: int = 16000) -> bytes:
    """Generate a WAV file of pure silence."""
    buf = io.BytesIO()
    w = wave.Wave_write(buf)
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sample_rate)
    n_samples = int(duration_s * sample_rate)
    w.writeframes(struct.pack("<" + "h" * n_samples, *([0] * n_samples)))
    w.close()
    buf.seek(0)
    return buf.read()


def _transcribe(audio_bytes: bytes) -> str:
    """Send audio to lemonade STT and return the transcript text."""
    boundary = b"----vad-test"
    parts = [
        b"--" + boundary + b"\r\n",
        b'Content-Disposition: form-data; name="file"; filename="silence.wav"\r\n',
        b"Content-Type: audio/wav\r\n\r\n",
        audio_bytes,
        b"\r\n--" + boundary + b"\r\n",
        b'Content-Disposition: form-data; name="model"\r\n\r\n',
        LEMONADE_STT_MODEL.encode(),
        b"\r\n--" + boundary + b"--\r\n",
    ]
    body = b"".join(parts)
    req = urllib.request.Request(
        f"{LEMONADE_STT_URL}/v1/audio/transcriptions",
        data=body,
        headers={"Content-Type": "multipart/form-data; boundary=----vad-test"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode())
    return result.get("text", "").strip()


@pytest.mark.skipif(
    not _is_lemonade_available(),
    reason="lemonade server not running on :13305",
)
def test_silence_produces_empty_text() -> None:
    """Whisper+VAD must return empty text on 2 seconds of silence.

    Without VAD, the Turbo model hallucinates "Thank you." on silence.
    This test catches a VAD misconfiguration regression.
    """
    audio = _silence_wav(duration_s=2.0)
    text = _transcribe(audio)
    assert text == "", f"Expected empty text on silence, got: {text!r}"
```

- [ ] **Step 2: Run test to verify it passes (VAD is already configured)**

Run: `.venv\Scripts\python.exe -m pytest tests/server/test_stt_vad.py -v`
Expected: PASS (the lemonade server on this machine already has VAD configured)

- [ ] **Step 3: Commit**

```bash
git add tests/server/test_stt_vad.py
git commit -s -m "test: add regression test for Whisper VAD silence hallucination"
```

---

### Task 2: Fix the bootstrap wizard — replace pip install with lemond.exe download + VAD model

**Files:**
- Modify: `web/electron/src/wizard/steps/install_voice.js` (lines 49-81)

**Interfaces:**
- Consumes: `downloadFile()` helper (already in the file)
- Produces: `installLemonade()` now downloads lemond.exe + VAD model + sets config, instead of the broken `pip install lemonade-server`

- [ ] **Step 1: Rewrite `installLemonade()` to download lemond.exe + VAD model**

Replace the entire `installLemonade` function (lines 49-81) in `web/electron/src/wizard/steps/install_voice.js` with:

```javascript
// Lemonade is a C++ binary, NOT a Python package. Download the Embeddable
// Lemonade release (lemond.exe) + the Silero VAD model, then configure
// whispercpp.args to enable VAD.
const LEMONADE_EMBEDDABLE_URL = "https://github.com/lemonade-sdk/lemonade/releases/latest/download/lemonade-embeddable-windows-x64.zip";
const VAD_MODEL_URL = "https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v6.2.0.bin";
const WHISPER_MODEL = "Whisper-Large-v3-Turbo";

/**
 * Install Lemonade STT: download lemond.exe + VAD model, pull Whisper, set VAD config.
 * @param {string} installDir - Directory to install lemonade (e.g. %LOCALAPPDATA%\lemonade_server)
 * @param {function} onProgress - callback(percent, status)
 * @returns {Promise<string>} - Path to lemond.exe
 */
async function installLemonade(installDir, onProgress) {
  const binDir = path.join(installDir, "bin");
  const modelsDir = path.join(installDir, "models");
  fs.mkdirSync(binDir, { recursive: true });
  fs.mkdirSync(modelsDir, { recursive: true });

  // 1. Download the Embeddable Lemonade zip and extract lemond.exe
  onProgress(10, "Downloading Lemonade Server...");
  const zipPath = path.join(installDir, "lemonade-embeddable.zip");
  await downloadFile(LEMONADE_EMBEDDABLE_URL, zipPath);
  // Extraction is handled by the wizard's unzip utility (7zip or Node's yauzl)
  // The zip contains lemond.exe at the root — extract it to binDir
  await unzipTo(zipPath, binDir);
  fs.unlinkSync(zipPath);
  const lemondExe = path.join(binDir, "lemond.exe");
  if (!fs.existsSync(lemondExe)) {
    throw new Error("lemond.exe not found after extraction");
  }

  // 2. Download the Silero VAD model (885KB)
  onProgress(30, "Downloading Silero VAD model...");
  const vadModelPath = path.join(modelsDir, "ggml-silero-v6.2.0.bin");
  await downloadFile(VAD_MODEL_URL, vadModelPath);

  // 3. Pull the Whisper model via lemonade CLI
  onProgress(50, "Pulling Whisper model...");
  await new Promise((resolve, reject) => {
    execFile(
      lemondExe,
      ["--port", "13305"],
      { windowsHide: true, timeout: 10000 },
      () => resolve(),  // start server, don't wait for it
    );
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));  // wait for boot
  await new Promise((resolve, reject) => {
    execFile(
      path.join(binDir, "lemonade.exe"),
      ["pull", WHISPER_MODEL],
      { windowsHide: true, timeout: 600000 },
      (err) => err ? reject(err) : resolve(),
    );
  });

  // 4. Set whispercpp.args to enable VAD
  onProgress(90, "Configuring VAD...");
  const vadArgs = `--vad --vad-model ${vadModelPath} --vad-threshold 0.6`;
  await new Promise((resolve, reject) => {
    execFile(
      path.join(binDir, "lemonade.exe"),
      ["config", "set", `whispercpp.args=${vadArgs}`],
      { windowsHide: true, timeout: 10000 },
      (err) => err ? reject(err) : resolve(),
    );
  });

  onProgress(100, "Lemonade STT ready (with VAD)");
  return lemondExe;
}
```

Also add the `unzipTo` helper at the top of the file (after `downloadFile`):

```javascript
/**
 * Extract a zip file to a directory.
 * Uses Node's built-in zlib + yauzl if available, or falls back to
 * PowerShell's Expand-Archive on Windows.
 * @param {string} zipPath
 * @param {string} destDir
 * @returns {Promise<void>}
 */
function unzipTo(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-Command", `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"],
      { windowsHide: true, timeout: 60000 },
      (err) => err ? reject(err) : resolve(),
    );
  });
}
```

- [ ] **Step 2: Update the module exports**

Change the last line of the file to also export `unzipTo`:

```javascript
module.exports = { installLemonade, installTts, downloadFile, unzipTo, TTS_SERVER_URL, TTS_MODEL_URL };
```

- [ ] **Step 3: Update the wizard.js caller**

In `web/electron/src/wizard/wizard.js`, the `installLemonade` call site needs to pass `installDir` instead of `pythonExe`. Find the call and update it:

```javascript
// OLD: installLemonade(pythonExe, onProgress)
// NEW:
const lemonadeDir = path.join(appData, "lemonade_server");
const lemondExe = await installLemonade(lemonadeDir, onProgress);
```

- [ ] **Step 4: Verify the wizard JS has no syntax errors**

Run: `cd web && node -e "require('./electron/src/wizard/steps/install_voice.js')"`
Expected: no error (the module loads without throwing)

- [ ] **Step 5: Commit**

```bash
git add web/electron/src/wizard/steps/install_voice.js web/electron/src/wizard/wizard.js
git commit -s -m "fix: wizard downloads lemond.exe + Silero VAD instead of pip install lemonade-server"
```

---

### Task 3: Update the desktop .exe packaging design doc to reference VAD

**Files:**
- Modify: `docs/superpowers/specs/2026-08-24-desktop-exe-packaging-design.md` (wizard step tree, ~line 249)

**Interfaces:**
- Consumes: the VAD design spec at `docs/superpowers/specs/2026-08-24-silero-vad-stt-design.md`
- Produces: the packaging design doc accurately reflects the VAD model download step

- [ ] **Step 1: Add the VAD model download to the wizard step tree**

In `docs/superpowers/specs/2026-08-24-desktop-exe-packaging-design.md`, find the "Step 4: Install Voice Stack" section and add the VAD model download line after the Whisper model pull:

```
    │   ├── [download] Lemonade → download lemond.exe (Embeddable release) to %LOCALAPPDATA%\lemonade_server\bin\
    │   ├── [download] Silero VAD v6.2.0 → %LOCALAPPDATA%\lemonade_server\models\ggml-silero-v6.2.0.bin (885KB)
    │   ├── [download] Whisper-Large-v3-Turbo → lemonade pull Whisper-Large-v3-Turbo
    │   ├── [config] lemonade config set whispercpp.args=--vad --vad-model <path> --vad-threshold 0.6
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-08-24-desktop-exe-packaging-design.md
git commit -s -m "docs: add Silero VAD model download to packaging wizard step tree"
```

---

### Task 4: Update repo memory with the VAD fix

**Files:**
- Modify: `/memories/repo/lemonade-stt-vulkan-dgpu.md`

- [ ] **Step 1: Add the VAD fix section**

Append to the memory file:

```markdown
## VAD fix (2026-08-24)

The hallucination root cause was NOT the NPU int8 encoder — it was the
absence of VAD on the whisper-server. whisper.cpp with the Turbo model
hallucinates "Thank you." on silence even on Vulkan dGPU with full
precision. The fix: download Silero VAD v6.2.0 (ggml-silero-v6.2.0.bin,
885KB) to ~/.cache/lemonade/models/ and set whispercpp.args:

    lemonade config set whispercpp.args=--vad --vad-model <path> --vad-threshold 0.6

Verified: 2s silence → '' (was 'Thank you.').
```

- [ ] **Step 2: No commit needed (memory files are outside the repo)**
