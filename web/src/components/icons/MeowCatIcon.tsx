import { forwardRef, type SVGProps } from "react";

// MeowCat mascot — the agent-meow cat silhouette (橘宝疾风 / "Orange Treasure
// Storm"), inlined so CSS/JS can animate parts:
// - Pass className="meowcat-working" for the bob + blink (see index.css).
//   Each eye is a `g.meowcat-eye` group of sclera + pupil + glint so the
//   blink collapses each eye in place.
// - The cat's two pupils (black disc + glint) are additionally wrapped in
//   `g.meowcat-pupil` groups that MeowCatEyes slides toward the cursor; the
//   ref is forwarded to the root svg so MeowCatEyes can query them.
//
// The silhouette is geometric and minimalist: a rounded cat head with two
// pointed ears, whisker dots, and a small nose. The body fill uses
// currentColor so it follows the app theme (brand-primary via CSS text color).
// The eye sclera is white (#FEFEFE), pupils black, matching the Otto pattern
// for consistent eye-tracking geometry.
export const MeowCatIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function MeowCatIcon(props, ref) {
    return (
      <svg ref={ref} viewBox="0 0 1024 1024" fill="none" aria-hidden="true" {...props}>
        {/* Left ear — triangle pointing up from the head */}
        <path
          d="M180 280 L220 120 L360 250 Z"
          fill="currentColor"
        />
        {/* Right ear — mirror of the left */}
        <path
          d="M844 280 L804 120 L664 250 Z"
          fill="currentColor"
        />
        {/* Inner left ear — warm amber accent (brand-accent) */}
        <path
          d="M220 250 L240 160 L320 240 Z"
          fill="var(--brand-accent, #FFB347)"
          opacity="0.6"
        />
        {/* Inner right ear */}
        <path
          d="M804 250 L784 160 L704 240 Z"
          fill="var(--brand-accent, #FFB347)"
          opacity="0.6"
        />
        {/* Head — rounded silhouette from ear base to chin */}
        <path
          d="M512 200
             C 380 200, 280 280, 250 400
             C 230 480, 220 560, 240 640
             C 260 720, 320 800, 420 840
             C 470 860, 520 870, 512 870
             C 504 870, 554 860, 604 840
             C 704 800, 764 720, 784 640
             C 804 560, 794 480, 774 400
             C 744 280, 644 200, 512 200
             Z"
          fill="currentColor"
        />
        {/* Left cheek whisker dots — three small circles */}
        <circle cx="340" cy="600" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        <circle cx="310" cy="630" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        <circle cx="340" cy="660" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        {/* Right cheek whisker dots */}
        <circle cx="684" cy="600" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        <circle cx="714" cy="630" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        <circle cx="684" cy="660" r="8" fill="var(--brand-accent, #FFB347)" opacity="0.5" />
        {/* Nose — small triangle in brand-accent */}
        <path
          d="M512 540 L492 560 L532 560 Z"
          fill="var(--brand-accent, #FFB347)"
        />
        {/* Mouth — two subtle curves from nose down */}
        <path
          d="M512 562 C 500 580, 480 585, 470 580"
          stroke="var(--brand-text-secondary, #6B5D4F)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M512 562 C 524 580, 544 585, 554 580"
          stroke="var(--brand-text-secondary, #6B5D4F)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        {/* Right eye — sclera (white) + pupil group (black disc + glint).
             The g.meowcat-eye group collapses on blink; the inner
             g.meowcat-pupil group slides toward the cursor via MeowCatEyes. */}
        <g className="meowcat-eye">
          <path
            d="M614.288 449.332
             C 653.717 446.734, 687.743 476.697, 690.166 516.149
             C 692.589 555.601, 662.486 589.506, 623.035 591.753
             C 583.83 593.992, 550.193 564.106, 547.784 524.899
             C 545.377 485.692, 575.104 451.913, 614.288 449.332
             Z"
            fill="#FEFEFE"
          />
          <g className="meowcat-pupil">
            <path
              d="M619.877 464.629
               C 650.751 465.05, 675.441 490.422, 675.029 521.305
               C 674.618 552.189, 649.261 576.894, 618.388 576.492
               C 587.5 576.09, 562.789 550.712, 563.2 519.815
               C 563.612 488.918, 588.99 464.208, 619.877 464.629
               Z"
              fill="black"
            />
            <path
              d="M595.036 483.748
               C 604.506 482.54, 613.184 489.181, 614.494 498.64
               C 615.805 508.099, 609.26 516.852, 599.819 518.265
               C 593.62 519.193, 587.4 516.718, 583.533 511.784
               C 579.665 506.85, 578.746 500.217, 581.126 494.417
               C 583.506 488.617, 588.818 484.542, 595.036 483.748
               Z"
              fill="#FEFEFE"
            />
          </g>
        </g>
        {/* Left eye — mirror of the right */}
        <g className="meowcat-eye">
          <path
            d="M408.921 449.332
             C 448.35 446.734, 482.376 476.697, 484.799 516.149
             C 487.222 555.601, 457.119 589.506, 417.669 591.753
             C 378.464 593.992, 344.826 564.106, 342.418 524.899
             C 340.01 485.692, 369.737 451.913, 408.921 449.332
             Z"
            fill="#FEFEFE"
          />
          <g className="meowcat-pupil">
            <path
              d="M414.511 464.629
               C 445.384 465.05, 470.074 490.422, 469.663 521.305
               C 469.251 552.189, 443.895 576.894, 413.021 576.492
               C 382.133 576.09, 357.422 550.712, 357.834 519.815
               C 358.245 488.918, 383.623 464.208, 414.511 464.629
               Z"
              fill="black"
            />
            <path
              d="M389.669 483.748
               C 399.139 482.54, 407.817 489.181, 409.128 498.64
               C 410.439 508.099, 403.894 516.852, 394.452 518.265
               C 388.253 519.193, 382.034 516.718, 378.166 511.784
               C 374.299 506.85, 373.379 500.217, 375.759 494.417
               C 378.139 488.617, 383.451 484.542, 389.669 483.748
               Z"
              fill="#FEFEFE"
            />
          </g>
        </g>
      </svg>
    );
  },
);