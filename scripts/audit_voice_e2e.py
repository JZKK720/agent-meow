"""Full voice pipeline e2e audit: STT -> LLM -> TTS with latency benchmarks."""
from __future__ import annotations

import os
import sys
import time
import requests

BASE = "http://127.0.0.1:6767"
KEY = os.environ.get("HERMES_API_KEY", "")
headers = {"Authorization": f"Bearer {KEY}"} if KEY else {}


def test_llm() -> bool:
    """Step 1: LLM (server -> hermes -> ollama)."""
    print("=== Step 1: LLM (server -> hermes -> ollama) ===")
    body = {
        "model": "auto",
        "messages": [{"role": "user", "content": "Say exactly: voice pipeline e2e ok"}],
        "max_tokens": 20,
        "stream": False,
    }
    t0 = time.time()
    r = requests.post(f"{BASE}/v1/chat/completions", json=body, headers=headers, timeout=30)
    t1 = time.time()
    print(f"LLM: {r.status_code} in {t1 - t0:.2f}s")
    resp = r.json()
    reply = resp["choices"][0]["message"]["content"]
    print(f"Reply: {reply}")
    return "voice pipeline e2e ok" in reply.lower()


def test_tts(name: str, text: str, voice: str, language: str, edge: bool = False) -> bool:
    """Test TTS endpoint."""
    print(f"\n=== Step: TTS {name} ===")
    url = f"{BASE}/v1/audio/speech/edge" if edge else f"{BASE}/v1/audio/speech"
    body = {"input": text}
    if not edge:
        body["voice"] = voice
        body["language"] = language
    t0 = time.time()
    try:
        r = requests.post(url, json=body, headers=headers, timeout=60)
        t1 = time.time()
        ct = r.headers.get("content-type", "unknown")
        print(f"TTS {name}: {r.status_code}, {len(r.content)} bytes, {t1 - t0:.2f}s, ct={ct}")
        return r.status_code == 200 and len(r.content) > 1000
    except Exception as e:
        t1 = time.time()
        print(f"TTS {name}: FAIL after {t1 - t0:.2f}s - {e}")
        return False


def test_stt() -> bool:
    """Step: STT (whisper-server via server proxy)."""
    print("\n=== Step: STT (whisper-server :8080 via server proxy) ===")
    # Generate TTS audio first
    body = {"input": "Say hello world", "voice": "Vivian", "language": "English"}
    r_tts = requests.post(f"{BASE}/v1/audio/speech", json=body, headers=headers, timeout=60)
    print(f"TTS for STT input: {r_tts.status_code}, {len(r_tts.content)} bytes")
    if r_tts.status_code != 200 or len(r_tts.content) < 1000:
        print("TTS failed, cannot test STT roundtrip")
        return False

    # Test directly against whisper-server
    print("Direct to whisper-server :8080/inference...")
    files = {"file": ("test.wav", r_tts.content, "audio/wav")}
    data = {"language": "auto"}
    t0 = time.time()
    try:
        r_stt = requests.post("http://127.0.0.1:8080/inference", files=files, data=data, timeout=30)
        t1 = time.time()
        print(f"STT direct: {r_stt.status_code} in {t1 - t0:.2f}s")
        print(f"STT text: {r_stt.text[:300]}")
        direct_ok = r_stt.status_code == 200 and len(r_stt.text) > 0
    except Exception as e:
        t1 = time.time()
        print(f"STT direct FAIL after {t1 - t0:.2f}s: {e}")
        direct_ok = False

    # Test via server proxy
    print("Via server :6767/v1/audio/transcriptions...")
    files2 = {"file": ("test.wav", r_tts.content, "audio/wav")}
    data2 = {"language": "auto"}
    t0 = time.time()
    try:
        r_stt2 = requests.post(
            f"{BASE}/v1/audio/transcriptions", files=files2, data=data2, headers=headers, timeout=30
        )
        t1 = time.time()
        print(f"STT proxy: {r_stt2.status_code} in {t1 - t0:.2f}s")
        print(f"STT text: {r_stt2.text[:300]}")
        proxy_ok = r_stt2.status_code == 200 and len(r_stt2.text) > 0
    except Exception as e:
        t1 = time.time()
        print(f"STT proxy FAIL after {t1 - t0:.2f}s: {e}")
        proxy_ok = False

    return direct_ok or proxy_ok


def main() -> int:
    results = {}
    results["LLM"] = test_llm()
    results["TTS Qwen EN"] = test_tts("Qwen EN", "Hello, this is a voice pipeline test.", "Vivian", "English")
    results["TTS Qwen ZH"] = test_tts("Qwen ZH", "你好，这是语音管道测试。", "Serena", "Chinese")
    results["TTS Edge EN"] = test_tts("Edge EN", "Hello edge test", "", "", edge=True)
    results["TTS Edge ZH"] = test_tts("Edge ZH", "你好edge测试", "", "", edge=True)
    results["STT"] = test_stt()

    print("\n=== VOICE PIPELINE E2E SUMMARY ===")
    for k, v in results.items():
        status = "PASS" if v else "FAIL"
        print(f"  {status}  {k}")
    total = sum(results.values())
    print(f"\nTotal: {total}/{len(results)} passed")
    return 0 if total == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())