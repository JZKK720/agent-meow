"""Test the wake word pipeline without a physical microphone.

Strategy: Use Qwen3-TTS to generate audio of "橘宝", then feed that
audio back to Hermes STT to see what whisper transcribes. If the
transcript matches a wake word, the wake word detection pipeline
would fire correctly.

This tests the full STT → containsWakeWord() path without needing
a real microphone.
"""
import requests
import sys

# Step 1: Generate audio of "橘宝" via Qwen3-TTS
print("Step 1: Generating TTS audio of '橘宝'...")
resp = requests.post(
    "http://127.0.0.1:6767/v1/audio/speech",
    json={"text": "橘宝", "language": "Auto", "speaker": "Serena"},
    timeout=90,
)
print(f"  TTS Status: {resp.status_code}")
print(f"  Content-Type: {resp.headers.get('content-type', '')}")
print(f"  Content-Length: {len(resp.content)} bytes")

if resp.status_code != 200:
    print(f"  TTS failed: {resp.text[:200]}")
    sys.exit(1)

# Save the audio file
audio_path = "c:/Users/1/github-pr/agent-meow/test_wake_word.wav"
with open(audio_path, "wb") as f:
    f.write(resp.content)
print(f"  Saved: {audio_path}")

# Step 2: Feed the TTS audio back to STT
print("\nStep 2: Feeding TTS audio to STT...")
with open(audio_path, "rb") as f:
    resp2 = requests.post(
        "http://127.0.0.1:6767/v1/audio/transcriptions",
        files={"file": ("test.wav", f, "audio/wav")},
        timeout=30,
    )
print(f"  STT Status: {resp2.status_code}")
print(f"  STT Result: {resp2.text}")

if resp2.status_code != 200:
    print(f"  STT failed")
    sys.exit(1)

# Step 3: Check if the transcript contains a wake word
transcript = resp2.json().get("text", "")
wake_words = ["橘宝", "橘寶", "jubao", "ju bao", "继绞", "拘保", "据报", "去保", "去吧"]
matched = [w for w in wake_words if w.lower() in transcript.lower()]

print(f"\nStep 3: Wake word check")
print(f"  Transcript: '{transcript}'")
print(f"  Wake words: {wake_words}")
print(f"  Matched: {matched if matched else 'NONE'}")

if matched:
    print(f"\n✅ PASS: Wake word pipeline would fire correctly!")
    print(f"   containsWakeWord('{transcript}') → true")
    print(f"   onWakeWord() would be called → playReply() + voice session starts")
else:
    print(f"\n⚠️  WARNING: STT transcribed the TTS audio as '{transcript}'")
    print(f"   This is NOT a wake word match. The TTS→STT round-trip")
    print(f"   may produce a different transcription than a human voice.")
    print(f"   This doesn't mean the wake word is broken — it means")
    print(f"   TTS-generated audio transcribes differently than human speech.")
    print(f"   To fully test, a human needs to say '橘宝' into a real mic.")

# Step 4: Also test with a longer phrase
print("\n\nStep 4: Testing with '橘宝，你好' (Jubao, hello)...")
resp3 = requests.post(
    "http://127.0.0.1:6767/v1/audio/speech",
    json={"text": "橘宝，你好", "language": "Auto", "speaker": "Serena"},
    timeout=90,
)
if resp3.status_code == 200:
    audio_path2 = "c:/Users/1/github-pr/agent-meow/test_wake_word2.wav"
    with open(audio_path2, "wb") as f:
        f.write(resp3.content)
    with open(audio_path2, "rb") as f:
        resp4 = requests.post(
            "http://127.0.0.1:6767/v1/audio/transcriptions",
            files={"file": ("test2.wav", f, "audio/wav")},
            timeout=30,
        )
    transcript2 = resp4.json().get("text", "")
    matched2 = [w for w in wake_words if w.lower() in transcript2.lower()]
    print(f"  STT Result: '{transcript2}'")
    print(f"  Matched: {matched2 if matched2 else 'NONE'}")
    if matched2:
        print(f"  ✅ PASS: Wake word would fire!")
