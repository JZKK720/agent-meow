/**
 * Shared singleton for the "Read aloud" HTMLAudioElement playback.
 *
 * Both ChatPage.tsx (speakText) and useRealtimeVoice.ts (voice-conversation
 * TTS via Web Audio API) import this module. The priority is one-way:
 * voice TTS is the primary audio and stops Read-aloud playback when it
 * starts (useRealtimeVoice playback.started → stopReadAloud). Read aloud
 * is a review feature for past messages and does NOT interrupt voice TTS
 * streaming — see speakText in ChatPage.tsx.
 */

let _currentAudio: HTMLAudioElement | null = null;
let _readAloudAbort: AbortController | null = null;

/** Stop the active Read-aloud playback, if any. Safe to call any time.
 *  Also aborts the speakText loop so pending fetches are cancelled and
 *  no new chunk plays after the stop. */
export function stopReadAloud(): void {
  if (_readAloudAbort) {
    _readAloudAbort.abort();
    _readAloudAbort = null;
  }
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
}

/** Register the active Read-aloud audio element. Returns a revoke helper.
 *  Does NOT abort the speakText loop — only replaces the audio element
 *  so the next chunk's playback doesn't overlap with the prior one. */
export function setReadAloudAudio(audio: HTMLAudioElement): () => void {
  // Pause any prior clip before replacing (but don't abort the loop).
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio = null;
  }
  _currentAudio = audio;
  return () => {
    if (_currentAudio === audio) _currentAudio = null;
  };
}

/** Begin a read-aloud session. Returns an AbortSignal that speakText
 *  passes to each fetch so stopReadAloud cancels in-flight requests. */
export function beginReadAloud(): AbortSignal {
  // Stop any prior session first.
  stopReadAloud();
  _readAloudAbort = new AbortController();
  return _readAloudAbort.signal;
}