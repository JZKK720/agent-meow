"""Comprehensive server health + voice pipeline latency + LLM inference quality smoke test.

Tests:
1. Health check every server (200 OK)
2. Voice pipeline latencies (TTS + STT, 3 runs each)
3. Hermes → Ollama LLM context quality + inference latency (3 runs each, streaming + non-streaming)
"""
import time
import statistics
import requests

HERMES_URL = "http://localhost:8642"
HERMES_KEY = "28765d337208aa3c0b6671cb1969e8cad9c22d7b7967b216"
BACKEND_URL = "http://localhost:6767"
TTS_WRAPPER_URL = "http://localhost:8890"
TTS_SERVER_URL = "http://localhost:8891"
WHISPER_URL = "http://localhost:8001"
OLLAMA_URL = "http://localhost:11434"

# ─────────────────────────────────────────────────────────
# 1. Health checks
# ─────────────────────────────────────────────────────────
print("=" * 70)
print("  1. SERVER HEALTH CHECKS")
print("=" * 70)
print()

health_endpoints = [
    ("agent-meow backend",  f"{BACKEND_URL}/health",                     None),
    ("agent-meow stack",    f"{BACKEND_URL}/v1/stack/status",             None),
    ("Hermes gateway",      f"{HERMES_URL}/v1/models",                    {"Authorization": f"Bearer {HERMES_KEY}"}),
    ("Hermes chat",         f"{HERMES_URL}/v1/chat/completions",           None),  # POST, skip GET
    ("Ollama",              f"{OLLAMA_URL}/api/tags",                     None),
    ("whisper-server.exe",  f"{WHISPER_URL}/health",                      None),
    ("tts wrapper (:8890)", f"{TTS_WRAPPER_URL}/health",                  None),
    ("tts-server.exe (:8891)", f"{TTS_SERVER_URL}/v1/models",            None),
]

all_healthy = True
for name, url, headers in health_endpoints:
    try:
        r = requests.get(url, headers=headers, timeout=10)
        ok = r.status_code == 200
        status_str = f"200 OK" if ok else f"HTTP {r.status_code}"
        print(f"  [{'PASS' if ok else 'FAIL':4s}] {name:30s}  {status_str:12s}  {url}")
        if not ok:
            all_healthy = False
    except Exception as e:
        print(f"  [FAIL] {name:30s}  ERROR: {e}")
        all_healthy = False

# Stack status detail
print()
try:
    r = requests.get(f"{BACKEND_URL}/v1/stack/status", timeout=10)
    stack = r.json()
    print(f"  Stack detail: server={stack.get('server')}, "
          f"hermes={stack.get('hermes', {}).get('status')}, "
          f"ollama={stack.get('ollama', {}).get('status')} "
          f"({stack.get('ollama', {}).get('count', 0)} models), "
          f"whisper={stack.get('whisper_stt', {}).get('status')} "
          f"({stack.get('whisper_stt', {}).get('model', '?')}), "
          f"tts={stack.get('tts', {}).get('status')}")
    for svc in stack.get("services", []):
        print(f"    service: {svc['name']:20s} pid={svc['pid']} port={svc['port']} "
              f"state={svc['state']} restarts={svc['restart_count']} "
              f"uptime={svc['uptime_s']:.0f}s")
except Exception as e:
    print(f"  [FAIL] Could not get stack detail: {e}")
    all_healthy = False

# Ollama models
print()
try:
    r = requests.get(f"{OLLAMA_URL}/api/tags", timeout=10)
    models = r.json().get("models", [])
    for m in models:
        name = m.get("name", "?")
        size_mb = m.get("size", 0) / (1024 * 1024)
        print(f"  Ollama model: {name:40s} {size_mb:.0f} MB")
except Exception as e:
    print(f"  [FAIL] Could not list Ollama models: {e}")
    all_healthy = False

