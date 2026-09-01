"use client";

// ComposerSpeechChip — the composer's single speech control (plan-040
// Phase 0, Task 2). Wraps ComposerMicButton (dictation) and layers the
// read-aloud state light on top: mic idle → speaker playing → speaker
// paused. The visual merge of the two controls; the state machine itself
// comes in as props so the chip stays presentational.
//
// Phase 0 scope: read-aloud props are optional — the landing screen uses
// the chip as a pure mic pass-through; ChatPage's Composer adopts it with
// handlers in Task 4. Per-message read-aloud start buttons are untouched
// in Phase 0 (their removal is Phase 2, spec §6.5).

import { ComposerMicButton, type ComposerMicButtonProps } from "@/components/ComposerMicButton";
import { useTranslation } from "react-i18next";
import { Volume2Icon, VolumeXIcon } from "lucide-react";
import type { ReadAloudState } from "@/lib/readAloudAudio";

export interface ComposerSpeechChipProps extends ComposerMicButtonProps {
  /** Current read-aloud playback state. "idle" (or undefined) shows the mic. */
  readAloudState?: ReadAloudState;
  /** Stop the active read-aloud. Called when the chip is clicked while playing. */
  onStopReadAloud?: () => void;
  /** Resume (or pause) a paused read-aloud. Called when clicked while paused. */
  onPauseResumeReadAloud?: () => void;
}

export const ComposerSpeechChip = ({
  readAloudState = "idle",
  onStopReadAloud,
  onPauseResumeReadAloud,
  ...micProps
}: ComposerSpeechChipProps) => {
  const { t } = useTranslation();
  const readAloudActive =
    Boolean(onStopReadAloud) &&
    (readAloudState === "playing" || readAloudState === "paused");
  const isPlaying = readAloudState === "playing";

  if (readAloudActive) {
    const label = isPlaying ? t("chat.readAloudStop") : t("chat.readAloudResume");
    return (
      <button
        type="button"
        onClick={isPlaying ? onStopReadAloud : onPauseResumeReadAloud}
        aria-label={label}
        title={label}
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:size-8"
      >
        {isPlaying ? (
          <Volume2Icon className="size-4 animate-pulse" aria-hidden />
        ) : (
          <VolumeXIcon className="size-4" aria-hidden />
        )}
      </button>
    );
  }

  // Idle / loading / error with no handler → plain mic pass-through.
  return <ComposerMicButton {...micProps} />;
};