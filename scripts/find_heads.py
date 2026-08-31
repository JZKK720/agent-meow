"""Find alembic migration heads by parsing migration files."""
import os
import re

versions_dir = os.path.join(os.path.dirname(__file__), "..", "agent_meow", "db", "migrations", "versions")
versions_dir = os.path.abspath(versions_dir)

revisions = {}  # rev -> down_revision
for f in sorted(os.listdir(versions_dir)):
    if not f.endswith(".py") or f.startswith("__"):
        continue
    path = os.path.join(versions_dir, f)
    content = open(path, encoding="utf-8").read()
    rev_m = re.search(r"^revision\s*=\s*['\"](.*?)['\"]", content, re.M)
    down_m = re.search(r"^down_revision\s*=\s*['\"](.*?)['\"]", content, re.M)
    if rev_m:
        rev = rev_m.group(1)
        down = down_m.group(1) if down_m else None
        revisions[rev] = down

# Find heads: revisions that are NOT a down_revision of any other revision
all_down_revs = {d for d in revisions.values() if d}
heads = [r for r in revisions if r not in all_down_revs]

print(f"Total migrations: {len(revisions)}")
print(f"Heads ({len(heads)}):")
for h in heads:
    print(f"  {h} (down_revision={revisions[h]})")

# Find the branching point
if len(heads) > 1:
    print("\nBranching detected! Migrations with these down_revisions:")
    for h in heads:
        print(f"  {h} -> down_revision={revisions[h]}")

    # Trace each head's chain back to root
    print("\nChain traces:")
    for h in heads:
        print(f"\n  Head {h}:")
        r = h
        depth = 0
        while r and depth < 20:
            down = revisions.get(r)
            print(f"    {r} <- {down}")
            r = down
            depth += 1

    # Find common ancestor
    def get_chain(rev):
        chain = set()
        r = rev
        while r and r in revisions:
            chain.add(r)
            r = revisions[r]
        return chain

    if len(heads) >= 2:
        chain1 = get_chain(heads[0])
        chain2 = get_chain(heads[1])
        common = chain1 & chain2
        if common:
            print(f"\n  Common ancestors: {common}")
        else:
            print("\n  No common ancestors found (completely separate chains)")

    print("\nFIX: Create a merge migration:")
    print(f"  uv run alembic merge -m 'merge_heads' {' '.join(heads)}")
    print("  Or manually create a migration with down_revision pointing to both heads.")
