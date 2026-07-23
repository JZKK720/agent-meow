"""Check alembic migration path and head resolution."""
import sys

# Check if the omnigent compat shim causes duplicate migration discovery
import agent_meow.db.migrations.versions as v
print(f"agent_meow.db.migrations.versions __path__: {list(v.__path__)}")

try:
    import omnigent.db.migrations.versions as ov
    print(f"omnigent.db.migrations.versions __path__: {list(ov.__path__)}")
except Exception as e:
    print(f"omnigent.db.migrations.versions: {e}")

# Check the alembic script location
from alembic.config import Config
cfg = Config("agent_meow/db/alembic.ini")
print(f"script_location: {cfg.get_main_option('script_location')}")
