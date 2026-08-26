"""Debug LLM encoding: is the mojibake UTF-8-as-GBK or GBK-as-UTF-8?"""
from __future__ import annotations

import json
import os
import requests

BASE = "http://127.0.0.1:6767"
KEY = os.environ.get("HERMES_API_KEY", "")
headers = {"Authorization": f"Bearer {KEY}"}

body = {"model": "auto", "messages": [{"role": "user", "content": "你好"}], "max_tokens": 50, "stream": False}
r = requests.post(f"{BASE}/v1/chat/completions", json=body, headers=headers, timeout=30)

# Check response encoding
print(f"Response encoding: {r.encoding}")
ct = r.headers.get("content-type", "")
print(f"Content-Type: {ct}")
print(f"Apparent encoding: {r.apparent_encoding}")

# Get raw bytes
raw = r.content
print(f"Raw bytes (first 300 hex): {raw[:300].hex()}")

# Parse as UTF-8 (requests does this automatically)
text = r.text
j = json.loads(text)
reply = j["choices"][0]["message"]["content"]
print(f"\nUTF-8 reply (mojibake): {reply[:100]}")
print(f"Reply codepoints (first 20): {[hex(ord(c)) for c in reply[:20]]}")

# Hypothesis 1: The text is valid UTF-8 Chinese, but encoded as GBK bytes
# that were then decoded as UTF-8. So: UTF-8 bytes -> interpreted as GBK -> re-encoded as UTF-8
# To reverse: encode the mojibake as UTF-8, decode as GBK
try:
    reply_bytes_utf8 = reply.encode("utf-8")
    reply_decoded_gbk = reply_bytes_utf8.decode("gbk")
    print(f"\nHypothesis 1 (UTF-8 bytes -> GBK): {reply_decoded_gbk[:100]}")
except Exception as e:
    print(f"\nHypothesis 1 failed: {e}")

# Hypothesis 2: The text is GBK bytes that were decoded as UTF-8
# (latin-1 round-trip to get the original bytes)
try:
    reply_bytes_latin1 = reply.encode("latin-1")
    reply_decoded_gbk = reply_bytes_latin1.decode("gbk")
    print(f"Hypothesis 2 (latin-1 -> GBK): {reply_decoded_gbk[:100]}")
except Exception as e:
    print(f"Hypothesis 2 failed: {e}")

# Hypothesis 3: The text is valid UTF-8 Chinese that looks like mojibake
# because the model actually generates these characters
try:
    reply_bytes_utf8 = reply.encode("utf-8")
    reply_redecoded_utf8 = reply_bytes_utf8.decode("utf-8")
    print(f"\nRoundtrip UTF-8: {reply_redecoded_utf8[:100]}")
    # Check if these are real Chinese characters in a different range
    for c in reply[:10]:
        print(f"  {c} = U+{ord(c):04X} ({'CJK' if 0x4E00 <= ord(c) <= 0x9FFF else 'other'})")
except Exception as e:
    print(f"Roundtrip failed: {e}")

# Check what the raw JSON bytes look like around the content field
# Find the content field in the raw bytes
content_marker = b'"content":"'
idx = raw.find(content_marker)
if idx >= 0:
    snippet = raw[idx + len(content_marker) : idx + len(content_marker) + 100]
    print(f"\nRaw content bytes (hex): {snippet.hex()}")
    # Try decoding these as GBK directly
    try:
        gbk_decoded = snippet.decode("gbk")
        print(f"Raw bytes as GBK: {gbk_decoded[:80]}")
    except Exception as e:
        print(f"Raw bytes GBK decode: {e}")
    # Try as UTF-8
    try:
        utf8_decoded = snippet.decode("utf-8")
        print(f"Raw bytes as UTF-8: {utf8_decoded[:80]}")
    except Exception as e:
        print(f"Raw bytes UTF-8 decode: {e}")