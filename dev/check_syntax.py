"""Find Python files with syntax errors after the encoding fix."""
import py_compile
import os
import sys

errors = []
for root, dirs, files in os.walk("agent_meow"):
    dirs[:] = [d for d in dirs if d not in ("__pycache__",)]
    for fname in files:
        if fname.endswith(".py"):
            path = os.path.join(root, fname)
            try:
                py_compile.compile(path, doraise=True)
            except py_compile.PyCompileError as e:
                errors.append((path, str(e)))

print(f"Syntax errors found: {len(errors)}")
for path, err in errors[:20]:
    # Get just the relevant line
    lines = err.split('\n')
    short = [l for l in lines if 'SyntaxError' in l or 'line' in l.lower()]
    print(f"  {path}: {' | '.join(short[:2])}")
