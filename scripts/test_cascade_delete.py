"""Test cascade delete for session resource stores."""
from agent_meow.stores.session_project_store.sqlalchemy_store import (
    SqlAlchemySessionProjectStore,
)

s = SqlAlchemySessionProjectStore("sqlite:///C:/Users/1/.omnigent/chat.db")

# Create a project
p = s.add("conv_test_cascade", "TestProject")
print(f"Created project: {p.id} {p.name}")

# Verify it exists
items = s.list_for_conversation("conv_test_cascade")
print(f"Before delete: {len(items)} projects")
assert len(items) == 1

# Cascade delete
s.delete_for_conversation("conv_test_cascade")

# Verify it's gone
items2 = s.list_for_conversation("conv_test_cascade")
print(f"After delete: {len(items2)} projects")
assert len(items2) == 0

print("CASCADE DELETE OK")