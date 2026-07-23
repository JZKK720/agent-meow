"""Debug alembic head resolution."""
from alembic.script import ScriptDirectory
from alembic.config import Config

cfg = Config("agent_meow/db/alembic.ini")
script = ScriptDirectory.from_config(cfg)

print("=== Heads ===")
for head in script.get_heads():
    print(f"  {head}")

print("\n=== Revisions with down_revision ===")
for rev in script.walk_revisions():
    print(f"  {rev.revision} <- {rev.down_revision}")
    if rev.revision in ("a1b2c3d4e5f7", "b1c2d3e4f5a7"):
        print(f"    (branches: {rev.branch_labels})")
