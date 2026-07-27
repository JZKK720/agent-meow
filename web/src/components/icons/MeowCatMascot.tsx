import { forwardRef, type ImgHTMLAttributes } from "react";

/**
 * MeowCatMascot — the real 橘宝 (Orange Treasure) mascot character.
 * Uses the static PNG (mascot-static.png) from the Figma source.
 * A GIF animation will replace this when ready.
 *
 * @param props Standard img attributes (className, style, alt, etc.).
 *   Defaults: alt="agent-meow", aria-hidden="false".
 */
export const MeowCatMascot = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function MeowCatMascot(props, ref) {
    const { alt = "agent-meow", className = "", ...rest } = props;
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
  },
);
