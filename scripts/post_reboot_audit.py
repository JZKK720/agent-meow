"""Post-reboot audit: STT WebSocket + TTS round-trip + LLM Chinese chat."""
import asyncio
import json
import urllib.request

BASE = "http://127.0.0.1:6767"


async def test_stt():
    import websockets

    # Hermes streaming STT (the endpoint hermesVoice.ts uses)
    key = ""
    with open(r"C:\Users\1\github-pr\agent-meow\web\.env", encoding="utf-8") as f:
        for line in f:
            if line.startswith("VITE_HERMES_API_KEY="):
                key = line.split("=", 1)[1].strip()
    uri = "ws://127.0.0.1:8642/v1/audio/transcriptions/stream"
    try:
        async with websockets.connect(
            uri, open_timeout=10, additional_headers={"Authorization": f"Bearer {key}"}
        ) as ws:
            print("[STT] WS CONNECTED:", uri)
            silence = b"\x00\x00" * 8000  # 0.5s of 16kHz silence
            await ws.send(silence)
            await ws.send('{"type":"finalize"}')
            got_final = False
            try:
                for _ in range(5):
                    msg = await asyncio.wait_for(ws.recv(), timeout=10)
                    print("[STT] RECV:", str(msg)[:200])
                    if '"final"' in str(msg):
                        got_final = True
                        break
            except asyncio.TimeoutError:
                print("[STT] timeout waiting for messages")
            print("[STT] PASS" if got_final else "[STT] no final transcript (silence — check for partials above)")
    except Exception as e:
        print("[STT] FAILED:", type(e).__name__, str(e)[:200])


def test_tts():
    """TTS round-trip through the voice proxy with real audio bytes."""
    req = urllib.request.Request(
        "http://127.0.0.1:6767/v1/audio/speech",
        data=json.dumps({"text": "你好，重启后的语音测试。"}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read()
            ctype = r.headers.get("Content-Type", "")
            print(f"[TTS] {r.status} {ctype} {len(body)} bytes")
            if len(body) > 1000:
                print("[TTS] PASS - real audio bytes returned")
            else:
                print("[TTS] body head:", body[:200])
    except Exception as e:
        print("[TTS] FAILED:", type(e).__name__, str(e)[:300])


def test_llm():
    """LLM chat in simplified Chinese via Hermes."""
    key = ""
    with open(r"C:\Users\1\github-pr\agent-meow\web\.env", encoding="utf-8") as f:
        for line in f:
            if line.startswith("VITE_HERMES_API_KEY="):
                key = line.split("=", 1)[1].strip()
    payload = json.dumps(
        {
            "model": "hermes-agent",
            "messages": [{"role": "user", "content": "用简体中文回答：你是什么模型？一句话即可。"}],
            "max_tokens": 100,
        }
    ).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8642/v1/chat/completions",
        data=payload,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read())
            text = data["choices"][0]["message"]["content"]
            print("[LLM] PASS:", text[:200])
    except Exception as e:
        print("[LLM] FAILED:", type(e).__name__, str(e)[:300])


if __name__ == "__main__":
    asyncio.run(test_stt())
    test_tts()
    test_llm()
