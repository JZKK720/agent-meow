"""Test cloud model latency."""
import requests
import time

models = [
    "deepseek-v4-flash:0731-cloud",
    "nemotron-3.5-lightning:30b-a3b",
]

for model in models:
    t0 = time.time()
    try:
        r = requests.post('http://127.0.0.1:11434/v1/chat/completions', json={
            'model': model,
            'messages': [{'role': 'user', 'content': 'hi'}],
            'max_tokens': 10
        }, timeout=60)
        t1 = time.time()
        if r.status_code == 200:
            content = r.json()["choices"][0]["message"]["content"]
            print(f"{model}: {r.status_code} ({t1-t0:.2f}s) -> {content[:80]}")
        else:
            print(f"{model}: {r.status_code} ({t1-t0:.2f}s) {r.text[:100]}")
    except Exception as e:
        t1 = time.time()
        print(f"{model}: FAIL ({t1-t0:.2f}s) {e}")
