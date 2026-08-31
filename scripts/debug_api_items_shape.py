"""Fetch the items EXACTLY as the runner receives them (via the HTTP API),
then run _convert_raw_items_to_input + the SDK converter to find the poison."""

import json
import os
import sys

os.environ.setdefault("HERMES_API_KEY", "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb")
BASE = "http://127.0.0.1:6767"
SESSION = "659738005ca3443ea9cf1bbc6feeff6a"


async def main() -> None:
    import httpx

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.get(f"{BASE}/v1/sessions/{SESSION}/items?limit=100&order=asc")
        data = r.json()
    items = data.get("data", []) if isinstance(data, dict) else data
    print(f"[api] {len(items)} items via HTTP", flush=True)
    print(f"[api] raw response top-level type: {type(data).__name__}", flush=True)
    if isinstance(data, dict):
        print(f"[api] response keys: {list(data.keys())}", flush=True)

    # Show the exact serialized shape of each item — INCLUDING non-dict items
    for idx, it in enumerate(items):
        if isinstance(it, dict):
            print(f"  [{idx}] dict type={it.get('type')} keys={sorted(it.keys())}", flush=True)
        else:
            print(f"  [{idx}] NON-DICT {type(it).__name__}: {str(it)[:300]}", flush=True)

    for it in items:
        if it.get("type") == "error":
            print("[api] ERROR item raw:", json.dumps(it, ensure_ascii=False, default=str)[:400], flush=True)
        if it.get("type") == "message":
            print("[api] MESSAGE item raw:", json.dumps(it, ensure_ascii=False, default=str)[:400], flush=True)
            break

    # Inline copy of _convert_raw_items_to_input's per-item branches
    # (runner/app.py:10830-10910) — the nested function isn't importable.
    converted: list = []
    for item in items:
        item_type = item.get("type")
        if item_type == "message":
            converted.append(
                {
                    "type": "message",
                    "role": item.get("role", "user"),
                    "content": item.get("content", []),
                }
            )
        elif item_type == "function_call":
            converted.append(
                {
                    "type": "function_call",
                    "call_id": item.get("call_id"),
                    "name": item.get("name"),
                    "arguments": item.get("arguments"),
                }
            )
        elif item_type == "function_call_output":
            converted.append(
                {
                    "type": "function_call_output",
                    "call_id": item.get("call_id"),
                    "output": item.get("output"),
                }
            )
        elif item_type == "error":
            message = item.get("message")
            code = item.get("code")
            source = item.get("source")
            converted.append(
                {
                    "type": "error",
                    "source": source if isinstance(source, str) and source else "execution",
                    "code": code if isinstance(code, str) and code else "error",
                    "message": (
                        message if isinstance(message, str) and message else "unknown error"
                    ),
                }
            )
    print(f"[convert] {len(converted)} converted items", flush=True)
    for c in converted[-3:]:
        print("  ", json.dumps(c, ensure_ascii=False, default=str)[:200], flush=True)

    # Now feed through the Agents SDK converter — the exact crash site
    from agents.models.chatcmpl_converter import Converter

    try:
        msgs = Converter.items_to_messages(converted)
        print(f"[sdk] converted OK — {len(msgs)} messages", flush=True)
    except Exception:
        import traceback

        print("[sdk] CONVERTER CRASH — traceback:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())