# ─────────────────────────────────────────────────────────
# 2. Voice pipeline latencies (3 runs each)
# ─────────────────────────────────────────────────────────
print()
print("=" * 70)
print("  2. VOICE PIPELINE LATENCY (3 runs each)")
print("=" * 70)
print()

tts_samples = [
    "Hello, this is a latency test.",
    "The quick brown fox jumps over the lazy dog.",
    "Artificial intelligence is transforming how we interact with computers.",
]

tts_times = []
for i, text in enumerate(tts_samples, 1):
    t0 = time.time()
    r = requests.post(
        f"{BACKEND_URL}/v1/audio/speech",
        json={"model": "default", "input": text, "voice": "Serena"},
        timeout=30,
    )
    t1 = time.time()
    elapsed = t1 - t0
    tts_times.append(elapsed)
    ok = r.status_code == 200 and len(r.content) > 1000
    print(f"  [{'PASS' if ok else 'FAIL':4s}] TTS run {i}: {elapsed:.3f}s, "
          f"{len(r.content):,} bytes, status={r.status_code}")

print(f"  TTS mean: {statistics.mean(tts_times):.3f}s  "
      f"min={min(tts_times):.3f}s  max={max(tts_times):.3f}s")

# STT: transcribe each TTS output
print()
stt_times = []
for i, text in enumerate(tts_samples, 1):
    # Get TTS audio
    r_tts = requests.post(
        f"{BACKEND_URL}/v1/audio/speech",
        json={"model": "default", "input": text, "voice": "Serena"},
        timeout=30,
    )
    audio = r_tts.content

    t0 = time.time()
    r_stt = requests.post(
        f"{BACKEND_URL}/v1/audio/transcriptions",
        files={"file": ("test.wav", audio, "audio/mpeg")},
        timeout=30,
    )
    t1 = time.time()
    elapsed = t1 - t0
    stt_times.append(elapsed)
    transcribed = r_stt.json().get("text", "").strip()
    match = text.lower().replace(".", "").strip() in transcribed.lower().replace(".", "").strip()
    print(f"  [{'PASS' if match else 'WARN':4s}] STT run {i}: {elapsed:.3f}s, "
          f"transcribed={transcribed!r}")
    if not match:
        print(f"         expected: {text!r}")

print(f"  STT mean: {statistics.mean(stt_times):.3f}s  "
      f"min={min(stt_times):.3f}s  max={max(stt_times):.3f}s")

# ─────────────────────────────────────────────────────────
# 3. Hermes → Ollama LLM inference quality + latency (3 runs each)
# ─────────────────────────────────────────────────────────
print()
print("=" * 70)
print("  3. HERMES → OLLAMA LLM INFERENCE QUALITY + LATENCY (3 runs each)")
print("=" * 70)
print()

llm_prompts = [
    ("Say 'Hello' and nothing else.", "hello"),
    ("What is 2+3? Reply with just the number.", "5"),
    ("Name the capital of France in one word.", "paris"),
]

llm_ns_times = []
for i, (prompt, expected) in enumerate(llm_prompts, 1):
    t0 = time.time()
    r = requests.post(
        f"{HERMES_URL}/v1/chat/completions",
        headers={"Authorization": f"Bearer {HERMES_KEY}"},
        json={
            "model": "hermes-agent",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
            "stream": False,
        },
        timeout=60,
    )
    t1 = time.time()
    elapsed = t1 - t0
    llm_ns_times.append(elapsed)
    content = r.json()["choices"][0]["message"]["content"].strip().lower()
    usage = r.json().get("usage", {})
    match = expected in content
    print(f"  [{'PASS' if match else 'WARN':4s}] LLM non-stream run {i}: {elapsed:.3f}s, "
          f"tokens={usage.get('total_tokens', '?')}, "
          f"response={content!r}")
    if not match:
        print(f"         expected ~ {expected!r}, got {content!r}")

print(f"  LLM non-stream mean: {statistics.mean(llm_ns_times):.3f}s  "
      f"min={min(llm_ns_times):.3f}s  max={max(llm_ns_times):.3f}s")

