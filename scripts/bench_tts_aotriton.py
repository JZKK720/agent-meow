"""Benchmark Qwen3-TTS with and without AOTRITON flash attention."""
import os
import sys
import time
import io
import soundfile as sf
import numpy as np

# Test texts of varying length
TESTS = [
    ("short-5", "你好世界。"),
    ("medium-15", "今天天气很好，我们一起去公园散步吧。"),
    ("medium-30", "这是一个比较长的句子，用来测试延迟表现和音频质量。"),
]

def run_benchmark(label):
    """Run benchmark with current env settings."""
    import torch
    from qwen_tts import Qwen3TTSModel

    model_dir = r"C:\Users\1\models\Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice"
    print(f"\n=== {label} ===")
    print(f"TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL = {os.environ.get('TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL', 'not set')}")

    model = Qwen3TTSModel.from_pretrained(model_dir, device_map="cuda:0", dtype=torch.bfloat16)

    # Warmup
    print("Warming up...")
    model.generate_custom_voice(text="你好。", speaker="Serena", language="Auto",
                                 temperature=0.5, top_p=0.85, top_k=50, repetition_penalty=1.05)
    torch.cuda.synchronize()

    results = []
    for name, text in TESTS:
        times = []
        for _ in range(3):
            torch.cuda.empty_cache()
            torch.cuda.synchronize()
            t0 = time.time()
            wavs, sr = model.generate_custom_voice(
                text=text, speaker="Serena", language="Auto",
                temperature=0.5, top_p=0.85, top_k=50, repetition_penalty=1.05,
            )
            torch.cuda.synchronize()
            t1 = time.time()
            dur = len(wavs[0]) / sr
            times.append(t1 - t0)

        avg = sum(times) / len(times)
        ratio = avg / dur
        print(f"  {name:12s} ({len(text):2d} chars): avg={avg:.2f}s  audio={dur:.2f}s  ratio={ratio:.2f}x  times={[f'{t:.2f}' for t in times]}")
        results.append((name, avg, dur, ratio))

    del model
    torch.cuda.empty_cache()
    return results

if __name__ == "__main__":
    # Test 1: WITHOUT AOTRITON (math attention)
    os.environ.pop("TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL", None)
    results_no_aotriton = run_benchmark("WITHOUT AOTRITON (MATH attention)")

    # Test 2: WITH AOTRITON (flash attention)
    os.environ["TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL"] = "1"
    results_with_aotriton = run_benchmark("WITH AOTRITON (Flash attention)")

    # Summary
    print("\n=== SUMMARY ===")
    print(f"{'Test':20s} {'No AOTRITON':>12s} {'With AOTRITON':>14s} {'Speedup':>8s}")
    print("-" * 58)
    for (name, avg_no, dur, ratio_no), (_, avg_yes, _, ratio_yes) in zip(results_no_aotriton, results_with_aotriton):
        speedup = avg_no / avg_yes
        print(f"{name:20s} {avg_no:>10.2f}s   {avg_yes:>12.2f}s   {speedup:>6.2f}x")
