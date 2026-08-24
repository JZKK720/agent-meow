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

/** Read-aloud playback state, exposed to React via subscribers. */
export type ReadAloudState = "idle" | "loading" | "playing" | "error";

let _currentAudio: HTMLAudioElement | null = null;
let _readAloudAbort: AbortController | null = null;
let _state: ReadAloudState = "idle";

// Voice-conversation TTS active state. When true, read-aloud is blocked
// to prevent the two audio systems from overlapping. Set by
// useRealtimeVoice on playback.started/audio.done.
let _voiceActive = false;
const _voiceSubscribers = new Set<(active: boolean) => void>();

// Minimal subscriber list — components register a callback that receives
// the new state whenever it changes. This avoids a full store/observable
// library for a single boolean-ish value.
const _subscribers = new Set<(state: ReadAloudState) => void>();

function _setState(next: ReadAloudState): void {
  if (_state === next) return;
  _state = next;
  for (const sub of _subscribers) {
    try {
      sub(_state);
    } catch {
      // Subscriber errors must not break playback.
    }
  }
}

/** Subscribe to read-aloud state changes. Returns an unsubscribe function. */
export function subscribeReadAloudState(
  callback: (state: ReadAloudState) => void,
): () => void {
  _subscribers.add(callback);
  // Immediately emit the current state so the subscriber doesn't need a
  // separate initial-read call.
  callback(_state);
  return () => {
    _subscribers.delete(callback);
  };
}

/** Get the current read-aloud state (non-reactive — for imperative checks). */
export function getReadAloudState(): ReadAloudState {
  return _state;
}

/** Mark the read-aloud session as failed (all chunks errored). */
export function setReadAloudError(): void {
  _setState("error");
}

/** Set whether voice-conversation TTS is active. Called by useRealtimeVoice. */
export function setVoiceActive(active: boolean): void {
  if (_voiceActive === active) return;
  _voiceActive = active;
  // When voice TTS starts, stop any active read-aloud (existing behavior).
  if (active) stopReadAloud();
  for (const sub of _voiceSubscribers) {
    try {
      sub(active);
    } catch {
      // Subscriber errors must not break voice playback.
    }
  }
}

/** Check if voice-conversation TTS is currently active. */
export function isVoiceActive(): boolean {
  return _voiceActive;
}

/** Subscribe to voice-active state changes. Returns an unsubscribe function. */
export function subscribeVoiceActive(
  callback: (active: boolean) => void,
): () => void {
  _voiceSubscribers.add(callback);
  callback(_voiceActive);
  return () => {
    _voiceSubscribers.delete(callback);
  };
}

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
  _setState("idle");
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
  _setState("playing");
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
  _setState("loading");
  return _readAloudAbort.signal;
}