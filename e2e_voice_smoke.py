"""E2E smoke test for the full voice pipeline + LLM inferencing stack.

Tests:
1. LLM non-streaming (Hermes gateway → Ollama)
2. LLM streaming (Hermes gateway → Ollama)
3. TTS (agent-meow backend → Qwen3-TTS wrapper → tts-server.exe)
4. STT (agent-meow backend → whisper-server.exe)
5. Full voice round-trip (TTS → STT transcription)
"""
import time
import requests

HERMES_URL = "http://localhost:8642"
HERMES_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
BACKEND_URL = "http://localhost:6767"

results = []

# 1. LLM non-streaming
t0 = time.time()
r = requests.post(
    f"{HERMES_URL}/v1/chat/completions",
    headers={"Authorization": f"Bearer {HERMES_KEY}"},
    json={
        "model": "hermes-agent",
        "messages": [{"role": "user", "content": "Say hello in one word."}],
        "max_tokens": 50,
        "stream": False,
    },
    timeout=30,
)
t1 = time.time()
content = r.json()["choices"][0]["message"]["content"]
ok = r.status_code == 200 and bool(content)
results.append(("LLM non-streaming", ok, f"{t1 - t0:.3f}s", f"content={content!r}"))

# 2. LLM streaming
t0 = time.time()
r = requests.post(
    f"{HERMES_URL}/v1/chat/completions",
    headers={"Authorization": f"Bearer {HERMES_KEY}"},
    json={
        "model": "hermes-agent",
        "messages": [{"role": "user", "content": "Say hi in one word."}],
        "max_tokens": 50,
        "stream": True,
    },
    timeout=30,
    stream=True,
)
chunks = 0
for line in r.iter_lines():
    if line:
        chunks += 1
t1 = time.time()
ok = r.status_code == 200 and chunks > 0
results.append(("LLM streaming", ok, f"{t1 - t0:.3f}s", f"chunks={chunks}"))

# 3. TTS
t0 = time.time()
r = requests.post(
    f"{BACKEND_URL}/v1/audio/speech",
    json={"model": "default", "input": "Voice pipeline end to end test successful.", "voice": "Serena"},
    timeout=30,
)
tts_bytes = r.content
t1 = time.time()
ok = r.status_code == 200 and len(tts_bytes) > 5000
results.append(("TTS", ok, f"{t1 - t0:.3f}s", f"{len(tts_bytes)} bytes"))

# 4. STT (transcribe the TTS output)
t0 = time.time()
r2 = requests.post(
    f"{BACKEND_URL}/v1/audio/transcriptions",
    files={"file": ("test.wav", tts_bytes, "audio/mpeg")},
    timeout=30,
)
stt_text = r2.json().get("text", "")
t1 = time.time()
ok = r2.status_code == 200 and bool(stt_text.strip())
results.append(("STT", ok, f"{t1 - t0:.3f}s", f"text={stt_text!r}"))

# 5. Full voice round-trip (TTS output transcribed by STT)
# TTS may hyphenate "end-to-end" — normalize for comparison
expected_stripped = "voice pipeline end to end test successful".replace("-", " ")
stt_normalized = stt_text.lower().replace("-", " ").strip()
ok = expected_stripped in stt_normalized
results.append(("Voice round-trip (TTS→STT)", ok, "-", f"text={stt_text!r}"))

# Summary
print("\n=== E2E Voice Pipeline + LLM Inferencing Smoke Test ===\n")
all_pass = True
for name, ok, timing, detail in results:
    status = "PASS" if ok else "FAIL"
    if not ok:
        all_pass = False
    print(f"  [{status}] {name:30s} {timing:>10s}  {detail}")

print()
if all_pass:
    print("ALL TESTS PASSED — gateway server working in perfect conditions.")
else:
    print("SOME TESTS FAILED — see details above.")
