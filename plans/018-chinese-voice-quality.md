# Plan 018: Improve Chinese STT→LLM→TTS Quality

**Commit:** c642e4ba7 (HEAD of main, 2026-08-24)
**Author:** Advisor audit
**Status:** Ready for execution

## Problem

Chinese is the primary locale for agent-meow (橘宝/Jubao persona), but the voice pipeline produces poor Chinese quality across all three stages:

1. **TTS generates excessive audio** — `tts-server.exe` started without `--max-new` limit, generating 18.8s of hallucinated audio for 6 Chinese characters (should be ~2-3s). The Q8_0 model doesn't trigger EOS naturally.
2. **STT transcribes hallucinated audio** — Whisper tries to transcribe the 16s of silence/noise after the actual speech, producing garbled Chinese characters.
3. **LLM auth was broken** — Hermes API key in the env var (`28765d33...`, 48 chars) didn't match the actual key in `/opt/data/.env` (`3f0d6858...`, 64 chars). Fixed by using the correct key.

## Root Causes (verified)

### TTS: Missing `--max-new` on tts-server.exe
- `tts-server.exe` at `C:\Users\1\github-pr\qwentts.cpp\build\Release\tts-server.exe`
- Started with: `--model ... --codec ... --port 8891 --lang auto` (NO `--max-new`)
- Default `--max-new` = 2048 tokens = ~163s of audio at 12.5 Hz
- For 6 Chinese chars, generates 18.8s (should be ~2-3s)
- Source: `qwentts-cpp-vulkan-working-2026-08-23.md:37-41` — "EOS not triggering, Q8_0 quantization issue"
- Evidence: `tts-server.exe` command line via `Get-CimInstance Win32_Process`

### STT: Whisper small model + hallucinated TTS audio
- `whisper-server.exe` using `ggml-small.bin` (466 MB)
- Chinese language detection works (99.1% confidence)
- But transcribes the hallucinated speech in the silence, producing wrong characters
- The `ggml-medium.bin` (1.53 GB) is downloaded and available but doesn't fix the root cause (still transcribes hallucinated audio)
- Evidence: verbose_json output showing 6 segments for 6 chars of input, `avg_logprob` -0.78

### LLM: API key mismatch (FIXED)
- `API_SERVER_KEY` env var in container = `28765d33...` (48 chars, old)
- Actual key in `/opt/data/.env:44` = `3f0d6858...` (64 chars, current)
- Fix: use `3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb`
- Evidence: `docker exec hermes-gateway grep API_SERVER_KEY /opt/data/.env`

## Improvement Plan

### Fix 1: Add `--max-new` to tts-server.exe startup (HIGH impact, LOW effort)

**What:** Limit the number of tokens `tts-server.exe` generates to prevent hallucinated audio after the actual speech.

**Why:** The Q8_0 quantized model doesn't trigger EOS reliably. Without a token limit, it generates up to 2048 tokens (~163s of audio) regardless of input length. For voice sessions, utterances are typically 1-30s, so `--max-new 400` (≈32s max) is a safe ceiling.

**Files to change:**
- `agent_meow/server/service_supervisor.py` — the supervisor that spawns `tts-server.exe` needs `--max-new 400` in the args
- `scripts/start-native-stack.ps1` — standalone startup script
- `scripts/start-agent-meow-native.ps1` — if it starts tts-server

**Current code** (`service_supervisor.py:147`):
```python
[self._tts_server_exe, "--port", "8891"],
```

**Change to:**
```python
[self._tts_server_exe, "--port", "8891", "--max-new", "400"],
```

**Also add to standalone scripts:**
```powershell
tts-server.exe --model ... --codec ... --port 8891 --lang auto --max-new 400
```

**Verification:**
1. Restart `tts-server.exe` with `--max-new 400`
2. Generate Chinese TTS: `curl -X POST http://127.0.0.1:8890/tts -H "Content-Type: application/json" -d '{"text":"你好我是橘宝","language":"Chinese","speaker":"Serena"}'`
3. Check audio duration: should be 2-5s (not 18.8s)
4. Generate English TTS: same with English text, check duration is proportional

**Risk:** Low — `--max-new 400` is generous (32s max). If text is longer, audio truncates at 32s. For voice sessions this is acceptable (utterances rarely exceed 30s).

### Fix 2: Add VAD-based audio trimming in qwentts_wrapper.py (MEDIUM impact, MEDIUM effort)

**What:** After receiving PCM from `tts-server.exe`, trim trailing silence/low-energy audio before converting to WAV.

**Why:** Even with `--max-new 400`, the model may generate some silence padding. Trimming ensures STT receives only the actual speech.

**Files to change:**
- `scripts/qwentts_wrapper.py` — add a `_trim_silence(pcm_bytes, sample_rate)` function

**Implementation:**
```python
def _trim_silence(pcm_bytes: bytes, sample_rate: int = 24000, threshold: int = 100) -> bytes:
    """Trim trailing silence from PCM S16 mono audio.
    
    Scans from the end backward, removing samples whose absolute
    amplitude is below the threshold (100 out of 32768 = ~0.3%).
    Keeps at least 0.1s of padding to avoid clipping.
    """
    if len(pcm_bytes) < 4:
        return pcm_bytes
    samples = struct.unpack(f"<{len(pcm_bytes)//2}h", pcm_bytes)
    # Find last sample above threshold
    last_loud = len(samples) - 1
    padding = int(sample_rate * 0.1)  # 100ms padding
    for i in range(len(samples) - 1, padding - 1, -1):
        if abs(samples[i]) > threshold:
            last_loud = i
            break
    end = min(last_loud + padding, len(samples))
    return struct.pack(f"<{end}h", *samples[:end])
```

