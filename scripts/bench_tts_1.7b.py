"""Benchmark 1.7B model with greedy decoding — compare to 0.6B baseline."""
import requests
import time
import io
import soundfile as sf

TTS_URL = "http://127.0.0.1:8890/tts"

TESTS = [
    ("short-5", "你好世界。"),
    ("medium-15", "今天天气很好，我们一起去公园散步吧。"),
    ("medium-30", "这是一个比较长的句子，用来测试延迟表现和音频质量。"),
    ("long-60", "这是一个比较长的句子，用来测试Qwen3-TTS模型在处理较长文本时的延迟表现和音频质量，看看会不会出现截断或者中间丢失的情况。"),
]

# 0.6B baseline (measured earlier with AOTRITON + sampling)
BASELINE_06B = {
    "short-5": {"synth": 1.84, "audio": 1.52, "ratio": 1.21},
    "medium-15": {"synth": 4.93, "audio": 3.44, "ratio": 1.43},
    "medium-30": {"synth": 13.33, "audio": 6.70, "ratio": 1.99},
}

print("=== 1.7B Model + Greedy Decoding Benchmark ===")
print(f"URL: {TTS_URL}")
print()

# Health check
r = requests.get("http://127.0.0.1:8890/health", timeout=10)
print(f"Health: {r.status_code}")
health = r.json()
print(f"Model: {health['model_dir'].split('\\\\')[-1]}")
print(f"Greedy: {health.get('greedy_mode', '?')}")
print()

print(f"{'Test':20s} {'Chars':>5s} {'Synth':>7s} {'Audio':>7s} {'Ratio':>7s} {'0.6B Ratio':>11s} {'Improvement':>12s}")
print("-" * 80)

for name, text in TESTS:
    times = []
    durations = []
    for _ in range(3):
        t0 = time.time()
        r = requests.post(TTS_URL, json={
            "text": text,
            "language": "Auto",
            "speaker": "Serena",
        }, timeout=120)
        t1 = time.time()
        if r.status_code == 200:
            audio, sr = sf.read(io.BytesIO(r.content))
            dur = len(audio) / sr
            times.append(t1 - t0)
            durations.append(dur)
        else:
            print(f"  {name}: FAIL {r.status_code}")
            break

    if times:
        avg_synth = sum(times) / len(times)
        avg_audio = sum(durations) / len(durations)
        ratio = avg_synth / avg_audio

        baseline = BASELINE_06B.get(name, {})
        baseline_ratio = baseline.get("ratio", 0)
        improvement = ((baseline_ratio - ratio) / baseline_ratio * 100) if baseline_ratio else 0

        print(f"{name:20s} {len(text):5d} {avg_synth:6.2f}s {avg_audio:6.2f}s {ratio:6.2f}x {baseline_ratio:10.2f}x {improvement:+10.1f}%")

print()
print("=== Concurrent Test (3 parallel, medium-15) ===")
import concurrent.futures

def one_request(i):
    t0 = time.time()
    r = requests.post(TTS_URL, json={
        "text": "今天天气很好，我们一起去公园散步吧。",
        "language": "Auto",
        "speaker": "Serena",
    }, timeout=120)
    t1 = time.time()
    audio, sr = sf.read(io.BytesIO(r.content))
    return t1 - t0, len(audio) / sr

t0 = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(one_request, range(3)))
total = time.time() - t0
times = [r[0] for r in results]
durs = [r[1] for r in results]
print(f"Total: {total:.2f}s")
print(f"Individual: {[f'{t:.2f}s (audio {d:.2f}s, ratio {t/d:.2f}x)' for t, d in zip(times, durs)]}")
