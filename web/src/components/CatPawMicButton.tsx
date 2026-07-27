// CatPawMicButton — the central voice input button shaped like a cat paw.
// Matches the workspace design's paw-shaped mic button (not a generic mic icon).
// Animated: pulses when listening, glows with ember accent.

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CatPawMicButtonProps {
  /** Whether the mic is actively listening. */
  isListening: boolean;
  /** Click handler to toggle dictation. */
  onClick: () => void;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Additional class names. */
  className?: string;
}

export function CatPawMicButton({
  isListening,
  onClick,
  disabled,
  className,
}: CatPawMicButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleIdRef = useRef(0);

  // Spawn ripple on click
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = rippleIdRef.current++;
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }
    onClick();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
      className={cn(
        "relative flex items-center justify-center rounded-full transition-all duration-300",
        "size-16 cursor-pointer select-none",
        isListening
          ? "bg-brand-primary text-white shadow-[0_0_24px_rgba(var(--brand-primary),0.6)] scale-105"
          : "bg-brand-primary/90 text-white shadow-lg hover:bg-brand-primary hover:shadow-xl hover:scale-105 active:scale-95",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/40 animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}

      {/* Cat paw SVG — 4 toe beans + main pad, matching the design */}
      <svg
        viewBox="0 0 64 64"
        className={cn("size-8 transition-transform duration-300", isListening && "animate-pulse")}
        fill="currentColor"
        aria-hidden="true"
      >
        {/* Main pad */}
        <ellipse cx="32" cy="42" rx="14" ry="10" />
        {/* Toe beans — 4 small circles arranged in an arc */}
        <circle cx="18" cy="28" r="5" />
        <circle cx="28" cy="20" r="5" />
        <circle cx="40" cy="20" r="5" />
        <circle cx="50" cy="28" r="5" />
      </svg>

      {/* Glow ring when listening */}
      {isListening && (
        <span
          className="absolute inset-0 -m-2 rounded-full bg-brand-primary/30 blur-lg animate-pulse"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
