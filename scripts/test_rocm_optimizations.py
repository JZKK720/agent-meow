"""Test torch.compile and flash attention on ROCm for Qwen3-TTS."""
import torch
import time
import sys

print(f"torch: {torch.__version__}")
print(f"Device: {torch.cuda.get_device_name(0)}")
print(f"ROCm: {torch.version.hip}")
print()

# Test 1: torch.compile
print("=== Test 1: torch.compile ===")

class SimpleModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = torch.nn.Linear(1024, 1024).cuda()

    def forward(self, x):
        return self.linear(x).relu()

model = SimpleModel()
x = torch.randn(1, 1024, device="cuda")

# Baseline (no compile)
torch.cuda.synchronize()
t0 = time.time()
for _ in range(100):
    _ = model(x)
torch.cuda.synchronize()
baseline = time.time() - t0
print(f"Baseline (no compile): {baseline:.3f}s for 100 calls")

# With torch.compile
try:
    compiled = torch.compile(model, mode="reduce-overhead")
    # Warmup (first calls trigger compilation)
    for _ in range(5):
        _ = compiled(x)
    torch.cuda.synchronize()

    t0 = time.time()
    for _ in range(100):
        _ = compiled(x)
    torch.cuda.synchronize()
    compiled_time = time.time() - t0
    print(f"torch.compile (reduce-overhead): {compiled_time:.3f}s for 100 calls")
    print(f"Speedup: {baseline/compiled_time:.2f}x")
    print("torch.compile: WORKS on ROCm")
except Exception as e:
    print(f"torch.compile FAILED: {type(e).__name__}: {e}")

print()

# Test 2: Flash attention via SDPA
print("=== Test 2: Flash Attention via SDPA ===")
from torch.nn.attention import sdpa_kernel, SDPBackend

q = torch.randn(1, 8, 128, 64, device="cuda", dtype=torch.bfloat16)
k = torch.randn(1, 8, 128, 64, device="cuda", dtype=torch.bfloat16)
v = torch.randn(1, 8, 128, 64, device="cuda", dtype=torch.bfloat16)

# Math backend (baseline)
with sdpa_kernel(SDPBackend.MATH):
    torch.cuda.synchronize()
    t0 = time.time()
    for _ in range(1000):
        _ = torch.nn.functional.scaled_dot_product_attention(q, k, v)
    torch.cuda.synchronize()
    math_time = time.time() - t0
    print(f"MATH backend: {math_time:.3f}s for 1000 calls")

# Flash attention backend
with sdpa_kernel(SDPBackend.FLASH_ATTENTION):
    torch.cuda.synchronize()
    t0 = time.time()
    for _ in range(1000):
        _ = torch.nn.functional.scaled_dot_product_attention(q, k, v)
    torch.cuda.synchronize()
    flash_time = time.time() - t0
    print(f"FLASH_ATTENTION backend: {flash_time:.3f}s for 1000 calls")
    print(f"Speedup: {math_time/flash_time:.2f}x")

# CUDNN attention backend
with sdpa_kernel(SDPBackend.CUDNN_ATTENTION):
    torch.cuda.synchronize()
    t0 = time.time()
    for _ in range(1000):
        _ = torch.nn.functional.scaled_dot_product_attention(q, k, v)
    torch.cuda.synchronize()
    cudnn_time = time.time() - t0
    print(f"CUDNN_ATTENTION backend: {cudnn_time:.3f}s for 1000 calls")
    print(f"Speedup vs MATH: {math_time/cudnn_time:.2f}x")

print()
print("=== Summary ===")
print(f"torch.compile: {'WORKS' if 'compiled_time' in dir() else 'FAILED'}")
print(f"Flash Attention (SDPA): WORKS ({math_time/flash_time:.2f}x faster than MATH)")
print(f"CUDNN Attention (SDPA): WORKS ({math_time/cudnn_time:.2f}x faster than MATH)")
