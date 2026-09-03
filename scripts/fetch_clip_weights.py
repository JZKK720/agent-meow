"""Direct streaming download of CLIP weights into the HF cache layout.

hf_hub_download stalls at 0 bytes on this network (HEAD works, GET via the
hub client hangs) — a plain httpx stream works, so fetch the blob manually
and place it where the cache expects it: blobs/<sha256> + snapshot symlink
file with the metadata pointers (refs/, .no_exist handled by hub itself on
next load since the blob's etag name is its sha256).
"""

from __future__ import annotations

import hashlib
import os
import tempfile
from pathlib import Path

import httpx

URL = "https://huggingface.co/openai/clip-vit-base-patch32/resolve/main/pytorch_model.bin"
REPO_DIR = Path.home() / ".cache/huggingface/hub/models--openai--clip-vit-base-patch32"
BLOB_NAME = "a63082132ba4f97a80bea76823f544493bffa8082296d62d71581a4feff1576f"


def main() -> None:
    blobs = REPO_DIR / "blobs"
    blobs.mkdir(parents=True, exist_ok=True)
    dest = blobs / BLOB_NAME
    if dest.exists() and dest.stat().st_size > 600_000_000:
        print("already present:", dest)
        return
    tmp = Path(tempfile.mktemp(suffix=".bin"))
    sha = hashlib.sha256()
    total = 0
    print("streaming", URL)
    with httpx.stream("GET", URL, follow_redirects=True, timeout=60) as r:
        r.raise_for_status()
        with open(tmp, "wb") as fh:
            for chunk in r.iter_bytes(1 << 20):
                fh.write(chunk)
                sha.update(chunk)
                total += len(chunk)
                if total % (100 << 20) < (1 << 20):
                    print(f"  {total / 1e6:.0f} MB...", flush=True)
    digest = sha.hexdigest()
    print(f"downloaded {total} bytes, sha256={digest}")
    os.replace(tmp, dest)
    print("placed at", dest)


if __name__ == "__main__":
    main()