/**
 * Microphone acquisition with secure-context guards.
 *
 * `navigator.mediaDevices` is `undefined` outside secure contexts — i.e. on
 * plain-HTTP origins that are not localhost (e.g. a LAN IP like
 * `http://100.124.82.112:5173`). Calling `getUserMedia` there throws
 * "Cannot read properties of undefined (reading 'getUserMedia')", which
 * crashes voice features. Every voice entry point must go through
 * {@link acquireMicStream} so the failure becomes a readable error instead.
 */

/** Thrown when the mic cannot be accessed because of the page context. */
export class MicUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicUnavailableError";
  }
}

/**
 * Whether microphone capture is possible in this context at all.
 *
 * False when the page is not a secure context (non-localhost HTTP) or the
 * browser exposes no `mediaDevices` API.
 */
export function isMicCaptureAvailable(): boolean {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return false;
  }
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

/** Human-readable reason mic capture is unavailable, or null when it is. */
export function micUnavailableReason(): string | null {
  if (typeof window !== "undefined" && window.isSecureContext === false) {
    return (
      "Microphone needs a secure connection. Open the app via localhost, " +
      "or serve it over HTTPS (the LAN IP over plain HTTP is blocked by " +
      "the browser)."
    );
  }
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return "This browser does not expose microphone capture (mediaDevices).";
  }
  return null;
}

/**
 * Guarded `navigator.mediaDevices.getUserMedia`.
 *
 * Throws {@link MicUnavailableError} with an actionable message when the
 * origin is not secure (instead of the raw TypeError), and otherwise
 * delegates to the native API — permission denials still surface as the
 * browser's `NotAllowedError` for callers to handle.
 */
export async function acquireMicStream(
  constraints: MediaStreamConstraints,
): Promise<MediaStream> {
  const reason = micUnavailableReason();
  if (reason !== null) {
    throw new MicUnavailableError(reason);
  }
  return navigator.mediaDevices.getUserMedia(constraints);
}
