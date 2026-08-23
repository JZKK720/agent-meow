// Wake word list and matching logic — separated from hermesVoice.ts so
// hooks can import it without pulling in @ricky0123/vad-web and
// onnxruntime-web (which corrupt the module graph when loaded at
// import time alongside React).

// Both Chinese characters and transliterations, plus common homophone
// mis-transcriptions from faster-whisper: 橘宝 (jú bǎo) is frequently
// transcribed as 继绞/拘保/据报/去保/去吧 (all pronounced jù/jú/jī/qù bǎo/ba)
// because the model lacks disambiguation context for this proper noun.
// "去吧" (qù ba) was observed in live testing — whisper transcribed
// "橘宝" as "去吧" in multiple sessions.
// "橘猫" (jú māo, "orange cat") is an alternative wake word — the
// mascot is an orange cat, so users may naturally say "橘猫" too.
export const WAKE_WORDS = [
  "橘宝", "橘寶",
  "jubao", "ju bao",
  "橘猫", "橘貓",
  "继绞", "拘保", "据报", "去保", "去吧", "主宝", "与宝", "舉寶",
];

/** Check if a transcript contains any wake word. Exported for testing. */
export function containsWakeWord(transcript: string): boolean {
  const lower = transcript.toLowerCase().trim();
  return WAKE_WORDS.some((word) => lower.includes(word.toLowerCase()));
}
