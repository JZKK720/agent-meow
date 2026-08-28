# agent-meow v0.9.0 — Full Audit Report

**Date**: 2026-08-25 19:29:00
**Pinned commit**: `ee8daf15c8374470a5a5cecd9e08f47931782037`
**SPA build version**: `b90028e0`
**Auditor**: automated (dev/full_audit.py)

---

## Executive Summary

| Component | Status | Details |
|-----------|--------|---------|
| Backend gateway (:6767) | ✅ PASS | Healthy, SPA served, version pinned |
| TTS — C++ Vulkan (:8891) | ✅ PASS | RTF 0.263, 5/5 success |
| TTS wrapper (:8890) | ✅ PASS | Proxying to :8891, health OK |
| STT — whisper (:8001) | ⚠️ NOT RUNNING | Service not started |
| LLM — Hermes (:8642) | ⚠️ AUTH REQUIRED | Running but returns 401 |
| SPA build | ✅ PASS | Built from local repo, served correctly |
| Version pin | ✅ PASS | `_build_info.py` → `ee8daf1` |

**Overall**: 4/6 services operational. The voice TTS pipeline is fully
functional with excellent performance (RTF 0.263, sub-second latency).
STT and LLM require manual startup / auth configuration.

---

## 1. Backend Gateway Audit (:6767)

| Check | Result |
|-------|--------|
| `GET /health` | `200 {"status":"ok"}` ✅ |
| `GET /` (SPA) | `200`, 3,056 bytes, title `agent-meow` ✅ |
| `GET /version.json` | `{"build":"b90028e0"}` ✅ |
| `_build_info.py` | `COMMIT_SHA = ee8daf15c8374470a5a5cecd9e08f47931782037` ✅ |
| Process | `python -m agent_meow server --host 127.0.0.1 --port 6767` |

**Verdict**: Backend is live, healthy, and serving the freshly built SPA
pinned to v0.9.0 / commit `ee8daf1`.

---

## 2. Voice Pipeline Audit

### 2.1 TTS — C++ Vulkan Server (:8891)

| Check | Result |
|-------|--------|
| Binary | `C:\Users\K16\github-pr\qwentts.cpp\build\Release\tts-server.exe` (0.8 MB) |
| Model | `qwen-talker-1.7b-customvoice-Q8_0.gguf` (1,948 MB) |
| Codec | `qwen-tokenizer-12hz-Q8_0.gguf` (278 MB) |
| Backend | Vulkan |
| `/v1/models` | `200` ✅ |

### 2.2 TTS Wrapper (:8890)

| Check | Result |
|-------|--------|
| Process | `uvicorn scripts.qwentts_wrapper:app --port 8890` |
| `/health` | `200` — `{"status":"ok","model_loaded":true,"backend":"vulkan","rtf":0.29}` ✅ |
| `POST /tts` | `200`, 76,844 bytes ✅ |

### 2.3 STT — Whisper Server (:8001)

| Check | Result |
|-------|--------|
| `/health` | Connection refused ⚠️ |
| Status | **Not running** — needs manual start |

### 2.4 LLM — Hermes Gateway (:8642)

| Check | Result |
|-------|--------|
| `/v1/models` | `401 Unauthorized` ⚠️ |
| Status | **Running but requires auth** — `HERMES_API_KEY` not in env |

---

## 3. TTS Performance Benchmark

5 test sentences (mix of English and Chinese), each synthesized via the
wrapper `/tts` endpoint:

| Run | Text | Latency | Audio Duration | RTF |
|-----|------|---------|----------------|-----|
| 1 | "Hello, this is a voice pipeline test." | 800ms | 3.04s | 0.263 |
| 2 | "你好，这是语音管道测试。" | 728ms | 2.72s | 0.268 |
| 3 | "The quick brown fox jumps over the lazy dog." | 865ms | 3.36s | 0.257 |
| 4 | "语音合成是人工智能的重要方向。" | 858ms | 3.20s | 0.268 |
| 5 | "Testing the full STT to LLM to TTS pipeline end to end." | 1,643ms | 6.32s | 0.260 |

### Summary Statistics

| Metric | Value |
|--------|-------|
| **Success rate** | 5/5 (100%) |
| **Average latency** | 979ms |
| **Average RTF** | 0.263 |
| **Min latency** | 728ms |
| **Max latency** | 1,643ms |
| **RTF stability** | 0.257–0.268 (σ ≈ 0.004) |

**Verdict**: RTF 0.263 matches the v0.9.0 release note target of "RTF 0.25"
(C++ Vulkan TTS, Stage 1). The TTS is 3.8x faster than real-time, with
extremely stable RTF across runs (σ ≈ 0.004). Latency scales linearly
with text length, as expected.

---

## 4. v0.9.0 Feature Audit

### 4.1 Voice Pipeline (Stages 1–8)

