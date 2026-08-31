"""Reproduce with the SESSION'S REAL HISTORY — probe the SDK crash directly.

Loads the drawio session's persisted items, converts them the way the
executor does (messages → responses items → chat normalization), runs the
Agents SDK against Hermes with that input, and prints the full traceback.
"""

import json
import os
import sqlite3
import sys

os.environ.setdefault("HERMES_API_KEY", "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb")

from openai import AsyncOpenAI

DB = r"C:\Users\1\.agent-meow\chat.db"


def load_history() -> list[dict]:
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute("SELECT id FROM conversations WHERE title LIKE ?", ("%drawio%",))
    cid = cur.fetchone()[0]
    cur.execute(
        "SELECT data FROM conversation_items WHERE conversation_id=? ORDER BY position",
        (cid,),
    )
    items = []
    for (data,) in cur.fetchall():
        d = json.loads(data)
        items.append(d)
    return items


async def main() -> None:
    from agents import Agent, Runner, OpenAIChatCompletionsModel, set_default_openai_client

    client = AsyncOpenAI(
        api_key=os.environ["HERMES_API_KEY"],
        base_url="http://127.0.0.1:8642/v1",
    )
    set_default_openai_client(client, use_for_tracing=False)
    model = OpenAIChatCompletionsModel(model="hermes-agent", openai_client=client)

    history = load_history()
    print(f"[probe] loaded {len(history)} history items", flush=True)

    # Rebuild the message list the way the runtime does: keep role+content.
    messages = []
    for item in history:
        if "role" in item and "content" in item:
            messages.append({"role": item["role"], "content": item["content"]})
    print(f"[probe] {len(messages)} role-bearing items → replay input", flush=True)

    # Convert via the project's own converter — same path the executor uses.
    from agent_meow.inner.open_responses_sdk import _convert_messages_to_responses

    responses_items = _convert_messages_to_responses(messages)
    for it in responses_items:
        print("  replay:", json.dumps(it, ensure_ascii=False, default=str)[:160])
    print(f"[probe] {len(responses_items)} converted items", flush=True)

    # Add the ERROR item exactly as _convert_raw_items_to_input emits it
    # (runner/app.py:10892) — the persisted type-5 items replay as this.
    responses_items.append(
        {
            "type": "error",
            "source": "execution",
            "code": "error",
            "message": "inner executor error: OpenAI Agents SDK error: string indices must be integers, not 'str'",
        }
    )
    print("[probe] appended error item → testing SDK tolerance", flush=True)

    agent = Agent(
        name="agent-meow",
        instructions="你是橘宝。",
        model=model,
        tools=[],
        tool_use_behavior="run_llm_again",
    )
    # Mirror the executor's ModelSettings — the merged max_tokens cap
    # (79dc6d61d: extra.max_tokens=8192 in hermes-gateway config.yaml).
    from agents import ModelSettings

    agent.model_settings = ModelSettings(max_tokens=8192, parallel_tool_calls=None)
    print("[probe] running with session history + max_tokens=8192 ...", flush=True)
    try:
        result = Runner.run_streamed(agent, input=responses_items)
        async for _ in result.stream_events():
            pass
        print("[probe] OK:", str(result.final_output)[:120])
    except Exception:
        import traceback

        print("[probe] FAILED — traceback:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())