"""Benchmark TTS latency for different Chinese punctuation types.

Measures synthesis time for identical Chinese text with different
punctuation marks to identify which marks cause the longest pauses.
"""
import json
import time
import urllib.request

TTS_URL = "http://127.0.0.1:8891/v1/audio/speech"

test_cases = [
    ("baseline", "你好世界"),                    # No punctuation
    ("comma_cn", "你好，世界"),                  # Chinese comma
    ("period_cn", "你好。世界"),                # Chinese period
    ("semicolon", "你好；世界"),                # Chinese semicolon
    ("colon", "你好：世界"),                     # Chinese colon
    ("exclaim", "你好！世界"),                   # Chinese exclamation
    ("question", "你好？世界"),                  # Chinese question
    ("emdash", "你好——世界"),                   # Em-dash (double)
    ("ellipsis", "你好…世界"),                  # Ellipsis
    ("paren", "你好（世界）"),                  # Parentheses
    ("quotes", "你好\u201c世界\u201d"),          # Smart quotes
    ("brackets", "你好【世界】"),                # Square brackets
    ("book_title", "你好《世界》"),              # Book title marks
    ("mixed_heavy", "你好——世界；你好：你好（世界）"),  # Mixed heavy
    ("multi_exclaim", "你好！！！世界"),         # Multiple exclamations
    ("multi_ellipsis", "你好……世界"),           # Multiple ellipsis
]

print(f"{'Case':<18} {'Time':>6} {'Bytes':>8}  Text")
print("-" * 70)

for name, text in test_cases:
    body = json.dumps({
        "input": text,
        "voice": "Serena",
        "response_format": "wav",
        "temperature": 0,
    }).encode()
    req = urllib.request.Request(TTS_URL, data=body, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        audio = resp.read()
        elapsed = time.time() - t0
        print(f"{name:<18} {elapsed:>5.2f}s {len(audio):>8}  {text}")
    except Exception as e:
        elapsed = time.time() - t0
        print(f"{name:<18} {elapsed:>5.2f}s ERROR     {text}  — {e}")
    time.sleep(0.3)