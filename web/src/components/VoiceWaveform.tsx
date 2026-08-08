// VoiceWaveform — real-time audio visualization bars for the voice surface.
// Uses getUserMedia + AnalyserNode for FFT frequency analysis.
// Animates when isListening=true, falls back to static bars otherwise.
// 14 bars forming a wide waveband above the paw button.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// FFT bin ranges per bar, weighted toward voice frequencies (~100Hz–3kHz).
// 14 bars for a longer, wider waveband above the paw button.
const BAR_BINS: ReadonlyArray<readonly [number, number]> = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 10],
  [10, 12],
  [12, 14],
  [14, 16],
  [16, 19],
  [19, 22],
  [22, 26],
];

const BAR_BASELINE = 0.12;
const BAR_COUNT = BAR_BINS.length;

// Easing for bar height transitions — fast attack, slow release.
const ATTACK = 0.7;
const RELEASE = 0.85;

export type VoiceWaveformProps = {
  /** Whether the mic is actively listening. Controls animation. */
  isListening: boolean;
  /** Bar color class. Defaults to muted-foreground/40. */
  className?: string;
  /** Height of the waveform container in pixels. Defaults to 56 (larger per design). */
  height?: number;
};

export function VoiceWaveform({ isListening, className, height = 56 }: VoiceWaveformProps) {
  const barRefs = useRef<(HTMLSpanElement | null)[]>(Array.from({ length: BAR_COUNT }, () => null));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isListening) {
      // Reset bars to baseline when not listening.
      for (const el of barRefs.current) {
        if (el) el.style.transform = `scaleY(${BAR_BASELINE})`;
      }
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let rafId: number | null = null;
    // Smoothed values per bar — prevents jitter.
    const smoothed = new Array(BAR_COUNT).fill(BAR_BASELINE);
    const bars = barRefs.current;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        setError(true);
        return;
      }
      if (cancelled) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }
      audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        for (let i = 0; i < BAR_COUNT; i += 1) {
          const [lo, hi] = BAR_BINS[i];
          let sum = 0;
          for (let j = lo; j < hi; j += 1) sum += data[j];
          const avg = sum / (hi - lo) / 255;
          // 1.6× headroom for quiet speech; clamp at 1.
          const target = Math.max(BAR_BASELINE, Math.min(1, avg * 1.6));
          // Smooth: fast attack, slow release.
          smoothed[i] =
            target > smoothed[i]
              ? smoothed[i] * (1 - ATTACK) + target * ATTACK
              : smoothed[i] * RELEASE + target * (1 - RELEASE);
          const el = bars[i];
          if (el) el.style.transform = `scaleY(${smoothed[i]})`;
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    void start();

    return () => {
      cancelled = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (audioCtx && audioCtx.state !== "closed") {
        void audioCtx.close();
      }
      for (const el of bars) {
        if (el) el.style.transform = `scaleY(${BAR_BASELINE})`;
      }
    };
  }, [isListening]);

  // Static bars when not listening or on error.
  const staticHeights = [
    0.3, 0.45, 0.6, 0.4, 0.55, 0.7, 0.5, 0.65, 0.45, 0.6, 0.4, 0.55, 0.35, 0.5,
  ];

  return (
    <div
      className={cn("flex items-center justify-center gap-1", className)}
      style={{ height }}
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el;
          }}
          className={cn(
            "block w-[3px] origin-bottom rounded-full transition-colors duration-300",
            isListening && !error
              ? "bg-linear-to-t from-cyan-500 via-teal-400 to-cyan-300"
              : "bg-muted-foreground/40",
          )}
          style={{
            height: `${(isListening && !error ? 1 : staticHeights[i]) * height}px`,
            transform: `scaleY(${isListening && !error ? BAR_BASELINE : staticHeights[i]})`,
            transition: isListening
              ? "none" // rAF drives transform directly
              : "transform 300ms ease-out, background-color 300ms ease-out",
          }}
        />
      ))}
    </div>
  );
}
