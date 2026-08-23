"""Test what symbols/emojis the LLM produces and what sanitizeForTts misses."""
import requests
import unicodedata
import json

r = requests.post('http://127.0.0.1:6767/v1/chat/completions', json={
    'model': 'qwen',
    'messages': [
        {'role': 'system', 'content': '你是橘宝，一只活泼可爱的AI猫咪助手。回答要简洁有趣，像一个可爱的猫咪朋友。'},
        {'role': 'user', 'content': '你好，介绍一下你自己吧，说说你能做什么'}
    ],
    'max_tokens': 300
}, timeout=120)

if r.status_code != 200:
    print(f"FAIL: {r.status_code} {r.text[:200]}")
    exit(1)

content = r.json()['choices'][0]['message']['content']
print(f"=== Raw LLM Response ===")
print(content)
print()

# Find all problematic characters
print("=== Problematic Characters ===")
problematic = []
for i, ch in enumerate(content):
    cat = unicodedata.category(ch)
    name = unicodedata.name(ch, 'UNKNOWN')
    # Categories that cause TTS issues:
    # So = Other Symbol (♪ ♥ ✨ etc)
    # Sm = Math Symbol (∑ ∂ etc)
    # Sk = Modifier Symbol (^ ` etc)
    # Pd = Dash Punctuation (— – etc) - these cause pauses
    # Po = Other Punctuation (… · • etc) - these cause pauses
    # Also check for CJK symbols, fullwidth chars, etc
    if cat.startswith(('So', 'Sm', 'Sk')) or cat == 'Pd' or cat == 'Po':
        problematic.append((i, ch, cat, name))
    elif ord(ch) > 0x2000 and not (0x3000 <= ord(ch) <= 0x303F or 0xFF00 <= ord(ch) <= 0xFFEF):
        problematic.append((i, ch, cat, name))

for pos, ch, cat, name in problematic:
    context = content[max(0,pos-5):pos+6]
    print(f"  pos={pos:3d} U+{ord(ch):04X} {cat:2s} {name:30s} context: ...{context}...")

print()
print(f"Total problematic chars: {len(problematic)}")
print(f"Response length: {len(content)} chars")
