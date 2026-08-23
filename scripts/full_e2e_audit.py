"""Full E2E audit — gstack + karpathy + voice pipeline verification."""
import requests
import time
import struct
import io
import soundfile as sf

print("=== FULL E2E AUDIT ===")
print()

# 1. Service health
print("1. Service Health:")
services = [
    ("Hermes Gateway", "http://127.0.0.1:8642/health"),
    ("Backend", "http://127.0.0.1:6767/health"),
    ("PyTorch TTS (old)", "http://127.0.0.1:8890/health"),
    ("qwentts server", "http://127.0.0.1:8891/v1/models"),
    ("qwentts wrapper", "http://127.0.0.1:8892/health"),
]
for name, url in services:
    try:
        r = requests.get(url, timeout=10)
        print(f"  {name:25s}: {r.status_code}")
    except Exception as e:
        print(f"  {name:25s}: FAIL {type(e).__name__}")
print()

# 2. STT test
print("2. STT:")
buf = io.BytesIO()
buf.write(b"RIFF"); buf.write(struct.pack("<I", 36+3200)); buf.write(b"WAVEfmt ")
buf.write(struct.pack("<IHHIIHH", 16, 1, 1, 16000, 32000, 2, 16))
buf.write(b"data"); buf.write(struct.pack("<I", 3200)); buf.write(b"\x00"*3200)
buf.seek(0)
r = requests.post("http://127.0.0.1:6767/v1/audio/transcriptions", files={"file": ("test.wav", buf, "audio/wav")}, timeout=30)
print(f"  STT: {r.status_code} {r.text[:80]}")
print()

# 3. LLM test (cloud model)
print("3. LLM (cloud deepseek-v4-flash):")
t0 = time.time()
r = requests.post("http://127.0.0.1:6767/v1/chat/completions", json={
    "model": "qwen",
    "messages": [{"role": "user", "content": "hi"}],
    "max_tokens": 10
}, timeout=60)
t1 = time.time()
print(f"  LLM: {r.status_code} ({t1-t0:.2f}s)")
print()

# 4. TTS test (qwentts Vulkan via wrapper)
print("4. TTS (qwentts.cpp Vulkan):")
t0 = time.time()
r = requests.post("http://127.0.0.1:6767/v1/audio/speech", json={
    "text": "你好世界。",
    "language": "Auto",
    "speaker": "Serena",
}, timeout=60)
t1 = time.time()
if r.status_code == 200:
    audio, sr = sf.read(io.BytesIO(r.content))
    dur = len(audio) / sr
    rtf = (t1-t0) / dur if dur > 0 else 0
    print(f"  TTS: {r.status_code} ({t1-t0:.2f}s) audio={dur:.2f}s RTF={rtf:.2f}")
else:
    print(f"  TTS: {r.status_code} {r.text[:100]}")
print()

# 5. TTS medium text
print("5. TTS medium (18 chars):")
t0 = time.time()
r = requests.post("http://127.0.0.1:6767/v1/audio/speech", json={
    "text": "今天天气很好，我们一起去公园散步吧。",
    "language": "Auto",
    "speaker": "Serena",
}, timeout=60)
t1 = time.time()
if r.status_code == 200:
    audio, sr = sf.read(io.BytesIO(r.content))
    dur = len(audio) / sr
    rtf = (t1-t0) / dur if dur > 0 else 0
    print(f"  TTS: {r.status_code} ({t1-t0:.2f}s) audio={dur:.2f}s RTF={rtf:.2f}")
print()

# 6. SPA check (no conflict markers)
print("6. SPA check:")
r = requests.get("http://127.0.0.1:6767/", timeout=10)
has_conflicts = "<<<<<<<" in r.text or "=======" in r.text[:1000]
print(f"  SPA: {r.status_code} conflict_markers={has_conflicts}")
print()

print("=== AUDIT COMPLETE ===")
