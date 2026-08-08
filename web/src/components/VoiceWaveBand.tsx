// VoiceWaveBand — thin translucent wave bands flanking a central element
// (e.g. the paw mic button) on the left and right sides. Pure CSS animation
// — no separate getUserMedia call (the VoiceWaveform above already has the
// mic). Bars wiggle with a gentle sine-wave animation to suggest a
// wavelength without competing with the real waveform above.

import { cn } from "@/lib/utils";

const BAR_COUNT = 5;
const BAR_MAX_HEIGHT = 32; // px — keeps the band thin

// Staggered delays so the bars don't all peak at once — creates an organic
// wave appearance from left to right (or right to left).
const STAGGER_MS = 120;

export type VoiceWaveBandProps = {
  /** Whether the mic is actively listening. Controls animation. */
  isListening: boolean;
  /** Side of the band: "left" or "right". The stagger direction reverses. */
  side: "left" | "right";
  /** Additional class names. */
  className?: string;
};

/**
 * Thin translucent wave band that flanks the paw button on one side.
 * 5 vertical bars with staggered sine-wave animation. Bars use a
 * cyan→teal gradient with low opacity so the band reads as a translucent
 * wavelength, not solid bars.
 */
export function VoiceWaveBand({ isListening, side, className }: VoiceWaveBandProps) {
  return (
    <div className={cn("flex items-center gap-0.75", className)} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const stagger = side === "left" ? i * STAGGER_MS : (BAR_COUNT - 1 - i) * STAGGER_MS;
        return (
          <span
            key={i}
            className={cn(
              "block w-0.5 rounded-full",
              isListening
                ? "bg-linear-to-t from-cyan-500/50 via-teal-400/60 to-cyan-300/70"
                : "bg-muted-foreground/15",
            )}
            style={{
              height: `${BAR_MAX_HEIGHT}px`,
              transformOrigin: "center",
              animation: isListening
                ? `voicewaveband-wiggle 1.4s ease-in-out ${stagger}ms infinite`
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}
