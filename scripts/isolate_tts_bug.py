"""Isolate which character/punctuation in ZH text causes the 7.8MB/46s TTS bug."""
import requests
import time
import json

TTS_URL = "http://127.0.0.1:8891/v1/audio/speech"

def test_tts(text, label=None):
    body = {"input": text, "voice": "Serena", "response_format": "wav", "temperature": 0}
    t0 = time.time()
    try:
        r = requests.post(TTS_URL, json=body, timeout=120)
        t1 = time.time()
        size = len(r.content)
        dur = t1 - t0
        status = "OK" if size < 500000 else "HUGE"
        lbl = label or text[:30]
        print(f"  [{status:4}] {lbl:40} {r.status_code} {size:>10}b {dur:6.2f}s")
        return size, dur
    except Exception as e:
        t1 = time.time()
        print(f"  [FAIL] {label or text[:30]:40} {t1-t0:.2f}s {e}")
        return 0, t1 - t0

# Test individual characters and combinations
tests = [
    ("你好", "just 你好"),
    ("你好。", "你好 + 。(U+3002)"),
    ("你好，", "你好 + ，(U+FF0C)"),
    ("你好测试", "你好测试 no punct"),
    ("你好，测试", "你好，测试 with comma"),
    ("你好。测试", "你好。测试 with period"),
    ("你好，这是一个测试", "full 9ch with comma"),
    ("你好这是一个测试", "9ch no punct"),
    ("你好 这是一个测试", "9ch with space"),
    ("Hello, this is a test.", "EN equivalent"),
    ("你好呀", "3ch 你好呀"),
    ("你好呀！", "4ch with ！"),
    ("这是一个测试", "6ch no punct"),
    ("这是一个测试。", "7ch with 。"),
    ("测试", "2ch 测试"),
    ("测试。", "3ch 测试。"),
]

print("=== TTS Character Isolation Test ===")
print(f"  Testing {len(tests)} variants against :8891")
print()

for text, label in tests:
    test_tts(text, label)