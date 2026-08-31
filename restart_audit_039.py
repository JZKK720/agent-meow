"""Kill agent-meow server processes (both python trees), then start fresh."""
import subprocess
import time

out = subprocess.run(
    ["powershell", "-Command",
     "Get-CimInstance Win32_Process -Filter \"Name='python.exe'\" | "
     "Where-Object { $_.CommandLine -match 'agent_meow' } | "
     "ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"],
    capture_output=True, text=True)
print("kill rc:", out.returncode, out.stderr[:200])
time.sleep(2)

import os
import psutil
killed = []
for p in psutil.process_iter(["pid", "name", "cmdline"]):
    try:
        cl = " ".join(p.info["cmdline"] or [])
        if "agent_meow" in cl and p.info["name"] and "python" in p.info["name"].lower():
            p.kill()
            killed.append(p.info["pid"])
    except Exception:
        pass
print("psutil killed:", killed)
time.sleep(2)

# Start the server with the recipe env vars.
env = dict(os.environ)
env["HERMES_VOICE_URL"] = "http://127.0.0.1:8642"
env["HERMES_BASE_URL"] = "http://127.0.0.1:8642/v1"
env["HERMES_API_KEY"] = "3f0d6858ecbec71417f5907d78d2f6c2618e7f57d89c4ebc6e6a71efeb5bc5cb"
env["QWENTTS_SERVER_URL"] = "http://127.0.0.1:8891"
env["AGENT_MEOW_DICTATION_ENGINE"] = "whisper"
proc = subprocess.Popen(
    [r"C:\Users\1\github-pr\agent-meow\.venv\Scripts\python.exe", "-m", "agent_meow", "server", "start"],
    cwd=r"C:\Users\1\github-pr\agent-meow",
    env=env,
    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
)
print("server started pid:", proc.pid)

# Wait for health.
import urllib.request
for i in range(30):
    time.sleep(1)
    try:
        with urllib.request.urlopen("http://127.0.0.1:6767/health", timeout=3) as r:
            print("health:", r.read().decode())
            break
    except Exception:
        pass
else:
    print("server did not come up in 30s")