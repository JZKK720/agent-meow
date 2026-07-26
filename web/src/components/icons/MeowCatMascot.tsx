import { forwardRef, type ImgHTMLAttributes, useEffect, useState } from "react";

/**
 * MeowCatMascot — the real 橘宝 (Orange Treasure) mascot character.
 *
 * Primary: video animation (mascot-video.mp4) — autoplay, loop, muted,
 * playsinline. Falls back to the static PNG (mascot-static.png) when:
 * - Video fails to load (codec not supported, network error)
 * - User prefers reduced motion (accessibility)
 * - Browser doesn't support video autoplay
 *
 * The static PNG is the high-resolution 橘宝 render from the Figma source.
 *
 * @param props Standard img attributes (className, style, alt, etc.).
 *   Defaults: alt="agent-meow", aria-hidden="false".
 */
export const MeowCatMascot = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function MeowCatMascot(props, ref) {
    const { alt = "agent-meow", className = "", ...rest } = props;
    const [videoError, setVideoError] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // Check reduced motion preference on mount
    useEffect(() => {
      if (typeof window === "undefined") return;
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mq.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }, []);

    // Use static image when video errors or user prefers reduced motion
    const useStatic = videoError || prefersReducedMotion;

    if (useStatic) {
      return (
        <img
          ref={ref}
          src="/mascot-static.png"
          alt={alt}
          aria-hidden="false"
          className={`object-contain ${className}`}
          {...rest}
        />
      );
    }

    return (
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-label={alt}
        className={`object-contain ${className}`}
        onError={() => setVideoError(true)}
      >
        <source src="/mascot-video.mp4" type="video/mp4" />
        {/* Fallback to static image if video fails */}
        <img src="/mascot-static.png" alt={alt} className={`object-contain ${className}`} />
      </video>
    );
  },
);