"""Where did the drawio conversation go? List all titles + journal mode."""

import sqlite3

DB = r"C:\Users\1\.agent-meow\chat.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()
cur.execute("SELECT title, created_at FROM conversations ORDER BY created_at")
for title, created in cur.fetchall():
    print(created, "|", (title or "(untitled)")[:50])
cur.execute("PRAGMA journal_mode")
print("journal_mode:", cur.fetchone()[0])