# LLM streaming
print()
llm_stream_times = []
for i, (prompt, expected) in enumerate(llm_prompts, 1):
    t0 = time.time()
    r = requests.post(
        f"{HERMES_URL}/v1/chat/completions",
        headers={"Authorization": f"Bearer {HERMES_KEY}"},
        json={
            "model": "hermes-agent",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
            "stream": True,
        },
        timeout=60,
        stream=True,
    )
    chunks = 0
    full_content = ""
    for line in r.iter_lines():
        if line:
            chunks += 1
            try:
                import json
                data = json.loads(line.decode("utf-8").replace("data: ", "", 1))
                if "choices" in data and data["choices"][0].get("delta", {}).get("content"):
                    full_content += data["choices"][0]["delta"]["content"]
            except (json.JSONDecodeError, IndexError, KeyError):
                pass
    t1 = time.time()
    elapsed = t1 - t0
    llm_stream_times.append(elapsed)
    match = expected in full_content.strip().lower()
    print(f"  [{'PASS' if match else 'WARN':4s}] LLM stream run {i}: {elapsed:.3f}s, "
          f"chunks={chunks}, response={full_content.strip()!r}")
    if not match:
        print(f"         expected ~ {expected!r}, got {full_content.strip()!r}")

print(f"  LLM stream mean: {statistics.mean(llm_stream_times):.3f}s  "
      f"min={min(llm_stream_times):.3f}s  max={max(llm_stream_times):.3f}s")

# LLM context window test — send a longer conversation
print()
print("  3b. LLM CONTEXT WINDOW TEST (multi-turn conversation)")
print("  " + "-" * 68)

messages = [
    {"role": "system", "content": "You are a helpful assistant. Be concise."},
    {"role": "user", "content": "My name is Alice."},
    {"role": "assistant", "content": "Nice to meet you, Alice!"},
    {"role": "user", "content": "What is my name? Reply in one word."},
]

t0 = time.time()
r = requests.post(
    f"{HERMES_URL}/v1/chat/completions",
    headers={"Authorization": f"Bearer {HERMES_KEY}"},
    json={
        "model": "hermes-agent",
        "messages": messages,
        "max_tokens": 50,
        "stream": False,
    },
    timeout=60,
)
t1 = time.time()
content = r.json()["choices"][0]["message"]["content"].strip()
usage = r.json().get("usage", {})
elapsed = t1 - t0
match = "alice" in content.lower()
print(f"  [{'PASS' if match else 'WARN':4s}] Context test: {elapsed:.3f}s, "
      f"tokens={usage.get('total_tokens', '?')}, "
      f"response={content!r}")
print(f"         (Multi-turn context retention: {'PASS — model recalled Alice' if match else 'FAIL — model lost context'})")

# ─────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────
print()
print("=" * 70)
print("  SUMMARY")
print("=" * 70)
print()
print(f"  Server health:     {'ALL PASS' if all_healthy else 'SOME FAIL'}")
print(f"  TTS latency:       mean={statistics.mean(tts_times):.3f}s  "
      f"(min={min(tts_times):.3f}s max={max(tts_times):.3f}s)")
print(f"  STT latency:       mean={statistics.mean(stt_times):.3f}s  "
      f"(min={min(stt_times):.3f}s max={max(stt_times):.3f}s)")
print(f"  LLM non-stream:    mean={statistics.mean(llm_ns_times):.3f}s  "
      f"(min={min(llm_ns_times):.3f}s max={max(llm_ns_times):.3f}s)")
print(f"  LLM stream:        mean={statistics.mean(llm_stream_times):.3f}s  "
      f"(min={min(llm_stream_times):.3f}s max={max(llm_stream_times):.3f}s)")
print(f"  Context retention: {'PASS' if match else 'FAIL'}")
print()
print(f"  Total test time:   {sum(tts_times) + sum(stt_times) + sum(llm_ns_times) + sum(llm_stream_times):.1f}s")
print()
