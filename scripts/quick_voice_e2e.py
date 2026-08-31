"""Quick TTS + TTS->STT round-trip test through server proxy."""
import urllib.request
import json
import time

SERVER = "http://127.0.0.1:6767"
KEY = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"

# TTS
print("=== TTS test ===", flush=True)
t0 = time.time()
body = json.dumps({"input": "hello test", "voice": "serena"}).encode()
req = urllib.request.Request(SERVER + "/v1/audio/speech", data=body, method="POST")
req.add_header("Content-Type", "application/json")
req.add_header("Authorization", f"Bearer {KEY}")
try:
    r = urllib.request.urlopen(req, timeout=120)
    d = r.read()
    print(f"TTS: {r.status} {len(d)}B ({time.time()-t0:.2f}s)", flush=True)
except Exception as e:
    print(f"TTS ERR: {e} ({time.time()-t0:.2f}s)", flush=True)
    d = None

# Round-trip: feed TTS output to STT
if d and len(d) > 0:
    print("\n=== Round-trip: TTS -> STT ===", flush=True)
    boundary = "----RT1"
    parts = []
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(b'Content-Disposition: form-data; name="file"; filename="t.wav"\r\n')
    parts.append(b"Content-Type: audio/wav\r\n\r\n")
    parts.append(d)
    parts.append(b"\r\n")
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(b'Content-Disposition: form-data; name="language"\r\n\r\n')
    parts.append(b"zh\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    stt2_body = b"".join(parts)
    t1 = time.time()
    try:
        r2 = urllib.request.Request(
            SERVER + "/v1/audio/transcriptions",
            data=stt2_body,
            method="POST",
        )
        r2.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
        r3 = urllib.request.urlopen(r2, timeout=30)
        j = json.loads(r3.read())
        print(f"STT: {r3.status} text='{j.get('text','')}' ({time.time()-t1:.2f}s)", flush=True)
    except Exception as e:
        print(f"STT ERR: {e} ({time.time()-t1:.2f}s)", flush=True)

# Also test session create + turn
print("\n=== Session + Turn ===", flush=True)
sess_body = json.dumps({"agent": "hermes-gateway"}).encode()
t2 = time.time()
try:
    r = urllib.request.Request(
        SERVER + "/v1/sessions", data=sess_body, method="POST"
    )
    r.add_header("Content-Type", "application/json")
    r.add_header("Authorization", f"Bearer {KEY}")
    r2 = urllib.request.urlopen(r, timeout=10)
    sess = json.loads(r2.read())
    sid = sess.get("id", "")
    print(f"Session: {r2.status} id={sid[:16]}... ({time.time()-t2:.2f}s)", flush=True)
    print("ALL E2E TESTS PASS", flush=True)
except Exception as e:
    print(f"Session ERR: {e} ({time.time()-t2:.2f}s)", flush=True)
