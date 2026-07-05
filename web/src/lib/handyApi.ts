// Handy CLI integration — TypeScript client for Handy's speech-to-text CLI.
// Handy is a free, open-source, offline STT desktop app. When installed,
// its CLI can transcribe audio files headlessly and toggle live recording.
//
// This module provides:
// - isHandyInstalled(): check if the handy CLI is on PATH
// - transcribeFile(path): headless batch transcription via `handy --transcribe-file`
// - toggleTranscription(): remote-control the running Handy app via `handy --toggle-transcription`
//
// The browser cannot directly invoke a CLI, so these functions are designed
// to be called from the agent-meow server (via a new server route) or from
// the Electron desktop shell (via a native bridge). In the web-only path,
// the mic button falls back to the browser's Web Speech API.

/** Check if the Handy CLI is available by probing a safe command. */
export async function isHandyInstalled(): Promise<boolean> {
  // In the browser, we can't shell out. This function is a placeholder
  // that the server-side or Electron-side integration overrides.
  // The server could expose a GET /v1/handy/status endpoint.
  return false;
}

/** Result of a Handy transcription. */
export interface HandyTranscriptionResult {
  text: string;
  durationMs?: number;
}

/**
 * Transcribe an audio file using Handy's headless CLI.
 * In the browser, this is a no-op stub — the actual call happens
 * server-side or via the Electron native bridge.
 */
export async function transcribeFile(
  _path: string,
  _options?: { model?: string; language?: string },
): Promise<HandyTranscriptionResult> {
  throw new Error(
    "Handy CLI transcription is not available in the browser. " +
      "Use the agent's transcribe_audio tool, or run Handy's global " +
      "hotkey to paste text into the composer directly.",
  );
}

/**
 * Toggle Handy's live recording (remote control).
 * Sends `handy --toggle-transcription` to the running Handy instance.
 * In the browser, this is a stub — the Electron shell or a server
 * endpoint would invoke the CLI.
 */
export async function toggleTranscription(): Promise<void> {
  throw new Error(
    "Handy toggle is not available in the browser. " +
      "Press Handy's global hotkey (Ctrl+Space / Option+Space) directly.",
  );
}