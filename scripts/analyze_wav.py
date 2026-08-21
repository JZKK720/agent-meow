"""Analyze a WAV for silence gaps and beep-like loud bursts."""
import sys
import wave
import struct
import math

path = sys.argv[1]
w = wave.open(path, "rb")
sr = w.getframerate()
n = w.getnframes()
print(f"sr={sr} duration={n/sr:.1f}s")
samples = struct.unpack(f"<{n}h", w.readframes(n))
win = sr // 10  # 100ms
merged = []
loud = []
for i in range(0, len(samples) - win, win):
    chunk = samples[i:i + win]
    rms = math.sqrt(sum(x * x for x in chunk) / len(chunk))
    t = i / sr
    if rms < 100:
        if merged and abs(t - merged[-1][1]) < 0.01:
            merged[-1] = (merged[-1][0], t + win / sr)
        else:
            merged.append((t, t + win / sr))
    if rms > 20000:
        loud.append((round(t, 1), int(rms)))
print("silence gaps >0.3s:", [(round(a, 1), round(b, 1)) for a, b in merged if b - a > 0.3])
print("very loud windows (beep suspects):", loud[:10])
