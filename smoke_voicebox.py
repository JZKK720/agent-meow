import httpx, asyncio, json

async def main():
    c = httpx.AsyncClient(timeout=120)
    
    # 1. List existing profiles
    r = await c.get("http://127.0.0.1:17493/profiles")
    profiles = []
    if r.status_code == 200:
        profiles = r.json() if isinstance(r.json(), list) else []
    
    if profiles:
        pid = profiles[0].get("id", "")
        print(f"Using existing profile: {profiles[0].get('name')} ({pid})")
    else:
        r = await c.post("http://127.0.0.1:17493/profiles", json={
            "name": "agent-meow-default",
            "engine": "kokoro",
            "voice_id": "af_nova",
            "language": "en"
        })
        print(f"Create profile: {r.status_code}")
        pid = r.json().get("id", "")
    print(f"Profile ID: {pid}")
    
    # 2. Speak
    r = await c.post("http://127.0.0.1:17493/speak", json={
        "text": "Hello from agent meow. Voicebox is fully operational.",
        "profile": pid
    })
    print(f"Speak status: {r.status_code}")
    data = r.json() if r.status_code == 200 else {}
    gid = data.get("id", "")
    print(f"Generation ID: {gid}")
    
    # 3. Poll with simpler parsing
    if gid:
        for i in range(20):
            await asyncio.sleep(2)
            s = await c.get(f"http://127.0.0.1:17493/generate/{gid}/status")
            text = s.text
            if 'completed' in text:
                print(f"TTS COMPLETED at poll {i+1}")
                parts = text.split('"')
                for j, p in enumerate(parts):
                    if p == "audio_path" and j+2 < len(parts):
                        print(f"Audio: {parts[j+2][:100]}")
                print("TTS WORKS!")
                return
            if 'failed' in text or 'error' in text:
                print(f"FAILED: {text[:200]}")
                return
            print(f"  Poll {i+1}: waiting...")
    else:
        print(f"Response: {data}")

asyncio.run(main())
