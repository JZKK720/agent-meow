"""Download Qwen3-ASR models for both K16 and R16 platforms.

K16 (Strix Halo 395): Qwen/Qwen3-ASR-1.7B (~4.7GB) - 52 languages, SOTA ASR
R16 (HX470 + RTX 5060): Qwen/Qwen3-ASR-0.6B (~1.9GB) - smaller for 8GB dGPU

Downloads via HuggingFace mirror (hf-mirror.com) for China mainland.
Alternative: modelscope download --model Qwen/Qwen3-ASR-1.7B --local_dir ./Qwen3-ASR-1.7B
"""

import os
import sys

# Set HF mirror for China before importing huggingface_hub
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

from huggingface_hub import snapshot_download

DOWNLOAD_DIR = os.path.join(os.path.expanduser("~"), "models")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

MODELS = [
    ("Qwen/Qwen3-ASR-1.7B", "K16 Strix Halo - 1.7B model, ~4.7GB"),
    ("Qwen/Qwen3-ASR-0.6B", "R16 HX470+5060 - 0.6B model, ~1.9GB"),
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
        path = snapshot_download(
            repo_id=model_id,
            local_dir=local_dir,
        )
        print(f"\nSUCCESS: {model_id} -> {path}")
    except Exception as e:
        print(f"\nFAILED: {model_id} - {e}")
    sys.stdout.flush()

print(f"\n{'=' * 60}")
print(f"Done. Models in: {DOWNLOAD_DIR}")
print(f"{'=' * 60}")
