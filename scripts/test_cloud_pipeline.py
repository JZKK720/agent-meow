"""Test full voice pipeline with cloud model."""
import requests
import time
import struct
import io

print("=== Voice Pipeline Test (Cloud Model) ===")
print()

# 1. Service health
for name, url in [
    ("Hermes", "http://127.0.0.1:8642/health"),
    ("Backend", "http://127.0.0.1:6767/health"),
    ("TTS 1.7B", "http://127.0.0.1:8890/health"),
]:
    try:
        r = requests.get(url, timeout=10)
        print(f"  {name}: {r.status_code}")
    except Exception as e:
        print(f"  {name}: FAIL {type(e).__name__}")
print()

# 2. LLM test (cloud model via backend proxy)
t0 = time.time()
r = requests.post('http://127.0.0.1:6767/v1/chat/completions', json={
    'model': 'qwen',
    'messages': [
        {'role': 'system', 'content': '你是橘宝，一只活泼可爱的AI猫咪助手。回答简洁有趣。不要用emoji或特殊符号。'},
        {'role': 'user', 'content': '你好'}
    ],
    'max_tokens': 50
}, timeout=60)
t1 = time.time()
print(f"LLM (cloud): {r.status_code} ({t1-t0:.2f}s)")
if r.status_code == 200:
    content = r.json()["choices"][0]["message"]["content"]
    print(f"  Response: {content[:150]}")
print()

# 3. STT test
buf = io.BytesIO()
buf.write(b'RIFF'); buf.write(struct.pack('<I', 36+3200)); buf.write(b'WAVEfmt ')
buf.write(struct.pack('<IHHIIHH', 16, 1, 1, 16000, 32000, 2, 16))
buf.write(b'data'); buf.write(struct.pack('<I', 3200)); buf.write(b'\x00'*3200)
buf.seek(0)
r = requests.post('http://127.0.0.1:6767/v1/audio/transcriptions', files={'file': ('test.wav', buf, 'audio/wav')}, timeout=30)
print(f"STT: {r.status_code}")
print()

# 4. TTS test
t0 = time.time()
r = requests.post('http://127.0.0.1:6767/v1/audio/speech', json={
    'text': '你好世界。',
    'language': 'Auto',
    'speaker': 'Serena',
}, timeout=90)
t1 = time.time()
print(f"TTS 1.7B: {r.status_code} ({t1-t0:.2f}s) {len(r.content)} bytes")
print()

# 5. TTS streaming test
t0 = time.time()
r = requests.post('http://127.0.0.1:6767/v1/audio/speech/stream', json={
    'text': '你好世界。',
    'language': 'Auto',
    'speaker': 'Serena',
}, timeout=90, stream=True)
chunks = [c for c in r.iter_content(4096) if c]
t1 = time.time()
print(f"TTS stream: {r.status_code} ({t1-t0:.2f}s) {len(chunks)} chunks, {sum(len(c) for c in chunks)} bytes")

print()
print("=== Done ===")
