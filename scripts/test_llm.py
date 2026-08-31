import requests

key = open('c:/Users/1/github-pr/agent-meow/web/.env').read().split('VITE_HERMES_API_KEY=')[1].split('\n')[0].strip()
headers = {'Authorization': f'Bearer {key}', 'Content-Type': 'application/json'}

# Test LLM (non-streaming, short)
body = {
    'model': 'nemotron-3.5-lightning:30b-a3b',
    'messages': [{'role': 'user', 'content': 'hi'}],
    'stream': False,
    'max_tokens': 5,
}
try:
    r = requests.post('http://127.0.0.1:6767/v1/chat/completions', json=body, headers=headers, timeout=60)
    print(f'LLM: {r.status_code}, {r.text[:300]}')
except Exception as e:
    print(f'LLM ERROR: {e}')
