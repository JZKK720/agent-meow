"""Round-trip: TTS a Chinese sentence, then STT it back and check the transcript is CJK."""
import json
import urllib.request

KEY = ""
with open(r"C:\Users\1\github-pr\agent-meow\web\.env", encoding="utf-8") as f:
    for line in f:
        if line.startswith("VITE_HERMES_API_KEY="):
            KEY = line.split("=", 1)[1].strip()

SENTENCE = "今天天气很好，我们一起去公园散步吧。"

# 1. TTS the sentence via the voice proxy (Qwen3-TTS).
req = urllib.request.Request(
    "http://127.0.0.1:6767/v1/audio/speech",
    data=json.dumps({"text": SENTENCE}).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req, timeout=120) as r:
    wav = r.read()
print(f"[TTS] {r.status} {len(wav)} bytes")

# 2. STT it back via Hermes batch endpoint (no language field — server config decides).
import uuid

boundary = uuid.uuid4().hex
parts = []
parts.append(
    f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.wav"\r\n'
    f"Content-Type: audio/wav\r\n\r\n".encode()
)
body = b"".join(parts) + wav + f"\r\n--{boundary}--\r\n".encode()
req2 = urllib.request.Request(
    "http://127.0.0.1:8642/v1/audio/transcriptions",
    data=body,
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {KEY}",
    },
    method="POST",
)
with urllib.request.urlopen(req2, timeout=120) as r2:
    result = json.loads(r2.read())
text = result.get("text", "")
print(f"[STT] {r2.status} text={text!r}")
has_cjk = any("\u4e00" <= c <= "\u9fff" for c in text)
print("[RESULT]", "PASS — Chinese decoded" if has_cjk else "FAIL — no CJK in transcript")
