"""Test streaming TTS endpoint."""
import requests
import time

text = "今天天气很好。"
print(f"Text: {text} ({len(text)} chars)")

t0 = time.time()
r = requests.post(
    "http://127.0.0.1:8890/tts/stream",
    json={"text": text, "language": "Auto", "speaker": "Serena"},
    timeout=90,
    stream=True,
)
t1 = time.time()
ct = r.headers.get("content-type", "?")
print(f"Stream response: {r.status_code} content-type={ct}")

# Read chunks
chunks = []
for chunk in r.iter_content(chunk_size=4096):
    if chunk:
        chunks.append(len(chunk))
t2 = time.time()
total_bytes = sum(chunks)
print(f"Total: {t2-t0:.2f}s, {len(chunks)} chunks, {total_bytes} bytes")
print(f"First response: {t1-t0:.2f}s, Full download: {t2-t0:.2f}s")

# Compare with non-streaming
print()
t0 = time.time()
r2 = requests.post(
    "http://127.0.0.1:8890/tts",
    json={"text": text, "language": "Auto", "speaker": "Serena"},
    timeout=90,
)
t1 = time.time()
print(f"Non-stream: {t1-t0:.2f}s, {len(r2.content)} bytes, status={r2.status_code}")
