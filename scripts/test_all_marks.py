"""Test every Chinese punctuation mark individually to find which ones
cause tts-server.exe to hang."""
import json
import time
import urllib.request

TTS_URL = "http://127.0.0.1:8891/v1/audio/speech"

marks = [
    ("\uFF0C", "comma ，"),
    ("\uFF1B", "semicolon ；"),
    ("\uFF01", "exclaim ！"),
    ("\u3002", "period 。"),
    ("\uFF1F", "question ？"),
    ("\uFF1A", "colon ："),
    ("\u2026", "ellipsis …"),
    ("\uFF08", "open paren （"),
    ("\uFF09", "close paren ）"),
    ("\u201C", "open smart quote \u201c"),
    ("\u201D", "close smart quote \u201d"),
    ("\u3010", "open bracket 【"),
    ("\u3011", "close bracket 】"),
    ("\u3001", "ideographic comma 、"),
    ("\u2014", "em dash —"),
    ("\u2014\u2014", "double em dash ——"),
    ("\u300A", "open book title 《"),
    ("\u300B", "close book title 》"),
    ("\uFF5E", "fullwidth tilde ～"),
    ("~", "ascii tilde"),
    ("\u00B7", "middle dot"),
    ("\u2022", "bullet"),
    ("\u203B", "reference mark"),
]

print(f"{'Mark':<30} {'U+':<8} {'Time':>6} {'Status':>8}")
print("-" * 60)

for mark, name in marks:
    text = "\u4f60\u597d" + mark + "\u4e16\u754c"  # 你好 + mark + 世界
    body = json.dumps({
        "input": text,
        "voice": "Serena",
        "response_format": "wav",
        "temperature": 0,
    }).encode()
    req = urllib.request.Request(TTS_URL, data=body, headers={"Content-Type": "application/json"})
    t0 = time.time()
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        audio = resp.read()
        elapsed = time.time() - t0
        cp = f"U+{ord(mark[0]):04X}" if len(mark) == 1 else f"U+{ord(mark[0]):04X}x{len(mark)}"
        print(f"{name:<30} {cp:<8} {elapsed:>5.2f}s {'OK':>8}")
    except Exception as e:
        elapsed = time.time() - t0
        cp = f"U+{ord(mark[0]):04X}" if len(mark) == 1 else f"U+{ord(mark[0]):04X}x{len(mark)}"
        status = "HANG" if elapsed > 8 else "ERR"
        print(f"{name:<30} {cp:<8} {elapsed:>5.2f}s {status:>8}")
    time.sleep(0.3)