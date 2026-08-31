"""Inspect the live chat.db FTS schema."""
import sqlite3

c = sqlite3.connect(r"C:\Users\1\.agent-meow\chat.db")
rows = c.execute(
    "SELECT name, sql FROM sqlite_master WHERE name LIKE 'file_index_fts%' OR name LIKE '%fts'"
).fetchall()
for n, s in rows:
    print(n, "|", (s or "")[:160])
print()
# Alembic version
print("alembic:", c.execute("SELECT version_num FROM alembic_version").fetchall())