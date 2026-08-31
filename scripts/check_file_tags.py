"""Check if file_tags table exists in the server DB."""
import sqlite3

db_path = r"C:\Users\1\.agent-meow\chat.db"
conn = sqlite3.connect(db_path)
tables = [t[0] for t in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)
print("file_tags exists:", "file_tags" in tables)
if "file_tags" not in tables:
    print("\nfile_tags table is MISSING — migration not applied yet.")
    print("Run: $env:AGENT_MEOW_DB_URL = 'sqlite:///C:/Users/1/.agent-meow/chat.db'; uv run alembic upgrade head")
else:
    cols = conn.execute("PRAGMA table_info(file_tags)").fetchall()
    print("\nfile_tags columns:", [(c[1], c[2]) for c in cols])
conn.close()
