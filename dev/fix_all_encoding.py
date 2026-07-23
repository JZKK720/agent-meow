"""Find and fix all files with broken UTF-8 encoding (broken multi-byte sequences)."""
import os
import sys

def fix_file(path):
    """Fix broken UTF-8 in a file. Returns (was_broken, was_fixed)."""
    try:
        with open(path, "rb") as f:
            data = f.read()
    except Exception:
        return (False, False)
    
    # Check if it has the broken \xe2\x80? pattern (3rd byte replaced with '?')
    if b"\xe2\x80?" not in data and b"\xc3?" not in data:
        # Try normal UTF-8 decode
        try:
            data.decode("utf-8")
            return (False, False)
        except UnicodeDecodeError:
            pass
    
    was_broken = True
    # Fix broken 3-byte sequences: \xe2\x80? -> em-dash \xe2\x80\x94
    fixed = data.replace(b"\xe2\x80?", b"\xe2\x80\x94")
    # Fix broken 2-byte sequences: \xc3? -> é \xc3\xa9
    fixed = fixed.replace(b"\xc3?", b"\xc3\xa9")
    
    try:
        text = fixed.decode("utf-8")
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        return (True, True)
    except UnicodeDecodeError:
        # More aggressive: replace invalid bytes
        text = fixed.decode("utf-8", errors="replace")
        with open(path, "w", encoding="utf-8", newline="") as f:
            f.write(text)
        return (True, True)

count = 0
fixed_count = 0
for root, dirs, files in os.walk("."):
    # Skip .git, .venv, node_modules, __pycache__
    dirs[:] = [d for d in dirs if d not in (".git", ".venv", "node_modules", "__pycache__", ".mypy_cache", ".ruff_cache", "graphify-out", "agent_meow.egg-info")]
    for fname in files:
        if fname.endswith((".py", ".toml", ".yaml", ".yml", ".md", ".json", ".cfg", ".ini", ".txt")):
            path = os.path.join(root, fname)
            was_broken, was_fixed = fix_file(path)
            if was_broken:
                count += 1
                if was_fixed:
                    fixed_count += 1
                    print(f"FIXED: {path}")

print(f"\nTotal broken files found: {count}")
print(f"Total files fixed: {fixed_count}")
