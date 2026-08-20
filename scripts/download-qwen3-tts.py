"""Download Qwen3-TTS models for local offline TTS.

Downloads ONLY the 0.6B CustomVoice model (~2.5GB) + shared tokenizer
(~100MB) — the model the agent-meow Docker stack uses (see
deploy/docker/docker-compose.all-in-one.yaml QWEN3_TTS_MODEL_DIR).
The 1.7B variant is intentionally NOT downloaded: it triples the
download for marginal quality gain on CPU inference.

Downloads via HuggingFace mirror (hf-mirror.com) for China mainland.
Override with HF_ENDPOINT=https://huggingface.co elsewhere.
"""

import os
import sys

os.environ.setdefault("HF_ENDPOINT", "https://hf-mirror.com")
from huggingface_hub import snapshot_download

DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "models")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

MODELS = [
    ("Qwen/Qwen3-TTS-Tokenizer-12Hz", "Tokenizer (shared, ~100MB)"),
    ("Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice", "0.6B CustomVoice, ~2.5GB"),
]

print(f"HF_ENDPOINT: {os.environ.get('HF_ENDPOINT', '(default)')}")
sys.stdout.flush()

for model_id, description in MODELS:
    local_dir = os.path.join(DOWNLOAD_DIR, model_id.replace("/", "_"))
    print(f"\n{'=' * 60}")
    print(f"Downloading: {model_id}")
    print(f"Description: {description}")
    print(f"Target dir:  {local_dir}")
    print(f"{'=' * 60}")
    sys.stdout.flush()

    try:
        path = snapshot_download(repo_id=model_id, local_dir=local_dir)
        print(f"\nSUCCESS: {model_id} -> {path}")
    except Exception as e:
        print(f"\nFAILED: {model_id} - {e}")
    sys.stdout.flush()

print(f"\n{'=' * 60}")
print(f"Done. Models in: {DOWNLOAD_DIR}")
print(f"{'=' * 60}")
