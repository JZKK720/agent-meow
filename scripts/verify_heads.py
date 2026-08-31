"""Verify alembic sees a single head after the merge migration."""
import os
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(REPO_ROOT)
sys.path.insert(0, REPO_ROOT)

from alembic.config import Config
from alembic.script import ScriptDirectory

cfg = Config(os.path.join(REPO_ROOT, "agent_meow", "db", "alembic.ini"))
cfg.set_main_option("script_location", os.path.join(REPO_ROOT, "agent_meow", "db", "migrations"))
script = ScriptDirectory.from_config(cfg)
heads = script.get_heads()
print(f"Alembic heads: {heads}")
print(f"Head count: {len(heads)}")
if len(heads) == 1:
    print("SUCCESS: Single head — merge resolved the branching.")
else:
    print(f"FAILURE: {len(heads)} heads still exist — merge did not work.")
    for h in heads:
        print(f"  {h}")
