// AudioBlock — inline audio player for TTS tool outputs.
// Renders when a tool result (text_to_speech / speak) contains an
// `audio_url` field. The URL points to either a session artifact or a
// base64 data URL.

import { PlayIcon, PauseIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioBlockProps {
  /** Audio URL — either a session artifact path or a data: URL. */
  url: string;
  /** Optional text that was synthesized (shown as a label). */
  text?: string;
}

/**
 * Detect whether a tool output string contains an audio_url field.
 * Returns the parsed URL + text if found, null otherwise.
 */
export function parseAudioFromToolOutput(output: string): { url: string; text?: string } | null {
  try {
    const parsed = JSON.parse(output);
    if (typeof parsed === "object" && parsed !== null) {
      const url = (parsed as Record<string, unknown>).audio_url;
      if (typeof url === "string" && url) {
        const text = (parsed as Record<string, unknown>).text;
        return { url, text: typeof text === "string" ? text : undefined };
      }
    }
  } catch {
    // Not JSON — no audio.
  }
  return null;
}

/**
 * Inline audio player for TTS tool results.
 * Shows a compact play/pause button + progress bar + optional text label.
 */
export function AudioBlock({ url, text }: AudioBlockProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2",
        "my-1 max-w-md",
      )}
      data-testid="audio-block"
    >
      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTime(0);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        preload="metadata"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
      </Button>
      <div className="min-w-0 flex-1">
        {text && (
          <div className="truncate text-xs text-muted-foreground">{text}</div>
        )}
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}