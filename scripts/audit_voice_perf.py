"""Full performance voice pipeline audit — latency measurements.

Measures end-to-end latency for each stage of the voice pipeline:
  1. STT: whisper-server :8001 (audio → text)
  2. LLM: Hermes :8642 → Ollama :11434 (text → reply)
  3. TTS Edge: Hermes :8642 → Edge TTS (text → audio, zh-CN-XiaoxiaoNeural)
  4. TTS Qwen3: native :8891 (text → audio, Serena)
  5. Full pipeline: STT → LLM → TTS (simulated voice turn)

Each stage is timed independently, then the full pipeline is timed
end-to-end. Results are printed with min/max/avg for repeated runs.

Usage:
  python scripts/audit_voice_perf.py            # 3 runs per stage
  python scripts/audit_voice_perf.py --runs 10  # 10 runs per stage
  python scripts/audit_voice_perf.py --no-llm    # skip LLM (cold start slow)
"""
from __future__ import annotations

import argparse
import io
import json
import math
import struct
import sys
import time
import urllib.request
import wave

HERMES_KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
WHISPER_URL = "http://127.0.0.1:8001/inference"
HERMES_CHAT_URL = "http://127.0.0.1:8642/v1/chat/completions"
HERMES_TTS_URL = "http://127.0.0.1:8642/v1/audio/speech"
QWEN_TTS_URL = "http://127.0.0.1:8891/v1/audio/speech"
OLLAMA_URL = "http://127.0.0.1:11434/api/tags"


def make_wav(duration_s: float = 1.0, freq_hz: float = 440.0) -> bytes:
    """Create a WAV file with a tone for STT testing."""
    sr = 16000
    n = int(sr * duration_s)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        frames = b""
        for i in range(n):
            s = int(math.sin(2 * math.pi * freq_hz * i / sr) * 16000)
            frames += struct.pack("<h", s)
        w.writeframes(frames)
    return buf.getvalue()


def time_stt(wav: bytes, lang: str = "zh") -> tuple[float, str]:
    """Time a single STT inference. Returns (elapsed_ms, text)."""
    boundary = "----perf-audit"
    body = (
        b"--" + boundary.encode() + b"\r\n"
        b'Content-Disposition: form-data; name="file"; filename="t.wav"\r\n'
        b"Content-Type: audio/wav\r\n\r\n" + wav + b"\r\n"
        b"--" + boundary.encode() + b"\r\n"
        b'Content-Disposition: form-data; name="language"\r\n\r\n'
        + lang.encode() + b"\r\n"
        + b"--" + boundary.encode() + b"--\r\n"
    )
    req = urllib.request.Request(WHISPER_URL, data=body, method="POST")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    t0 = time.monotonic()
    r = urllib.request.urlopen(req, timeout=30)
    data = json.loads(r.read())
    elapsed = (time.monotonic() - t0) * 1000
    return elapsed, data.get("text", "")


