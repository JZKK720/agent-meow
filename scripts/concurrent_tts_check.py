"""One-shot check: fire 3 concurrent /tts requests, report wall time.

Sequential (pre-fix) would be ~3x single-request latency; parallel
(asyncio.to_thread fix) should be close to a single request latency.
"""
import asyncio
import json
import time
import urllib.request

URL = "http://127.0.0.1:8890/tts"


def synth(i: int) -> tuple[int, float]:
    body = json.dumps({
        "text": f"Concurrent synthesis test sentence number {i} for the GPU server.",
        "language": "english",
        "speaker": "vivian",
    }).encode()
    req = urllib.request.Request(
        URL, data=body, headers={"Content-Type": "application/json"}
    )
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=180) as resp:
        n = len(resp.read())
    return n, time.perf_counter() - t0


async def main() -> None:
    loop = asyncio.get_event_loop()
    t0 = time.perf_counter()
    results = await asyncio.gather(
        *[loop.run_in_executor(None, synth, i) for i in range(1, 4)]
    )
    wall = time.perf_counter() - t0
    for i, (n, dt) in enumerate(results, 1):
        print(f"req{i}: {n} bytes in {dt:.2f}s")
    print(f"WALL: {wall:.2f}s")
    singles = [dt for _, dt in results]
    print(f"sum of individual: {sum(singles):.2f}s")
    print(
        "VERDICT:",
        "PARALLEL (wall ~= max individual)"
        if wall < sum(singles) * 0.7
        else "SERIALIZED (wall ~= sum)",
    )


asyncio.run(main())
