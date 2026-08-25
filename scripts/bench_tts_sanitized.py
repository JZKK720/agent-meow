"""Benchmark TTS latency for sanitized Chinese punctuation.

Tests the sanitizeForTts output — after replacing hanging marks
(。→；, ：→；, ？→；, …→，, （）→strip, ""→strip, 【】→strip)
all TTS requests should complete in <1s instead of hanging 30s.
"""
import json
import time
import urllib.request

TTS_URL = "http://127.0.0.1:8891/v1/audio/speech"

# Simulate what sanitizeForTts produces AFTER the fix:
# 。 → ；, ： → ；, ？ → ；, … → ，, （） → strip, "" → strip, 【】 → strip
test_cases = [
    ("orig_period",     "\u4f60\u597d\u3002\u4e16\u754c",           # 你好。世界 — ORIGINAL (hangs)
     "raw"),
    ("fixed_period",    "\u4f60\u597d\uff1b\u4e16\u754c",           # 你好；世界 — FIXED
     "sanitized"),
    ("orig_colon",      "\u4f60\u597d\uff1a\u4e16\u754c",           # 你好：世界 — ORIGINAL (hangs)
     "raw"),
    ("fixed_colon",     "\u4f60\u597d\uff1b\u4e16\u754c",           # 你好；世界 — FIXED
     "sanitized"),
    ("orig_question",   "\u4f60\u597d\uff1f\u4e16\u754c",           # 你好？世界 — ORIGINAL (hangs)
     "raw"),
    ("fixed_question",  "\u4f60\u597d\uff1b\u4e16\u754c",           # 你好；世界 — FIXED
     "sanitized"),
    ("orig_ellipsis",   "\u4f60\u597d\u2026\u4e16\u754c",           # 你好…世界 — ORIGINAL (hangs)
     "raw"),
    ("fixed_ellipsis",  "\u4f60\u597d\uff0c\u4e16\u754c",           # 你好，世界 — FIXED
     "sanitized"),
    ("orig_paren",      "\u4f60\u597d\uff08\u4e16\u754c\uff09",     # 你好（世界） — ORIGINAL (hangs)
     "raw"),
    ("fixed_paren",     "\u4f60\u597d\u4e16\u754c",                 # 你好世界 — FIXED (parens stripped)
     "sanitized"),
    ("orig_quotes",     "\u4f60\u597d\u201c\u4e16\u754c\u201d",     # 你好"世界" — ORIGINAL (hangs)
     "raw"),
    ("fixed_quotes",    "\u4f60\u597d\u4e16\u754c",                 # 你好世界 — FIXED (quotes stripped)
     "sanitized"),
    ("orig_brackets",   "\u4f60\u597d\u3010\u4e16\u754c\u3011",     # 你好【世界】 — ORIGINAL (hangs)
     "raw"),
    ("fixed_brackets",  "\u4f60\u597d\u4e16\u754c",                 # 你好世界 — FIXED (brackets stripped)
     "sanitized"),
    # Full LLM-style sentence after sanitization:
    # Original: "你好！我是橘宝（MEOW），一只进化的橘子猫AI助手！"
    # After fix: "你好！我是橘宝MEOW，一只进化的橘子猫AI助手！"
    ("llm_style_fixed", "\u4f60\u597d\uff01\u6211\u662f\u6a58\u5b9dMEOW\uff0c\u4e00\u53ea\u8fdb\u5316\u7684\u6a58\u5b50\u732bAI\u52a9\u624b\uff01",
     "sanitized"),
]

print(f"{'Case':<20} {'Type':<12} {'Time':>6} {'Bytes':>8}")
print("-" * 55)

for name, text, ptype in test_cases:
    body = json.dumps({
        "input": text,
        "voice": "Serena",
        "response_format": "wav",
        "temperature": 0,
    }).encode()
    req = urllib.request.Request(TTS_URL, data=body, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        resp = urllib.request.urlopen(req, timeout=10)  # 10s timeout — was 30s
        audio = resp.read()
        elapsed = time.time() - t0
        print(f"{name:<20} {ptype:<12} {elapsed:>5.2f}s {len(audio):>8}")
    except Exception as e:
        elapsed = time.time() - t0
        status = "HANG" if elapsed > 8 else "ERR"
        print(f"{name:<20} {ptype:<12} {elapsed:>5.2f}s {status:>8}  — {type(e).__name__}")
    time.sleep(0.3)