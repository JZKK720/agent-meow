"""Full E2E voice pipeline smoke test — tests the complete STT→LLM→TTS chain
through the agent-meow server proxy (:6767), which is the actual path the
browser SPA uses.

Tests:
  1. Health + stack status
  2. STT: server /v1/audio/transcriptions (proxy → whisper-server)
  3. LLM: server /v1/chat/completions NON-stream (proxy → Hermes)
  4. LLM: server /v1/chat/completions SSE STREAM (proxy → Hermes)
  5. TTS: server /v1/audio/speech (proxy → Qwen3-TTS or Edge)
  6. Full chain: TTS → STT round-trip (generate audio, transcribe it back)
  7. Session create + turn (voice-style flow)
"""
import urllib.request
import urllib.error
import json
import io
import struct
import time
import sys

SERVER = "http://127.0.0.1:6767"
HERMES_KEY = "28765d337208aa3c0b6671cb1969e8cad9c22d7b7967b216"  # from web/.env
results = []


def _req(url, method="GET", body=None, headers=None, timeout=30):
    """Make an HTTP request and return (status, body_bytes, parsed_json_or_None)."""
    req = urllib.request.Request(url, data=body, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
        data = r.read()
        try:
            return r.status, data, json.loads(data)
        except (json.JSONDecodeError, ValueError):
            return r.status, data, None
    except urllib.error.HTTPError as e:
        return e.code, e.read(), None
    except Exception as e:
        return -1, str(e).encode(), None


def _wav_header(sample_rate=16000, n_samples=0):
    """Build a minimal WAV header for PCM S16 mono."""
    return (
        b"RIFF" + struct.pack("<I", 36 + n_samples * 2) + b"WAVE" +
        b"fmt " + struct.pack("<IHHIIHH", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16) +
        b"data" + struct.pack("<I", n_samples * 2)
    )


# ── 1. Health + stack status ──────────────────────────────────────────────
print("=== 1. Health + stack status ===", flush=True)
st, body, data = _req(f"{SERVER}/health")
print(f"  /health: {st} {data}", flush=True)
results.append(("health", st == 200, str(data)))

st, body, data = _req(f"{SERVER}/v1/stack/status")
if data:
    hermes = data.get("hermes", {}).get("status", "?")
    tts = data.get("tts", {}).get("status", "?")
    stt = data.get("whisper_stt", {}).get("status", "?")
    print(f"  stack: hermes={hermes} stt={stt} tts={tts}", flush=True)
    results.append(("stack", st == 200, f"hermes={hermes} stt={stt} tts={tts}"))
else:
    print(f"  stack: {st} (no json)", flush=True)
    results.append(("stack", st == 200, f"{st}"))

# ── 2. STT: server proxy → whisper ───────────────────────────────────────
print("\n=== 2. STT (server /v1/audio/transcriptions → whisper) ===", flush=True)
# Create 1s of 440Hz tone (will transcribe as silence or a sound — proves the path works)
sr = 16000
n = sr
frames = b""
for i in range(n):
    s = int(32767 * 0.3 * __import__("math").sin(2 * 3.14159 * 440 * i / sr))
    frames += struct.pack("<h", s)
wav = _wav_header(sr, n) + frames
boundary = "----V2"
body = (
    b"--" + boundary.encode() + b"\r\n"
    b'Content-Disposition: form-data; name="file"; filename="test.wav"\r\n'
    b"Content-Type: audio/wav\r\n\r\n" + wav + b"\r\n"
    b"--" + boundary.encode() + b"\r\n"
    b'Content-Disposition: form-data; name="language"\r\n\r\n'
    b"zh\r\n"
    b"--" + boundary.encode() + b"--\r\n"
)
st, body, data = _req(
    f"{SERVER}/v1/audio/transcriptions",
    method="POST",
    body=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    timeout=30,
)
text = data.get("text", "") if data else body.decode("utf-8", errors="replace")[:80]
print(f"  STT: {st} text='{text[:80]}'", flush=True)
results.append(("STT", st == 200, f"text='{text[:60]}'"))

# ── 3. LLM: server /v1/chat/completions (non-stream) ─────────────────────
print("\n=== 3. LLM (server /v1/chat/completions, non-stream) ===", flush=True)
t0 = time.time()
llm_body = json.dumps({
    "model": "hermes-agent",
    "messages": [{"role": "user", "content": "say hello in Chinese"}],
    "stream": False,
    "max_tokens": 20,
}).encode()
st, body, data = _req(
    f"{SERVER}/v1/chat/completions",
    method="POST",
    body=llm_body,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {HERMES_KEY}"},
    timeout=60,
)
elapsed = time.time() - t0
if data and "choices" in data:
    content = data["choices"][0].get("message", {}).get("content", "")
    print(f"  LLM: {st} ({elapsed:.2f}s) content='{content[:80]}'", flush=True)
    results.append(("LLM", st == 200, f"({elapsed:.2f}s) '{content[:60]}'"))
else:
    txt = body.decode("utf-8", errors="replace")[:120] if body else ""
    print(f"  LLM: {st} ({elapsed:.2f}s) {txt}", flush=True)
    results.append(("LLM", st == 200, f"({elapsed:.2f}s) {txt[:60]}"))

# ── 4. LLM: server /v1/chat/completions (SSE STREAM) ─────────────────────
print("\n=== 4. LLM (server /v1/chat/completions, SSE stream) ===", flush=True)
t0 = time.time()
stream_body = json.dumps({
    "model": "hermes-agent",
    "messages": [{"role": "user", "content": "say okay in Chinese"}],
    "stream": True,
    "max_tokens": 20,
}).encode()
req = urllib.request.Request(
    f"{SERVER}/v1/chat/completions",
    data=stream_body,
    method="POST",
)
req.add_header("Content-Type", "application/json")
req.add_header("Authorization", f"Bearer {HERMES_KEY}")
chunks = []
try:
    r = urllib.request.urlopen(req, timeout=60)
    for line in r:
        line = line.decode("utf-8", errors="replace").strip()
        if not line.startswith("data: "):
            continue
        payload = line[6:]
        if payload.startswith("["):
            break  # SSE done sentinel
        try:
            j = json.loads(payload)
            delta = j.get("choices", [{}])[0].get("delta", {}).get("content", "")
            if delta:
                chunks.append(delta)
        except (json.JSONDecodeError, IndexError, KeyError):
            pass
    elapsed = time.time() - t0
    full = "".join(chunks)
    print(f"  SSE: {r.status} ({elapsed:.2f}s) chunks={len(chunks)} content='{full[:80]}'", flush=True)
    results.append(("SSE-LLM", len(chunks) > 0, f"({elapsed:.2f}s) {len(chunks)} chunks '{full[:60]}'"))
except Exception as e:
    elapsed = time.time() - t0
    print(f"  SSE: ERR ({elapsed:.2f}s) {e}", flush=True)
    results.append(("SSE-LLM", False, str(e)))

# ── 5. TTS: server /v1/audio/speech ──────────────────────────────────────
print("\n=== 5. TTS (server /v1/audio/speech → Qwen3) ===", flush=True)
tts_body = json.dumps({
    "input": "你好，这是一个语音测试。",
    "voice": "serena",
}).encode()
t0 = time.time()
st, body, data = _req(
    f"{SERVER}/v1/audio/speech",
    method="POST",
    body=tts_body,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {HERMES_KEY}"},
    timeout=90,
)
elapsed = time.time() - t0
if st == 200 and body:
    # Parse WAV header to get duration
    if len(body) > 44 and body[:4] == b"RIFF":
        sr_tts = struct.unpack("<I", body[24:28])[0]
        data_size = struct.unpack("<I", body[40:44])[0]
        dur = data_size / (sr_tts * 2) if sr_tts > 0 else 0
        rtf = elapsed / dur if dur > 0 else 0
        print(f"  TTS: {st} ({elapsed:.2f}s) {len(body)}B dur={dur:.2f}s RTF={rtf:.2f}", flush=True)
        results.append(("TTS", True, f"({elapsed:.2f}s) {len(body)}B dur={dur:.2f}s RTF={rtf:.2f}"))
    else:
        print(f"  TTS: {st} ({elapsed:.2f}s) {len(body)}B (not WAV)", flush=True)
        results.append(("TTS", st == 200, f"({elapsed:.2f}s) {len(body)}B"))
else:
    print(f"  TTS: {st} ({elapsed:.2f}s) {body[:80] if body else b''}", flush=True)
    results.append(("TTS", st == 200, f"({elapsed:.2f}s) {st}"))

# ── 6. Full chain: TTS → STT round-trip ──────────────────────────────────
print("\n=== 6. Full chain: TTS → STT round-trip ===", flush=True)
if st == 200 and body and len(body) > 44:
    # Take the TTS output and feed it back through STT
    boundary2 = "----V3"
    stt2_body = (
        b"--" + boundary2.encode() + b"\r\n"
        b'Content-Disposition: form-data; name="file"; filename="tts_out.wav"\r\n'
        b"Content-Type: audio/wav\r\n\r\n" + body + b"\r\n"
        b"--" + boundary2.encode() + b"\r\n"
        b'Content-Disposition: form-data; name="language"\r\n\r\n'
        b"zh\r\n"
        b"--" + boundary2.encode() + b"--\r\n"
    )
    st2, body2, data2 = _req(
        f"{SERVER}/v1/audio/transcriptions",
        method="POST",
        body=stt2_body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary2}"},
        timeout=30,
    )
    text2 = data2.get("text", "") if data2 else ""
    print(f"  Round-trip: STT={st2} text='{text2[:80]}'", flush=True)
    results.append(("TTS→STT", st2 == 200, f"text='{text2[:60]}'"))
