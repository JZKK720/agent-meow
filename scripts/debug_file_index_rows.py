"""Check the file-index pipeline: rows in DB + counts."""

import json
import sqlite3

DB = r"C:\Users\1\.agent-meow\chat.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM file_index")
print("file_index rows:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM file_meta")
print("file_meta rows:", cur.fetchone()[0])

cur.execute("PRAGMA table_info(file_index)")
print("file_index cols:", [r[1] for r in cur.fetchall()])

cur.execute("SELECT host_id, workspace, path, status FROM file_index LIMIT 10")
for row in cur.fetchall():
    print("  ", row)