"""E2E voice pipeline validation — tests all 5 services end-to-end."""
import urllib.request
import json
import io
import struct
import wave
import math
import sys

results = []

# 1. STT: create a WAV with 1s of 440Hz tone, transcribe
print("=== 1. STT (whisper-server :8001) ===", flush=True)
sr = 16000
n = int(sr * 1.0)
buf = io.BytesIO()
with wave.open(buf, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    frames = b""
    for i in range(n):
        s = int(math.sin(2 * math.pi * 440 * i / sr) * 16000)
        frames += struct.pack("<h", s)
    w.writeframes(frames)
wav = buf.getvalue()
boundary = "----B"
body = (
    b"--" + boundary.encode() + b"\r\n"
    b'Content-Disposition: form-data; name="file"; filename="t.wav"\r\n'
    b"Content-Type: audio/wav\r\n\r\n" + wav + b"\r\n"
    b"--" + boundary.encode() + b"\r\n"
    b'Content-Disposition: form-data; name="language"\r\n\r\n'
    b"zh\r\n"
    b"--" + boundary.encode() + b"--\r\n"
)
req = urllib.request.Request("http://127.0.0.1:8001/inference", data=body, method="POST")
req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
try:
    r = urllib.request.urlopen(req, timeout=15)
    text = json.loads(r.read()).get("text", "")
    print(f"  OK: {r.status} text='{text[:80]}'", flush=True)
    results.append(("STT", True, text[:80]))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("STT", False, str(e)))

# 2. TTS via Hermes Edge TTS (zh-CN-XiaoxiaoNeural) + Qwen3 fallback
print("\n=== 2. TTS (Edge :8642 → Qwen3 :8891) ===", flush=True)
key = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
# Edge TTS primary
body_edge = json.dumps({"input": "你好世界", "voice": "zh-CN-XiaoxiaoNeural"}).encode()
req3 = urllib.request.Request(
    "http://127.0.0.1:8642/v1/audio/speech", data=body_edge, method="POST"
)
req3.add_header("Content-Type", "application/json")
req3.add_header("Authorization", f"Bearer {key}")
try:
    r = urllib.request.urlopen(req3, timeout=15)
    d = r.read()
    print(f"  Edge TTS: {r.status} {len(d)} bytes", flush=True)
    results.append(("Edge TTS", len(d) > 0, f"{len(d)} bytes"))
except Exception as e:
    print(f"  Edge TTS ERR: {e}", flush=True)
    results.append(("Edge TTS", False, str(e)))

# Qwen3-TTS fallback
body_qwen = json.dumps({"input": "你好世界", "voice": "Serena"}).encode()
req3b = urllib.request.Request(
    "http://127.0.0.1:8891/v1/audio/speech", data=body_qwen, method="POST"
)
req3b.add_header("Content-Type", "application/json")
try:
    r = urllib.request.urlopen(req3b, timeout=15)
    d = r.read()
    print(f"  Qwen3 TTS: {r.status} {len(d)} bytes", flush=True)
    results.append(("Qwen3 TTS", len(d) > 0, f"{len(d)} bytes"))
except Exception as e:
    print(f"  Qwen3 TTS ERR: {e}", flush=True)
    results.append(("Qwen3 TTS", False, str(e)))

# 3. Server health
print("\n=== 3. Server (agent-meow :6767) ===", flush=True)
try:
    r = urllib.request.urlopen("http://127.0.0.1:6767/health", timeout=5)
    print(f"  OK: {r.status}", flush=True)
    results.append(("Server", True, str(r.status)))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("Server", False, str(e)))

# 4. Host
print("\n=== 4. Host ===", flush=True)
try:
    r = urllib.request.urlopen("http://127.0.0.1:6767/v1/hosts", timeout=5)
    hosts = json.loads(r.read())["hosts"]
    for h in hosts:
        print(f"  {h['name']}: {h['status']}", flush=True)
    results.append(("Host", h["status"] == "online", h["status"]))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("Host", False, str(e)))

# 5. OpenAPI
print("\n=== 5. OpenAPI ===", flush=True)
try:
    r = urllib.request.urlopen("http://127.0.0.1:6767/openapi.json", timeout=10)
    size = len(r.read())
    print(f"  OK: {r.status} {size} bytes", flush=True)
    results.append(("OpenAPI", True, f"{size} bytes"))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("OpenAPI", False, str(e)))

# 6. Hermes
print("\n=== 6. Hermes (:8642) ===", flush=True)
try:
    r = urllib.request.urlopen("http://127.0.0.1:8642/health", timeout=5)
    data = json.loads(r.read())
    print(f"  OK: {r.status} {data}", flush=True)
    results.append(("Hermes", True, str(data)))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("Hermes", False, str(e)))

# 7. Ollama
print("\n=== 7. Ollama (:11434) ===", flush=True)
try:
    r = urllib.request.urlopen("http://127.0.0.1:11434/api/tags", timeout=5)
    models = json.loads(r.read())["models"]
    print(f"  OK: {len(models)} models", flush=True)
    results.append(("Ollama", True, f"{len(models)} models"))
except Exception as e:
    print(f"  ERR: {e}", flush=True)
    results.append(("Ollama", False, str(e)))

# Summary
print("\n=== E2E Summary ===", flush=True)
all_ok = True
for name, ok, detail in results:
    status = "✅" if ok else "❌"
    print(f"  {status} {name}: {detail}", flush=True)
    if not ok:
        all_ok = False
print(f"\n{'ALL PASS ✅' if all_ok else 'SOME FAILED ❌'}", flush=True)
sys.exit(0 if all_ok else 1)
