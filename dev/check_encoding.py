"""Check pyproject.toml for non-ASCII bytes and fix encoding."""
import sys

path = "pyproject.toml"
with open(path, "rb") as f:
    data = f.read()

bad = [(i, b) for i, b in enumerate(data) if b > 127]
print(f"non-ascii count: {len(bad)}")
if bad:
    print(f"first 10: {bad[:10]}")
    # Show context around first bad byte
    pos = bad[0][0]
    start = max(0, pos - 40)
    end = min(len(data), pos + 40)
    print(f"context bytes [{start}:{end}]: {data[start:end]!r}")
    # Try to decode as UTF-8 to see the error
    try:
        data.decode("utf-8")
        print("UTF-8 decode: OK")
    except UnicodeDecodeError as e:
        print(f"UTF-8 decode error: {e}")
