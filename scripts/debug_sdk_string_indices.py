"""Reproduce: OpenAI Agents SDK error 'string indices must be integers, not 'str'.

Minimal probe: run the Agents SDK ChatCompletionsModel against the local Hermes
gateway exactly the way openai_agents_sdk_executor.py does, and print the FULL
traceback of any failure. The gateway returns HTTP 200, so the crash happens
while the SDK parses the streamed chunks — this script surfaces where.
"""

import asyncio
import os
import sys

os.environ.setdefault("HERMES_API_KEY", "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb")

from openai import AsyncOpenAI
from agents import Agent, Runner


async def main() -> None:
    client = AsyncOpenAI(
        api_key=os.environ["HERMES_API_KEY"],
        base_url="http://127.0.0.1:8642/v1",
    )
    agent = Agent(
        name="agent-meow",
        instructions="你是橘宝，一只活泼可爱的AI猫咪助手。回复要简洁。",
        model=agent_meow_model(),
        tools=[],
        tool_use_behavior="run_llm_again",
    )
    print("[probe] streaming via Runner.run_streamed (executor-style config)...", flush=True)
    try:
        result = Runner.run_streamed(agent, "你好，请简单回复一句话测试")
        async for _ in result.stream_events():
            pass
        print("[probe] OK:", result.final_output)
    except Exception:
        import traceback

        print("[probe] FAILED with traceback:", flush=True)
        traceback.print_exc()
        sys.exit(1)


def agent_meow_model():
    """Build the same model wrapper the executor uses (ChatCompletions via env base_url)."""
    from agents import OpenAIChatCompletionsModel
    from agents import set_default_openai_client

    client = AsyncOpenAI(
        api_key=os.environ["HERMES_API_KEY"],
        base_url="http://127.0.0.1:8642/v1",
    )
    set_default_openai_client(client, use_for_tracing=False)
    model = OpenAIChatCompletionsModel(model="auto", openai_client=client)
    return model


if __name__ == "__main__":
    asyncio.run(main())