def time_llm(prompt: str, model: str = "hermes-agent") -> tuple[float, str]:
    """Time a single LLM call via Hermes. Returns (elapsed_ms, reply)."""
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
    }).encode()
    req = urllib.request.Request(HERMES_CHAT_URL, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {HERMES_KEY}")
    req.add_header("Content-Type", "application/json")
    t0 = time.monotonic()
    r = urllib.request.urlopen(req, timeout=120)
    data = json.loads(r.read())
    elapsed = (time.monotonic() - t0) * 1000
    choices = data.get("choices", [])
    reply = choices[0].get("message", {}).get("content", "") if choices else ""
    return elapsed, reply


def time_tts_edge(text: str, voice: str = "zh-CN-XiaoxiaoNeural") -> tuple[float, int]:
    """Time Edge TTS via Hermes. Returns (elapsed_ms, audio_bytes)."""
    body = json.dumps({"input": text, "voice": voice}).encode()
    req = urllib.request.Request(HERMES_TTS_URL, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {HERMES_KEY}")
    req.add_header("Content-Type", "application/json")
    t0 = time.monotonic()
    r = urllib.request.urlopen(req, timeout=30)
    data = r.read()
    elapsed = (time.monotonic() - t0) * 1000
    return elapsed, len(data)


def time_tts_qwen(text: str, voice: str = "Serena") -> tuple[float, int]:
    """Time Qwen3-TTS native. Returns (elapsed_ms, audio_bytes)."""
    body = json.dumps({"input": text, "voice": voice}).encode()
    req = urllib.request.Request(QWEN_TTS_URL, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    t0 = time.monotonic()
    r = urllib.request.urlopen(req, timeout=30)
    data = r.read()
    elapsed = (time.monotonic() - t0) * 1000
    return elapsed, len(data)


def time_full_pipeline(wav: bytes) -> dict:
    """Time the full STT → LLM → TTS pipeline. Returns timing dict."""
    t0 = time.monotonic()
    stt_ms, transcript = time_stt(wav)
    t1 = time.monotonic()
    if transcript.strip() and len(transcript.strip()) >= 2:
        llm_ms, reply = time_llm(transcript.strip())
    else:
        llm_ms, reply = 0, ""
    t2 = time.monotonic()
    if reply.strip():
        tts_ms, tts_bytes = time_tts_edge(reply[:200])
    else:
        tts_ms, tts_bytes = 0, 0
    t3 = time.monotonic()
    total = (t3 - t0) * 1000
    return {
        "stt_ms": stt_ms,
        "llm_ms": llm_ms,
        "tts_ms": tts_ms,
        "total_ms": total,
        "transcript": transcript[:60],
        "reply": reply[:60],
        "tts_bytes": tts_bytes,
    }


def check_service(url: str) -> bool:
    """Quick health check for a service."""
    try:
        r = urllib.request.urlopen(url, timeout=5)
        return r.status == 200
    except Exception:
        return False


def fmt_ms(ms: float) -> str:
    """Format milliseconds nicely."""
    if ms < 1000:
        return f"{ms:.0f}ms"
    return f"{ms/1000:.2f}s"


def stats(times: list[float]) -> str:
    """Format min/avg/max for a list of times."""
    valid = [t for t in times if t > 0]
    if not valid:
        return "all failed"
    return f"min={fmt_ms(min(valid))} avg={fmt_ms(sum(valid)/len(valid))} max={fmt_ms(max(valid))}"


def main() -> int:
    parser = argparse.ArgumentParser(description="Voice pipeline performance audit")
    parser.add_argument("--runs", type=int, default=3, help="Number of runs per stage")
    parser.add_argument("--no-llm", action="store_true", help="Skip LLM (cold start can be slow)")
    args = parser.parse_args()

    print("=" * 70)
    print("  Voice Pipeline Performance Audit")
    print("=" * 70)

    # Pre-flight checks
    print("\n--- Pre-flight health checks ---")
    services = [
        ("Whisper STT :8001", "http://127.0.0.1:8001/health"),
        ("Hermes :8642", "http://127.0.0.1:8642/health"),
        ("Qwen3-TTS :8891", "http://127.0.0.1:6767/health"),  # checked via server proxy
        ("Ollama :11434", OLLAMA_URL),
        ("agent-meow :6767", "http://127.0.0.1:6767/health"),
    ]
    all_ok = True
    for name, url in services:
        ok = check_service(url)
        print(f"  {'✅ UP' if ok else '❌ DOWN'}  {name}")
        if not ok:
            all_ok = False
    if not all_ok:
        print("\n❌ Some services are down. Start the stack first:")
        print("  powershell -ExecutionPolicy Bypass -File scripts/start-native-stack.ps1")
        return 1

    # Prepare test WAV (2s of tone)
    print("\n--- Preparing test audio (2s tone) ---")
    wav = make_wav(duration_s=2.0)

    # STT timing
    print(f"\n--- STT timing ({args.runs} runs) ---")
    stt_times = []
    for i in range(args.runs):
        try:
            ms, text = time_stt(wav)
            stt_times.append(ms)
            print(f"  Run {i+1}: {fmt_ms(ms)} → '{text[:40]}'")
        except Exception as e:
            print(f"  Run {i+1}: ERROR — {e}")
            stt_times.append(0)

    # LLM timing
    llm_times = []
    if not args.no_llm:
        print(f"\n--- LLM timing ({args.runs} runs, model=hermes-agent) ---")
        for i in range(args.runs):
            try:
                ms, reply = time_llm("你好，请用一句话介绍你自己")
                llm_times.append(ms)
                print(f"  Run {i+1}: {fmt_ms(ms)} → '{reply[:50]}'")
            except Exception as e:
                print(f"  Run {i+1}: ERROR — {e}")
                llm_times.append(0)
    else:
        print("\n--- LLM timing: SKIPPED (--no-llm) ---")

    # TTS Edge timing
    print(f"\n--- TTS Edge timing ({args.runs} runs, zh-CN-XiaoxiaoNeural) ---")
    edge_times = []
    for i in range(args.runs):
        try:
            ms, nbytes = time_tts_edge("你好世界，这是语音合成测试")
            edge_times.append(ms)
            print(f"  Run {i+1}: {fmt_ms(ms)} → {nbytes} bytes")
        except Exception as e:
            print(f"  Run {i+1}: ERROR — {e}")
            edge_times.append(0)

    # TTS Qwen3 timing
    print(f"\n--- TTS Qwen3 timing ({args.runs} runs, Serena) ---")
    qwen_times = []
    for i in range(args.runs):
        try:
            ms, nbytes = time_tts_qwen("你好世界，这是语音合成测试")
            qwen_times.append(ms)
            print(f"  Run {i+1}: {fmt_ms(ms)} → {nbytes} bytes")
        except Exception as e:
            print(f"  Run {i+1}: ERROR — {e}")
            qwen_times.append(0)

    # Full pipeline
    print(f"\n--- Full pipeline STT→LLM→TTS ({args.runs} runs) ---")
    pipe_results = []
    for i in range(args.runs):
        try:
            r = time_full_pipeline(wav)
            pipe_results.append(r)
            print(
                f"  Run {i+1}: total={fmt_ms(r['total_ms'])} "
                f"(STT {fmt_ms(r['stt_ms'])} + LLM {fmt_ms(r['llm_ms'])} + TTS {fmt_ms(r['tts_ms'])}) "
                f"reply='{r['reply'][:30]}'"
            )
        except Exception as e:
            print(f"  Run {i+1}: ERROR — {e}")

    # Summary
    print("\n" + "=" * 70)
    print("  Performance Summary")
    print("=" * 70)
    print(f"  STT (whisper :8001):          {stats(stt_times)}")
    if llm_times:
        print(f"  LLM (Hermes→Ollama):          {stats(llm_times)}")
    else:
        print(f"  LLM:                          SKIPPED")
    print(f"  TTS Edge (Xiaoxiao):          {stats(edge_times)}")
    print(f"  TTS Qwen3 (Serena):           {stats(qwen_times)}")
    if pipe_results:
        totals = [r["total_ms"] for r in pipe_results if r["total_ms"] > 0]
        if totals:
            print(f"  Full pipeline (STT+LLM+TTS):   {stats(totals)}")
    print()
    print("  Target: STT <500ms, LLM 200ms-5s, TTS Edge <500ms, Qwen3 <2s")
    print("  Full pipeline: <3s warm, <10s cold LLM")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())