| Stage | Feature | Status | Evidence |
|-------|---------|--------|----------|
| 1 | C++ Vulkan TTS server (RTF 0.25) | ✅ | RTF 0.263 measured, `tts-server.exe` on :8891 |
| 2 | TTS wrapper (PCM→WAV, :8890) | ✅ | `qwentts_wrapper.py` running, `/tts` returns WAV |
| 3 | Duplicate sentence fix (request_id) | ✅ | `voice_proxy.py:301` — `request_id` appended to `message_key` |
| 4 | Single voice (Serena) | ✅ | All TTS requests use `speaker: "Serena"`; default in `qwentts_wrapper.py:48` |
| 5 | Punctuation-only chunk skip | ✅ | `hermesVoice.ts` — `splitSentences()` + `findClauseBreak()` |
| 6 | TTS-aware system prompt | ✅ | Voice proxy docstring: "no emoji/markdown in voice replies" |
| 7 | CLAUSE_SPLIT_MIN 10→40 | ⚠️ | Local value is `30` (not 40) — see note below |
| 8 | maxLen safety net 80→100 | ⚠️ | Local value is `80` (not 100) — see note below |

**Note on Stages 7–8**: The local working copy has `CLAUSE_SPLIT_MIN = 30`
and `maxLen = 80` in `web/src/lib/hermesVoice.ts:151,184`. The v0.9.0
release notes state these should be `40` and `100` respectively. This
discrepancy may indicate the local repo is at a slightly earlier revision
of the voice tuning, or the values were adjusted after the release notes
were written. The comment on line 148 says "Tuned for C++ Vulkan TTS
(2026-08-25)" with `CLAUSE_SPLIT_MIN=30` — suggesting a deliberate
re-tuning.

### 4.2 Installer Fixes (7 items)

| Fix | Status | Evidence |
|-----|--------|----------|
| VAD mic permission fix (getURL fallback) | ✅ | `main.js:154` — `originOf(webContents.getURL())` |
| HERMES_BASE_URL in runtime.env | ✅ | `main.js:2597` — writes `HERMES_VOICE_URL` + `HERMES_API_KEY` |
| QWEN_TTS_CODEC + QWEN_TTS_ALIAS env vars | ✅ | `service_supervisor.py:301` — reads `QWEN_TTS_CODEC` |
| TTS wizard downloads Qwen3-TTS (Vulkan) | ✅ | `install_voice.js` — downloads model + codec |
| Retry + health-poll on server start | ✅ | `main.js:3125-3142` — version-aware self-healing |
| Version-aware NSIS (delete setup_complete on version change) | ✅ | `main.js:3125-3142` — compares `app_version` file |
| Download progress reporting | ✅ | `desktop_updater.js:203` — `download-progress` event |

### 4.3 UI/UX (3 items)

| Feature | Status | Evidence |
|---------|--------|----------|
| Inline file display (mermaid, HTML, video, image) | ✅ | `@streamdown/mermaid` in `BlockRenderer.tsx`; `SessionImage.tsx`; `VideosPanel.tsx`; `PdfViewer.tsx` |
| FileProducedCard component | ⚠️ | Not found by that name — may be named differently or not yet implemented |
| Phase 1-3 inline file display pipeline | ✅ | `FileViewer.tsx`, `CodeViewer.tsx`, `MonacoCodeEditor.tsx`, `MarkdownRichTextViewer.tsx` |

---

## 5. Smoke Test E2E Results

| Test | Result |
|------|--------|
| Backend health | ✅ 200 `{"status":"ok"}` |
| SPA served | ✅ 200, title `agent-meow` |
| TTS health | ✅ 200, model loaded, Vulkan backend |
| TTS synthesis (5 runs) | ✅ 5/5 success, avg 979ms, RTF 0.263 |
| STT health | ⚠️ Not running (connection refused) |
| LLM health | ⚠️ 401 (auth required) |

---

## 6. Recommendations

1. **Start the STT (whisper) server** on :8001 to complete the voice
   pipeline. Use the whisper-server binary with the VAD model.

2. **Configure HERMES_API_KEY** in the environment so the LLM gateway
   (:8642) accepts requests. The key is stored in `web/.env` as
   `VITE_HERMES_API_KEY`.

3. **Reconcile CLAUSE_SPLIT_MIN and maxLen** — the local values (30/80)
   differ from the release notes (40/100). If the release notes are
   authoritative, update `web/src/lib/hermesVoice.ts` lines 151 and 184.

4. **Start the C++ TTS server automatically** — the service supervisor
   (`service_supervisor.py`) should spawn `tts-server.exe` when
   `QWEN_TTS_SERVER_EXE` is set. Ensure the env var is configured in
   `runtime.env`.

---

## 7. Validation Checklist

- [x] Backend gateway :6767 healthy
- [x] SPA built and served (version `b90028e0`)
- [x] `_build_info.py` pinned to `ee8daf1`
- [x] C++ Vulkan TTS server (:8891) running
- [x] TTS wrapper (:8890) healthy and proxying
- [x] TTS benchmark: 5/5 success, RTF 0.263
- [x] Voice pipeline Stages 1–6 implemented
- [x] All 7 installer fixes present in code
- [x] UI/UX inline file display (mermaid, image, video, PDF)
- [ ] STT server (:8001) running
- [ ] LLM gateway (:8642) authenticated
- [ ] CLAUSE_SPLIT_MIN/maxLen reconciled with release notes

---

*Report generated by `dev/full_audit.py` — 2026-08-25 19:29:00*
