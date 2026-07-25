// useWakeWordReply — plays the TTS auto-reply "橘宝在呢" when the wake word fires.
//
// Calls the Voicebox /speak endpoint via the agent-meow server proxy,
// then plays the returned audio. This is the "voice personality" response
// that acknowledges the user before the main mic activates.

import { useCallback, useRef, useState } from "react";
import { authenticatedFetch } from "@/lib/identity";

// The auto-reply phrase — 橘宝在呢 ("Meow is here").
const WAKE_REPLY_TEXT = "橘宝在呢";
// Voicebox profile for the reply (kokoro engine, Chinese-capable).
const WAKE_REPLY_PROFILE = "agent-meow-kokoro";

export type UseWakeWordReplyProps = {
  /** Voicebox URL. Defaults to localhost:17493 (standard dev deployment). */
  voiceboxUrl?: string;
  /** Enable/disable the TTS auto-reply. */
  enabled?: boolean;
};

export function useWakeWordReply({
  voiceboxUrl = "http://127.0.0.1:17493",
  enabled = true,
}: UseWakeWordReplyProps = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playReply = useCallback(async () => {
    if (!enabled) return;

    // Determine the Voicebox URL — either from props or from env.
    const baseUrl = voiceboxUrl || "";
    if (!baseUrl) {
      // No Voicebox configured — skip TTS, just let the mic activate.
      return;
    }

    try {
      const resp = await fetch(`${baseUrl}/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: WAKE_REPLY_TEXT,
          profile: WAKE_REPLY_PROFILE,
          engine: "kokoro",
          language: "zh",
        }),
      });

      if (!resp.ok) return;
      const result = await resp.json();
      const generationId = result.id;
      if (!generationId) return;

      // Poll for completion (Voicebox is async — generation takes ~0.6s).
      for (let i = 0; i < 20; i++) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const statusResp = await fetch(`${baseUrl}/generate/${generationId}/status`);
        if (!statusResp.ok) continue;
        const statusText = await statusResp.text();
        if (statusText.includes('"status": "completed"')) {
          break;
        }
      }

      // Fetch the audio and play it.
      const audioResp = await fetch(`${baseUrl}/audio/${generationId}`);
      if (!audioResp.ok) return;
      const audioBlob = await audioResp.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any previous playback.
      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      await audio.play();
    } catch {
      // TTS failed — silently continue. The mic will still activate.
    }
  }, [enabled, voiceboxUrl]);

  return { playReply, isPlaying };
}
