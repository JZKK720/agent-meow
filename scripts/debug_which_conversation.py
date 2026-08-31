"""Dump the drawio session's items (binary conversation_id) — find the poison item."""

import json
import sqlite3

DB = r"C:\Users\1\.agent-meow\chat.db"
conn = sqlite3.connect(DB)
cur = conn.cursor()

# Find the conversation by title fragment
cur.execute("SELECT id, title FROM conversations WHERE title LIKE ?", ("%drawio%",))
rows = cur.fetchall()
print("matched conversations:", len(rows))
cid = rows[0][0]

cur.execute(
    "SELECT position, type, status, data FROM conversation_items "
    "WHERE conversation_id = ? ORDER BY position",
    (cid,),
)
items = cur.fetchall()
print(f"items: {len(items)}")

for pos, typ, status, data in items:
    try:
        d = json.loads(data)
    except Exception:
        d = {"RAW": str(data)[:150]}
    shape = {"pos": pos, "type": typ}
    if isinstance(d, dict):
        content = d.get("content")
        if isinstance(content, str):
            shape["content"] = "str:" + content[:50]
        elif isinstance(content, list):
            parts = []
            for b in content:
                if isinstance(b, dict):
                    parts.append("dict:" + str(sorted(b.keys())[:6]))
                else:
                    parts.append(f"NON-DICT<{type(b).__name__}>:" + str(b)[:60])
            shape["content"] = parts
        elif content is not None:
            shape["content"] = f"{type(content).__name__}:{str(content)[:60]}"
        else:
            shape["content"] = None
    print(json.dumps(shape, ensure_ascii=False, default=str)[:400])