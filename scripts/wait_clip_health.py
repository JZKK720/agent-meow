"""Poll clip server /health until the model is loaded (or timeout)."""

from __future__ import annotations

import time

import httpx

URL = "http://127.0.0.1:8893/health"
DEADLINE_S = 240


def main() -> None:
    deadline = time.time() + DEADLINE_S
    while time.time() < deadline:
        try:
            r = httpx.get(URL, timeout=3)
            if r.status_code == 200:
                data = r.json()
                print("HEALTH:", data)
                if data.get("loaded"):
                    print("READY")
                    return
                print("model still loading, waiting...")
        except Exception:  # noqa: BLE001 — server not up yet
            pass
        time.sleep(5)
    print("TIMEOUT")


if __name__ == "__main__":
    main()