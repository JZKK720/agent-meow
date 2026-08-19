// VoiceWaveBand — thin translucent wave bands flanking a central element
// (e.g. the paw mic button) on the left and right sides. Pure CSS animation
// — no separate getUserMedia call (the VoiceWaveform above already has the
// mic). Bars wiggle with varied sine-wave animations to suggest a
// wavelength without competing with the real waveform above.
//
// Each bar has a unique profile (height, period, peak amplitude, phase) so
// the band reads as an organic sound-wave instead of evenly-spaced
// synchronized squares. Profiles are deterministic per bar index — no
// re-render flicker, no hydration mismatch.

import { cn } from "@/lib/utils";

/**
 * Per-bar profiles for an organic sound-wave look.
 * Index-aligned — bar `i` reads profile `i`. Tuned by hand so the resulting
 * animation looks like a layered audio meter (taller center bars with
 * higher peaks, shorter outer bars, varied periods to prevent lockstep).
 *
 * `peak` is the scaleY at the 50% keyframe (the loudest moment);
 * `lo` is the scaleY at 0%/100% (the quietest moment).
 */
type BarProfile = {
  /** Base rendered height in px. */
  height: number;
  /** Animation period in seconds (varied so bars desync). */
  duration: number;
  /** scaleY at the 0%/100% keyframes — the resting/quiet amplitude. */
  lo: number;
  /** scaleY at the 50% keyframe — the peak amplitude. */
  peak: number;
  /** Animation-delay in ms (negative values start mid-cycle). */
  delay: number;
};

const BAR_PROFILES: readonly BarProfile[] = [
  // Mirroring the Figma design's "asymmetric ocean wavelength" feel:
  // short / quiet → tall / loud → short / quiet → tallest / loudest →
  // short / quiet, with desynced durations so the band never repeats.
  { height: 18, duration: 1.2, lo: 0.22, peak: 0.55, delay: 0 },
  { height: 28, duration: 1.6, lo: 0.32, peak: 0.85, delay: -180 },
  { height: 22, duration: 1.0, lo: 0.18, peak: 0.5, delay: -340 },
  { height: 34, duration: 1.5, lo: 0.4, peak: 1.0, delay: -500 },
  { height: 20, duration: 1.8, lo: 0.25, peak: 0.6, delay: -720 },
];

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
 * 5 vertical bars with unique profiles (height, period, amplitude, phase)
 * for an organic sound-wave look. Bars use a warm pastel gradient
 * (peach → rose → ember, per the MEOW-Agent design tokens) with low
 * opacity so the band reads as a translucent sunlit wavelength — not
 * solid bars.
 */
export function VoiceWaveBand({ isListening, side, className }: VoiceWaveBandProps) {
  // Reverse the profile order for the right side so the two bands read
  // as a mirror image (tallest bar closer to the paw button on both sides).
  const profiles = side === "left" ? BAR_PROFILES : [...BAR_PROFILES].reverse();
  return (
    <div className={cn("flex items-center gap-0.75", className)} aria-hidden="true">
      {profiles.map((profile) => {
        // One shared @keyframes (voicewaveband-wiggle) reads --bar-lo and
        // --bar-peak from inline CSS variables, so each bar gets unique
        // rest/peak values without N separate keyframes. Animation period
        // and delay vary per bar via the shorthand so the bands desync.
        const style: React.CSSProperties = {
          height: `${profile.height}px`,
          transformOrigin: "center",
          ["--bar-lo" as string]: profile.lo,
          ["--bar-peak" as string]: profile.peak,
          animation: isListening
            ? `voicewaveband-wiggle ${profile.duration}s ease-in-out ${profile.delay}ms infinite`
            : "none",
        };
        return (
          <span
            // Stable key derived from the profile (height + delay) so React
            // re-uses the DOM node across re-renders — array indices would
            // confuse the diff because the right band reverses the order.
            key={`${profile.height}-${profile.delay}`}
            className={cn(
              "block w-0.5 rounded-full",
              isListening
                ? /* Warm pastel gradient — mirrors the Figma action-card
                     palette (peach → rose → ember) using brand tokens. */
                  "bg-linear-to-t from-brand-accent/45 via-brand-primary/55 to-brand-primary/65"
                : "bg-muted-foreground/15",
            )}
            style={style}
          />
        );
      })}
    </div>
  );
}
