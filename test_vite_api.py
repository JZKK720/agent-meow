import urllib.request, json
req = urllib.request.Request(
    "http://localhost:5173/v1/chat/completions",
    data=json.dumps({"model": "hermes-agent", "messages": [{"role": "user", "content": "hi"}]}).encode(),
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer 3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb",
    },
)
try:
    resp = urllib.request.urlopen(req, timeout=30)
    print(f"STATUS: {resp.status}")
    body = resp.read().decode()[:300]
    print(f"BODY: {body}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR: {e.code}")
    print(f"BODY: {e.read().decode()[:300]}")
except Exception as e:
    print(f"ERROR: {e}")
