"""Test LLM latency and check available models."""
import requests
import time

# Test current LLM latency
print("=== LLM Latency Test ===")
t0 = time.time()
r = requests.post('http://127.0.0.1:6767/v1/chat/completions', json={
    'model': 'qwen',
    'messages': [{'role': 'user', 'content': 'hi'}],
    'max_tokens': 10
}, timeout=120)
t1 = time.time()
print(f"LLM (current): {r.status_code} ({t1-t0:.2f}s)")
if r.status_code == 200:
    content = r.json()["choices"][0]["message"]["content"]
    print(f"  Response: {content[:100]}")
else:
    print(f"  Error: {r.text[:200]}")

# Check what models Ollama has
print()
print("=== Ollama Models ===")
try:
    r = requests.get('http://127.0.0.1:11434/api/tags', timeout=10)
    if r.status_code == 200:
        for m in r.json().get("models", []):
            name = m.get("name", "?")
            size = m.get("size", 0) / 1024 / 1024 / 1024
            print(f"  {name}: {size:.1f} GB")
except Exception as e:
    print(f"  Ollama: {e}")

# Check Hermes config for cloud model options
print()
print("=== Hermes Config (model section) ===")
r = requests.get('http://127.0.0.1:8642/health', timeout=10)
print(f"Hermes health: {r.status_code}")

# Test TTS latency
print()
print("=== TTS Latency Test ===")
t0 = time.time()
r = requests.post('http://127.0.0.1:8890/tts', json={
    'text': '你好世界。',
    'language': 'Auto',
    'speaker': 'Serena',
}, timeout=90)
t1 = time.time()
print(f"TTS 1.7B: {r.status_code} ({t1-t0:.2f}s) {len(r.content)} bytes")

# Test TTS with medium sentence
t0 = time.time()
r = requests.post('http://127.0.0.1:8890/tts', json={
    'text': '今天天气很好，我们一起去公园散步吧。',
    'language': 'Auto',
    'speaker': 'Serena',
}, timeout=90)
t1 = time.time()
print(f"TTS medium: {r.status_code} ({t1-t0:.2f}s) {len(r.content)} bytes")
