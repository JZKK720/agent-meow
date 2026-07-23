import { forwardRef, type ImgHTMLAttributes } from "react";

/**
 * MeowCatMascot — the real 橘宝疾风 (Orange Treasure Storm) mascot character
 * from the brand asset source. Uses the raster mascot-hero.png (778×777)
 * exported from the Adobe Illustrator source file.
 *
 * This is the full-color illustrated mascot, used on the landing page and
 * large display surfaces. For small inline uses (working indicator, sidebar
 * icons), use {@link MeowCatIcon} instead — the geometric SVG silhouette.
 *
 * The image is served from /mascot-hero.png (copied from
 * docs/assets/branding/mascot-hero.png to web/public/).
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
        src="/mascot-hero.png"
        alt={alt}
        aria-hidden="false"
        className={`object-contain ${className}`}
        {...rest}
      />
    );
  },
);