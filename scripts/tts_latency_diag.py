"""TTS latency diagnostic — measures synthesis time for different text lengths."""
import requests
import time
import sys

TTS_URL = "http://127.0.0.1:8890/tts"

TESTS = [
    ("short-5", "你好世界。"),
    ("medium-15", "今天天气很好，我们一起去公园散步吧。"),
    ("medium-30", "这是一个比较长的句子，用来测试延迟表现和音频质量，看看会不会出现截断。"),
    ("long-60", "这是一个比较长的句子，用来测试Qwen3-TTS模型在处理较长文本时的延迟表现和音频质量，看看会不会出现截断或者中间丢失的情况，我们需要确保整个句子都能完整播放。"),
    ("multi-sentence", "你好。今天天气不错。我们一起出去玩吧。你觉得怎么样？"),
]

# Also test through the backend proxy
PROXY_URL = "http://127.0.0.1:6767/v1/audio/speech"

def test_direct(label, text):
    t0 = time.time()
    try:
        r = requests.post(TTS_URL, json={
            "text": text,
            "language": "Auto",
            "speaker": "Serena",
        }, timeout=90)
        t1 = time.time()
        dur = t1 - t0
        ct = r.headers.get("content-type", "?")
        print(f"[direct] {label:20s} ({len(text):3d} chars): {dur:5.2f}s  status={r.status_code}  bytes={len(r.content):8d}  ct={ct}")
        return dur, len(r.content)
    except Exception as e:
        t1 = time.time()
        print(f"[direct] {label:20s} ({len(text):3d} chars): FAIL  {t1-t0:.2f}s  {e}")
        return t1 - t0, 0

def test_proxy(label, text):
    t0 = time.time()
    try:
        r = requests.post(PROXY_URL, json={
            "input": text,
            "response_format": "wav",
        }, timeout=90)
        t1 = time.time()
        dur = t1 - t0
        ct = r.headers.get("content-type", "?")
        print(f"[proxy]  {label:20s} ({len(text):3d} chars): {dur:5.2f}s  status={r.status_code}  bytes={len(r.content):8d}  ct={ct}")
        return dur, len(r.content)
    except Exception as e:
        t1 = time.time()
        print(f"[proxy]  {label:20s} ({len(text):3d} chars): FAIL  {t1-t0:.2f}s  {e}")
        return t1 - t0, 0

def test_concurrent(n, text):
    """Test N concurrent requests to see if parallel synthesis works."""
    import concurrent.futures
    def one(i):
        t0 = time.time()
        r = requests.post(TTS_URL, json={
            "text": text,
            "language": "Auto",
            "speaker": "Serena",
        }, timeout=90)
        t1 = time.time()
        return t1 - t0, len(r.content)
    t0 = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=n) as pool:
        results = list(pool.map(one, range(n)))
    total = time.time() - t0
    times = [r[0] for r in results]
    print(f"[concurrent x{n}] ({len(text)} chars): total={total:.2f}s  individual={[f'{t:.2f}s' for t in times]}")
    return total

if __name__ == "__main__":
    print("=== TTS Latency Diagnostic ===")
    print()

    # Health check
    try:
        r = requests.get("http://127.0.0.1:8890/health", timeout=10)
        print(f"Health: {r.status_code} {r.text[:200]}")
    except Exception as e:
        print(f"Health: FAIL {e}")
        sys.exit(1)
    print()

    # Sequential tests (direct)
    print("--- Sequential (direct to :8890) ---")
    for label, text in TESTS:
        test_direct(label, text)
    print()

    # Sequential tests (through proxy)
    print("--- Sequential (through backend :6767) ---")
    for label, text in TESTS[:3]:
        test_proxy(label, text)
    print()

    # Concurrent test — 3 parallel requests (simulates pipeline)
    print("--- Concurrent (3 parallel, direct) ---")
    test_concurrent(3, "今天天气很好，我们一起去公园散步吧。")
    print()

    # Concurrent test — 6 parallel requests (max semaphore)
    print("--- Concurrent (6 parallel, direct) ---")
    test_concurrent(6, "今天天气很好，我们一起去公园散步吧。")
