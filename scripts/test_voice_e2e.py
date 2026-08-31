import requests
import sys

url = 'http://127.0.0.1:6767/v1/audio/transcriptions'
key = open('c:/Users/1/github-pr/agent-meow/web/.env').read().split('VITE_HERMES_API_KEY=')[1].split('\n')[0].strip()
headers = {'Authorization': f'Bearer {key}'}

with open('c:/Users/1/github-pr/agent-meow/test-silence.wav', 'rb') as f:
    files = {'file': ('test.wav', f, 'audio/wav')}
    data = {'language': 'zh'}
    r = requests.post(url, files=files, data=data, headers=headers, timeout=30)

print(f'STT: {r.status_code}, {r.text[:200]}')

# Also test LLM
print('\n--- LLM test ---')
llm_body = {
    'model': 'nemotron-3.5-lightning:30b-a3b',
    'messages': [{'role': 'user', 'content': 'Say hello in one word'}],
    'stream': False,
    'max_tokens': 10,
}
r2 = requests.post(
    'http://127.0.0.1:6767/v1/chat/completions',
    json=llm_body,
    headers=headers,
    timeout=30,
)
print(f'LLM: {r2.status_code}, {r2.text[:200]}')
