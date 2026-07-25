"""Smoke-test: connect to watch-skill MCP server and list tools."""
import asyncio
import sys
from pathlib import Path
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    # Resolve absolute path to watch-skill.exe in the same venv
    venv_scripts = Path(sys.executable).parent
    watch_skill_bin = str(venv_scripts / "watch-skill.exe")
    print(f"Using: {watch_skill_bin}")
    params = StdioServerParameters(command=watch_skill_bin, args=["serve"])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print(f"Tools discovered: {len(tools.tools)}")
            for t in tools.tools:
                desc = (t.description or "")[:80]
                print(f"  - {t.name}: {desc}")


if __name__ == "__main__":
    asyncio.run(main())
