import { forwardRef, type ImgHTMLAttributes } from "react";

/**
 * WelcomeMascot — the waving 橘宝 (Orange Treasure) mascot variant.
 * Uses welcome-mascot.png from the Figma source. Reserved for
 * first-touch surfaces: new-chat greeting, empty states, welcome hero.
 *
 * @param props Standard img attributes (className, style, alt, etc.).
 *   Defaults: alt="橘宝", aria-hidden="false".
 */
export const WelcomeMascot = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(
  function WelcomeMascot(props, ref) {
    const { alt = "橘宝", className = "", ...rest } = props;
    return (
      <img
        ref={ref}
        src="/welcome-mascot.png"
        alt={alt}
        aria-hidden="false"
        className={`object-contain ${className}`}
        {...rest}
      />
    );
  },
);
