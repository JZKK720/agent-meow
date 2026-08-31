"""Dump conversation_items.data for the failing session — find the poison item."""

import json
import sqlite3

SESSION = "659738005ca3443ea9cf1bbc6feeff6a"
DB = r"C:\Users\1\.agent-meow\chat.db"

conn = sqlite3.connect(DB)
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM conversation_items")
print("total conversation_items:", cur.fetchone()[0])

cur.execute(
    "SELECT id, position, type, status, data FROM conversation_items "
    "WHERE conversation_id = ? ORDER BY position",
    (SESSION,),
)
rows = cur.fetchall()
print(f"items for session: {len(rows)}")

for rid, pos, typ, status, data in rows:
    try:
        d = json.loads(data)
    except Exception:
        d = {"RAW": data[:200] if isinstance(data, str) else str(data)[:200]}
    # Show type + the SHAPE of the content (keys/types, not full text)
    shape = {"pos": pos, "type": typ, "status": status}
    if isinstance(d, dict):
        shape["keys"] = list(d.keys())
        content = d.get("content")
        if content is not None:
            if isinstance(content, str):
                shape["content"] = "str:" + content[:60]
            elif isinstance(content, list):
                shape["content"] = [
                    (b.get("type") if isinstance(b, dict) else type(b).__name__) + (
                        ":" + b.get("text", "")[:40] if isinstance(b, dict) and isinstance(b.get("text"), str) else ""
                    )
                    for b in content
                ]
            else:
                shape["content"] = f"{type(content).__name__}: {str(content)[:80]}"
    print(json.dumps(shape, ensure_ascii=False, default=str)[:500])