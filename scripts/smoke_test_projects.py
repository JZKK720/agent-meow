"""Quick smoke test for SessionProjectStore CRUD."""
import os
from agent_meow.stores.session_project_store.sqlalchemy_store import (
    SqlAlchemySessionProjectStore,
)

db = "test_projects_smoke.db"
s = SqlAlchemySessionProjectStore(f"sqlite:///{db}")

# Create
p = s.add("conv_test", "Test Project", description="Smoke test")
print(f"Created: {p.id} {p.name} {p.status}")

# List
items = s.list_for_conversation("conv_test")
assert len(items) == 1, f"expected 1, got {len(items)}"
print(f"Listed: {len(items)} projects")

# Get
g = s.get(p.id, "conv_test")
assert g is not None
print(f"Got: {g.name}")

# Update
u = s.update(p.id, "conv_test", status="completed")
assert u is not None
print(f"Updated: {u.status}")

# Delete
d = s.delete(p.id, "conv_test")
assert d is not None
print(f"Deleted: {d.name}")

items2 = s.list_for_conversation("conv_test")
assert len(items2) == 0
print(f"After delete: {len(items2)} projects")

os.remove(db)
print("ALL PASS")