"""Voice pipeline performance benchmarks — latency measurements."""
from __future__ import annotations

import os
import time
import requests

BASE = "http://127.0.0.1:6767"
KEY = os.environ.get("HERMES_API_KEY", "")
headers = {"Authorization": f"Bearer {KEY}"} if KEY else {}


def bench_llm(prompt: str, label: str) -> dict:
    body = {
        "model": "auto",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 50,
        "stream": False,
    }
    t0 = time.time()
    r = requests.post(f"{BASE}/v1/chat/completions", json=body, headers=headers, timeout=60)
    t1 = time.time()
    resp = r.json()
    reply = resp.get("choices", [{}])[0].get("message", {}).get("content", "")
    tokens = len(reply.split())
    latency = t1 - t0
    tps = tokens / latency if latency > 0 else 0
    return {"label": label, "status": r.status_code, "latency_s": round(latency, 2), "tokens": tokens, "tps": round(tps, 1), "reply": reply[:80]}


def bench_tts(text: str, voice: str, language: str, label: str, edge: bool = False) -> dict:
    url = f"{BASE}/v1/audio/speech/edge" if edge else f"{BASE}/v1/audio/speech"
    body = {"input": text}
    if not edge:
        body["voice"] = voice
        body["language"] = language
    t0 = time.time()
    try:
        r = requests.post(url, json=body, headers=headers, timeout=60)
        t1 = time.time()
        return {"label": label, "status": r.status_code, "latency_s": round(t1 - t0, 2), "bytes": len(r.content), "ct": r.headers.get("content-type", "")}
    except Exception as e:
        t1 = time.time()
        return {"label": label, "status": 0, "latency_s": round(t1 - t0, 2), "bytes": 0, "error": str(e)}


def bench_stt() -> dict:
    # Generate TTS audio, then transcribe
    body = {"input": "The quick brown fox jumps over the lazy dog.", "voice": "Vivian", "language": "English"}
    r_tts = requests.post(f"{BASE}/v1/audio/speech", json=body, headers=headers, timeout=60)
    if r_tts.status_code != 200:
        return {"label": "STT roundtrip", "status": 0, "error": "TTS failed"}
    files = {"file": ("test.wav", r_tts.content, "audio/wav")}
    data = {"language": "auto"}
    t0 = time.time()
    try:
        r = requests.post(f"{BASE}/v1/audio/transcriptions", files=files, data=data, headers=headers, timeout=30)
        t1 = time.time()
        text = r.json().get("text", "") if r.status_code == 200 else ""
        return {"label": "STT roundtrip", "status": r.status_code, "latency_s": round(t1 - t0, 2), "text": text[:80]}
    except Exception as e:
        t1 = time.time()
        return {"label": "STT roundtrip", "status": 0, "latency_s": round(t1 - t0, 2), "error": str(e)}


def main() -> None:
    print("=" * 70)
    print("VOICE PIPELINE PERFORMANCE BENCHMARKS")
    print("=" * 70)

    # Warmup
    print("\n--- Warmup ---")
    bench_tts("warmup", "Vivian", "English", "warmup")
    bench_llm("hi", "warmup")

    # LLM benchmarks
    print("\n--- LLM Latency ---")
    llm_tests = [
        ("Say exactly: ok", "LLM short"),
        ("Tell me a one-sentence joke.", "LLM medium"),
        ("Explain quantum computing in one paragraph.", "LLM long"),
    ]
    for prompt, label in llm_tests:
        r = bench_llm(prompt, label)
        print(f"  {r['label']}: {r['latency_s']}s, {r['tokens']} tokens, {r['tps']} tps, status={r['status']}")

    # TTS benchmarks
    print("\n--- TTS Latency ---")
    tts_tests = [
        ("Hello.", "Vivian", "English", "TTS EN short (Qwen)"),
        ("Hello, this is a voice pipeline test.", "Vivian", "English", "TTS EN medium (Qwen)"),
        ("你好。", "Serena", "Chinese", "TTS ZH short (Qwen)"),
        ("你好，这是语音管道测试。", "Serena", "Chinese", "TTS ZH medium (Qwen)"),
    ]
    for text, voice, lang, label in tts_tests:
        r = bench_tts(text, voice, lang, label)
        print(f"  {r['label']}: {r['latency_s']}s, {r['bytes']}b, status={r['status']}")

    # Edge TTS
    print("\n--- Edge TTS Latency ---")
    edge_tests = [
        ("Hello.", "TTS Edge EN short"),
        ("Hello, this is a test.", "TTS Edge EN medium"),
        ("你好。", "TTS Edge ZH short"),
    ]
    for text, label in edge_tests:
        r = bench_tts(text, "", "", label, edge=True)
        print(f"  {r['label']}: {r['latency_s']}s, {r['bytes']}b, status={r['status']}")

    # STT benchmark
    print("\n--- STT Latency ---")
    r = bench_stt()
    print(f"  {r['label']}: {r['latency_s']}s, status={r['status']}, text={r.get('text', r.get('error', ''))}")

    # Full pipeline (STT -> LLM -> TTS)
    print("\n--- Full Pipeline (STT -> LLM -> TTS) ---")
    # Generate audio, transcribe, send to LLM, speak the reply
    body = {"input": "What is 2 plus 2?", "voice": "Vivian", "language": "English"}
    r_tts = requests.post(f"{BASE}/v1/audio/speech", json=body, headers=headers, timeout=60)
    if r_tts.status_code == 200:
        files = {"file": ("test.wav", r_tts.content, "audio/wav")}
        data = {"language": "auto"}
        t0 = time.time()
        r_stt = requests.post(f"{BASE}/v1/audio/transcriptions", files=files, data=data, headers=headers, timeout=30)
        t_stt = time.time()
        stt_text = r_stt.json().get("text", "").strip()
        print(f"  STT: {t_stt - t0:.2f}s -> '{stt_text}'")

        if stt_text:
            llm_body = {"model": "auto", "messages": [{"role": "user", "content": stt_text}], "max_tokens": 30, "stream": False}
            t_llm_start = time.time()
            r_llm = requests.post(f"{BASE}/v1/chat/completions", json=llm_body, headers=headers, timeout=30)
            t_llm_end = time.time()
            llm_reply = r_llm.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"  LLM: {t_llm_end - t_llm_start:.2f}s -> '{llm_reply[:60]}'")

            if llm_reply:
                tts_body = {"input": llm_reply, "voice": "Vivian", "language": "English"}
                t_tts_start = time.time()
                r_tts2 = requests.post(f"{BASE}/v1/audio/speech", json=tts_body, headers=headers, timeout=60)
                t_tts_end = time.time()
                print(f"  TTS: {t_tts_end - t_tts_start:.2f}s -> {len(r_tts2.content)}b")
                print(f"  TOTAL: {t_tts_end - t0:.2f}s")

    print("\n" + "=" * 70)
    print("BENCHMARK COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()