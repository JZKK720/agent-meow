"""Stamp the alembic version to b1c2d3e4f8a9 (file_tags table already exists)."""
import sqlite3

db_path = r"C:\Users\1\.agent-meow\chat.db"
conn = sqlite3.connect(db_path)

# Check current version
current = conn.execute("SELECT version_num FROM alembic_version").fetchone()
print(f"Current alembic version: {current[0]}")

# Check if file_tags table exists
tables = [t[0] for t in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
if "file_tags" in tables:
    print("file_tags table already exists — stamping DB to b1c2d3e4f8a9")
    conn.execute("UPDATE alembic_version SET version_num = 'b1c2d3e4f8a9'")
    conn.commit()
    new_version = conn.execute("SELECT version_num FROM alembic_version").fetchone()
    print(f"New alembic version: {new_version[0]}")
else:
    print("file_tags table does NOT exist — run the migration instead.")

conn.close()