else:
    print("  Skipped (no TTS audio to round-trip)", flush=True)
    results.append(("TTS→STT", False, "skipped"))

# ── 7. Session create + turn (voice-style flow) ──────────────────────────
print("\n=== 7. Session create + LLM turn ===", flush=True)
sess_body = json.dumps({"agent": "hermes-gateway"}).encode()
st, body, data = _req(
    f"{SERVER}/v1/sessions",
    method="POST",
    body=sess_body,
    headers={"Content-Type": "application/json", "Authorization": f"Bearer {HERMES_KEY}"},
    timeout=10,
)
if st == 200 and data:
    sid = data.get("id", "")
    print(f"  Session: {st} id={sid[:16]}...", flush=True)
    # Send a turn
    turn_body = json.dumps({
        "type": "message",
        "role": "user",
        "content": [{"type": "input_text", "text": "你好"}],
    }).encode()
    st3, body3, data3 = _req(
        f"{SERVER}/v1/sessions/{sid}/turns",
        method="POST",
        body=turn_body,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {HERMES_KEY}"},
        timeout=60,
    )
    if data3:
        print(f"  Turn: {st3} keys={list(data3.keys())[:5]}", flush=True)
    else:
        print(f"  Turn: {st3}", flush=True)
    results.append(("Session+Turn", st3 == 200, f"session={sid[:12]} turn={st3}"))
else:
    print(f"  Session: {st} (skipping turn)", flush=True)
    results.append(("Session+Turn", st == 200, f"create={st}"))

# ── Summary ─────────────────────────────────────────────────────────────
print("\n" + "=" * 60, flush=True)
print("=== E2E VOICE PIPELINE SMOKE TEST SUMMARY ===", flush=True)
print("=" * 60, flush=True)
all_ok = True
for name, ok, detail in results:
    status = "✅" if ok else "❌"
    print(f"  {status} {name:20s}: {detail}", flush=True)
    if not ok:
        all_ok = False
print(f"\n{'ALL PASS ✅' if all_ok else 'SOME FAILED ❌'}", flush=True)
sys.exit(0 if all_ok else 1)
