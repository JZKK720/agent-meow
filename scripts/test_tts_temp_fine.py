"""Fine-tune TTS temperature: 0.4 vs 0.5 stability sweep."""
import os
from qwen_tts import Qwen3TTSModel

m = Qwen3TTSModel.from_pretrained(
    os.path.expanduser("~/models/Qwen_Qwen3-TTS-12Hz-0.6B-CustomVoice"),
    device_map="cuda:0",
    dtype="bfloat16",
)
text = "好的，我明白了，让我来帮你处理这个问题。今天天气不错。"
for temp in [0.4, 0.5]:
    durs = []
    for i in range(4):
        wavs, sr = m.generate_custom_voice(
            text=text, speaker="serena", language="Chinese",
            temperature=temp, top_p=0.85, top_k=50, repetition_penalty=1.05,
        )
        durs.append(len(wavs[0]) / sr)
    spread = max(durs) - min(durs)
    print(f"MARK temp={temp}: spread={spread:.2f}s durs={[f'{d:.1f}' for d in durs]}")
