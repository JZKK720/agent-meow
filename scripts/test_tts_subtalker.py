"""Tune the subtalker (prosody/emotion planner) sampling params.

The subtalker defaults (temperature=0.9, top_p=1.0) are as wild as the
main talker's were — its randomness surfaces as mid-sentence emotion and
tune changes. Sweep subtalker temperatures with the main talker pinned
at the tuned 0.5.
"""
import os
from qwen_tts import Qwen3TTSModel

m = Qwen3TTSModel.from_pretrained(
    os.path.expanduser("~/models/Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice"),
    device_map="cuda:0",
    dtype="bfloat16",
)
text = "好的，我明白了，让我来帮你处理这个问题。今天天气不错，我们出去走走吧。"
for st in [0.3, 0.5, 0.9]:
    durs = []
    for i in range(3):
        wavs, sr = m.generate_custom_voice(
            text=text, speaker="serena", language="Chinese",
            temperature=0.5, top_p=0.85, top_k=50, repetition_penalty=1.05,
            subtalker_temperature=st, subtalker_top_p=0.85, subtalker_top_k=50,
        )
        durs.append(len(wavs[0]) / sr)
    spread = max(durs) - min(durs)
    print(f"MARK subtalker_temp={st}: spread={spread:.2f}s durs={[f'{d:.1f}' for d in durs]}")
