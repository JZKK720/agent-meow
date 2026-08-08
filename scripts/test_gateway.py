import asyncio
import sys
import threading
import time
import os
import json
import urllib.request

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

sys.argv = ["test", "--port", "17510"]
from agent_meow.hermes_voice_gateway import main


def make_request():
    time.sleep(4)
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:17510/tts",
            data=json.dumps({"text": "hello"}).encode(),
            headers={"Content-Type": "application/json"},
        )
        resp = urllib.request.urlopen(req, timeout=30)
        data = resp.read()
        print(f"Status: {resp.status}")
        print(f"Audio size: {len(data)} bytes")
    except Exception as e:
        print(f"Error: {e}")
    os._exit(0)


t = threading.Thread(target=make_request, daemon=True)
t.start()
main()
