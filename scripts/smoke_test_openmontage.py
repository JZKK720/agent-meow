"""Smoke test for OpenMontage + ffmpeg pipeline."""
import subprocess
import sys
import os
import tempfile

OPENMONTAGE = r"C:\Users\1\github-pr\OpenMontage"

# 1. Verify ffmpeg
r = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True)
assert r.returncode == 0, "ffmpeg not found"
print(f"ffmpeg: {r.stdout.splitlines()[0][:60]}")

# 2. Verify ffprobe
r = subprocess.run(["ffprobe", "-version"], capture_output=True, text=True)
assert r.returncode == 0, "ffprobe not found"
print(f"ffprobe: {r.stdout.splitlines()[0][:60]}")

# 3. Generate a 2-second test video
test_video = os.path.join(tempfile.gettempdir(), "om_smoke_test.mp4")
r = subprocess.run(
    [
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", "testsrc=duration=2:size=320x240:rate=10",
        "-f", "lavfi", "-i", "sine=frequency=440:duration=2",
        "-c:v", "libx264", "-c:a", "aac",
        "-pix_fmt", "yuv420p",
        test_video,
    ],
    capture_output=True, text=True,
)
assert r.returncode == 0, f"ffmpeg encode failed: {r.stderr[-300:]}"
size = os.path.getsize(test_video)
print(f"Generated test video: {size} bytes")

# 4. Probe it
r = subprocess.run(
    ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", test_video],
    capture_output=True, text=True,
)
assert r.returncode == 0, "ffprobe failed"
import json
info = json.loads(r.stdout)
duration = float(info["format"]["duration"])
streams = len(info["streams"])
print(f"Probed: duration={duration:.1f}s, streams={streams}")

# 5. Verify OpenMontage tools importable
sys.path.insert(0, OPENMONTAGE)
import tools.video.video_trimmer  # noqa: F401
import tools.analysis.video_analyzer  # noqa: F401
print("OpenMontage tools importable: OK")

# 6. Cleanup
os.remove(test_video)
print("\nALL PASS")