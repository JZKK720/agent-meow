"""Fix pyproject.toml encoding — replace broken multi-byte UTF-8 sequences."""
import re

path = "pyproject.toml"
with open(path, "rb") as f:
    data = f.read()

# The pattern \xe2\x80? (where ? is a literal '?' = 0x3f) is a broken em-dash/en-dash/etc.
# Common sequences that got their 3rd byte replaced with '?':
#   \xe2\x80\x94 = em-dash —
#   \xe2\x80\x93 = en-dash –
#   \xe2\x80\x99 = right single quote '
#   \xe2\x80\x9c = left double quote "
#   \xe2\x80\x9d = right double quote "
#   \xe2\x80\x98 = left single quote '
#   \xe2\x80\xa2 = bullet •
#   \xc3\xa9 = é
# Replace \xe2\x80? (broken 3-byte) with em-dash —
fixed = data.replace(b"\xe2\x80?", b"\xe2\x80\x94")
# Also fix any \xc3? (broken 2-byte, e.g. é)
# Check for other broken sequences
remaining = [(i, b) for i, b in enumerate(fixed) if b > 127]
print(f"after fix, non-ascii count: {len(remaining)}")
if remaining:
    # Show remaining context
    for pos, _ in remaining[:5]:
        start = max(0, pos - 20)
        end = min(len(fixed), pos + 20)
        print(f"  remaining at {pos}: {fixed[start:end]!r}")

# Try UTF-8 decode
try:
    text = fixed.decode("utf-8")
    print("UTF-8 decode: OK after fix")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    print("Wrote fixed file")
except UnicodeDecodeError as e:
    print(f"UTF-8 decode still failing: {e}")
    # More aggressive: replace any remaining invalid bytes
    text = fixed.decode("utf-8", errors="replace")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    print("Wrote file with replacement chars")