Call `_trim_silence()` before `_pcm_to_wav()` in the `tts()` endpoint.

**Verification:**
1. Generate TTS for short Chinese text
2. Check WAV duration is proportional to text length (rough: 0.3-0.5s per Chinese char)
3. Run STT on the trimmed audio — should produce better results

**Risk:** Low — only trims silence, never speech. The threshold (100/32768) is conservative.

### Fix 3: Switch to Whisper medium model for Chinese-first locale (MEDIUM impact, LOW effort)

**What:** Switch `whisper-server.exe` from `ggml-small.bin` to `ggml-medium.bin` since Chinese is the primary locale.

**Why:** The medium model (1.53 GB, 24 layers, 1024-dim) has significantly better Chinese vocabulary coverage than small (466 MB, 12 layers, 768-dim). English accuracy is identical. Latency increases ~1.8x (0.48s → 0.87s for JFK) but still well under 1s.

**Files to change:**
- `agent_meow/server/service_supervisor.py` — if it starts whisper-server (currently it doesn't, but for future packaging)
- Startup scripts: `scripts/start-native-stack.ps1`, `scripts/start-agent-meow-native.ps1`
- Memory note: update `docs/voice-architecture.md` to reflect medium model choice

**Current:**
```powershell
.\build\bin\Release\whisper-server.exe -m models\ggml-small.bin -l auto --host 127.0.0.1 --port 8080
```

**Change to:**
```powershell
.\build\bin\Release\whisper-server.exe -m models\ggml-medium.bin -l zh --host 127.0.0.1 --port 8080
```

Note: `-l zh` sets the default language to Chinese (instead of `auto`). The client still sends `language=auto` or `language=zh` per request, which overrides this.

**Verification:**
1. Restart whisper-server with medium model
2. Test English: JFK sample → should be perfect (verified: 0.87s, exact match)
3. Test Chinese: generate proper Chinese audio (after Fix 1+2) → should be significantly better
4. Check RTF: should be 0.07-0.08 (12-14x faster than realtime)

**Risk:** Low — medium model is already downloaded and tested. Can switch back to small instantly.

### Fix 4: Set whisper-server default language to `zh` (LOW impact, LOW effort)

**What:** Start `whisper-server.exe` with `-l zh` instead of `-l auto` since Chinese is the primary locale.

**Why:** Auto-detection on short Chinese audio sometimes misdetects as Japanese (71% ja vs 3% zh in one test). Pinning `zh` as the default prevents this. The client still sends `language` per request which overrides the default.

**Files to change:** Same startup scripts as Fix 3.

**Verification:**
1. Send audio without `language` field → should default to Chinese
2. Send audio with `language=en` → should override to English

### Fix 5: Update HERMES_API_KEY in startup scripts (HIGH impact, LOW effort)

**What:** Ensure the correct 64-char Hermes API key is used in all startup scripts and env configs.

**Why:** The env var `API_SERVER_KEY` in the Docker container shows a stale 48-char key. The actual key is in `/opt/data/.env:44` and is 64 chars. This caused LLM 401 errors.

**Files to change:**
- `scripts/start-agent-meow-native.ps1` — if it sets HERMES_API_KEY
- `.env` or `.env.local` if they exist
- Document the correct key location

**Verification:**
1. Start agent-meow server with the key
2. `curl -X POST http://localhost:6767/v1/chat/completions ...` → should return 200, not 401
3. Test Chinese LLM: `用中文说：你好` → should respond in Chinese

## Execution Order

1. **Fix 5** (API key) — unblocks LLM testing
2. **Fix 1** (tts-server --max-new) — fixes root cause of TTS hallucination
3. **Fix 2** (VAD trimming) — defense in depth for audio quality
4. **Fix 3** (medium model) — better Chinese STT accuracy
5. **Fix 4** (zh default) — prevents language misdetection

## Test Plan

After all fixes, run the full Chinese pipeline test:

```
1. LLM: "用中文说：你好我是橘宝，今天天气很好" → Chinese response
2. TTS: Send LLM response to /v1/audio/speech → WAV audio (2-10s, not 18s)
3. STT: Send TTS audio to /v1/audio/transcriptions → should transcribe Chinese correctly
4. Verify round-trip: LLM output ≈ STT input (semantic match, not exact)
```

English regression test:
```
1. JFK sample → exact transcription (verified with both small and medium)
2. English TTS → exact transcription
3. Long English → 3/4 sentences exact
```

## Maintenance Notes

- The `--max-new 400` value may need tuning: if users speak long sentences (>30s), increase to 600
- The VAD trimming threshold (100/32768) may need adjustment for noisy environments
- The medium model uses ~2.1 GB VRAM (vs 852 MB for small) — both fit easily in 96GB iGPU
- If a future Qwen3-TTS model fix resolves the EOS issue, `--max-new` can be removed
- The API key should be read from `/opt/data/.env` or a secure config, not hardcoded