"""Fix unterminated string literals caused by em-dash encoding corruption.

The pattern: a 3-byte UTF-8 sequence (em-dash, en-dash, etc.) had its 3rd byte
replaced with '?', and our fix replaced \xe2\x80? with \xe2\x80\x94 (em-dash —).
But in some cases the original was \xe2\x80\x94" (em-dash + closing quote) or
similar, and the quote got lost. This script finds lines with unterminated
strings and adds the missing closing quote.
"""
import re
import os

# Files and line numbers from check_syntax.py output
fixes = [
    ("agent_meow/claude_native.py", 1018),
    ("agent_meow/cli.py", 7022),
    ("agent_meow/cli_config.py", 3270),
    ("agent_meow/crash_ui.py", 253),
    ("agent_meow/db/utils.py", 1003),
    ("agent_meow/inner/hermes_executor.py", 82),
    ("agent_meow/onboarding/interactive.py", 82),
    ("agent_meow/onboarding/wizard.py", 716),
    ("agent_meow/repl/_repl.py", 325),
    ("agent_meow/server/background_session_titles.py", 56),
    ("agent_meow/server/routes/sessions.py", 5952),
    ("agent_meow/stores/conversation_store/sqlalchemy_store.py", 3237),
]

for filepath, lineno in fixes:
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    idx = lineno - 1  # 0-based
    if idx >= len(lines):
        print(f"SKIP {filepath}:{lineno} (out of range)")
        continue

    line = lines[idx]
    print(f"BEFORE {filepath}:{lineno}: {line.rstrip()!r}")

    # The em-dash — at end of line likely ate a closing quote.
    # Strategy: if the line ends with —\n (em-dash then newline), add a closing quote.
    # Check what kind of quote is needed by counting unmatched quotes.
    # Simple fix: if line ends with em-dash, append a double quote before the newline.
    stripped = line.rstrip('\n').rstrip('\r')

    # Check if it ends with em-dash
    if stripped.endswith('—'):
        # Count double quotes (excluding escaped ones)
        dq_count = stripped.count('"') - stripped.count('\\"')
        sq_count = stripped.count("'") - stripped.count("\\'")
        # If odd number of double quotes, add a closing double quote
        if dq_count % 2 == 1:
            stripped += '"'
        elif sq_count % 2 == 1:
            stripped += "'"
        else:
            # Check for f-string with unmatched parens
            # Just add a double quote as default
            stripped += '"'
        lines[idx] = stripped + '\n'
        print(f"AFTER  {filepath}:{lineno}: {lines[idx].rstrip()!r}")
    else:
        # Check for em-dash followed by other chars
        # Try to find the em-dash and fix after it
        print(f"  (doesn't end with em-dash, checking...)")

    with open(filepath, "w", encoding="utf-8", newline="") as f:
        f.writelines(lines)

print("\nDone. Re-run check_syntax.py to verify.")
