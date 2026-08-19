/**
 * Shared singleton for the "Read aloud" HTMLAudioElement playback.
 *
 * Both ChatPage.tsx (speakText) and useRealtimeVoice.ts (voice-conversation
 * TTS via Web Audio API) import this so the two audio systems can stop
 * each other — preventing overlapping playback when the user clicks
 * "Read aloud" while a voice turn is streaming, or starts a voice turn
 * while a Read-aloud clip is playing.
 */

let _currentAudio: HTMLAudioElement | null = null;

/** Stop the active Read-aloud playback, if any. Safe to call any time. */
export function stopReadAloud(): void {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
}

/** Register the active Read-aloud audio element. Returns a revoke helper. */
export function setReadAloudAudio(audio: HTMLAudioElement): () => void {
  // Stop any prior clip before replacing.
  stopReadAloud();
  _currentAudio = audio;
  return () => {
    if (_currentAudio === audio) _currentAudio = null;
  };
}