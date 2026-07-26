"""Smoke test for LLM Wiki MCP server — lists tools via stdio."""
import json
import subprocess
import sys

proc = subprocess.Popen(
    ["node", "C:/Users/1/github-pr/llm_wiki/mcp-server/dist/src/index.js"],
    stdin=subprocess.PIPE,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
)

# Send initialize request
init = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "smoke-test", "version": "1.0"},
    },
}
proc.stdin.write(json.dumps(init) + "\n")
proc.stdin.flush()

# Read response
line = proc.stdout.readline()
resp = json.loads(line)
print(f"Server: {resp.get('result', {}).get('serverInfo', {})}")

# Send initialized notification
proc.stdin.write(json.dumps({"jsonrpc": "2.0", "method": "notifications/initialized"}) + "\n")
proc.stdin.flush()

# List tools
list_tools = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
proc.stdin.write(json.dumps(list_tools) + "\n")
proc.stdin.flush()

line = proc.stdout.readline()
resp = json.loads(line)
tools = resp.get("result", {}).get("tools", [])
print(f"\nDiscovered {len(tools)} tools:")
for t in tools:
    print(f"  - {t['name']}: {t.get('description', '')[:80]}")

proc.terminate()
print("\nALL PASS")