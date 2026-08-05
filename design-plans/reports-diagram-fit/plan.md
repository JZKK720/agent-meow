# Tighten pages 4, 6, and 8 diagram dimensions in the four full-scope Marp reports

Written against: working tree on 2026-08-05; render-verified against `plans/010-full-scope-report-{395-zh,hx470-zh}.pdf` rasterized at 150 DPI.

## Evidence chain

- Surface: rendered slides 4, 6, and 8 of the four full-scope reports (`plans/010-full-scope-report-{395-zh,395-en,hx470-zh,hx470-en}.{pdf,html}`).
- Problem: on slides 4, 6, and 8, the embedded diagrams crowd the slide edges and leave almost no horizontal breathing room. Page 4 (voice pipeline) shows the pipeline touching the right margin; page 6 (dependencies / implementation map) fills the full content width and crowds the closing caption; page 8 (dual-hardware compare) fills the full content width on both the 395-zh and hx470-zh reports.
- Design evidence:
  - `plans/themes/meowcat.css` defines the slide frame: `section { padding: 52px 80px 46px; }` on a 16:9 canvas, plus a soft watermark at bottom-right and pagination at bottom-left.
  - The other diagrams on each report (warmup `w:900`, architecture `w:820`, vram `w:640`, achievements `w:760`, dual-delivery `w:860`) form the visual rhythm that pages 4, 6, and 8 currently break out of.
  - Page 8 in the 395-zh source uses a different constraint (`h:380`) from the other three files (which use `w:860`). Both forms end up too wide for the content area: at 380px tall the diagram is too wide because the source PNGs have a wide aspect ratio, and at 860px wide it leaves no margin.
- Owner: `plans/010-full-scope-report-*-marp.md` — four Marp sources, each with diagram references at the affected slides.
- Scope and affected surfaces:
  - `plans/010-full-scope-report-marp.md` (395-zh) lines 53, 83, 111
  - `plans/010-full-scope-report-en-marp.md` (395-en) lines 53, 83, 111
  - `plans/010-full-scope-report-hx470-marp.md` (hx470-zh) lines 53, 83, 111
  - `plans/010-full-scope-report-hx470-en-marp.md` (hx470-en) lines 53, 83, 111
  - All four rendered artifacts under `plans/*.html` and `plans/*.pdf` are downstream and rebuild from the sources via `plans/build-reports.ps1`.
- Uncertainty: none. The render was rasterized via PyMuPDF at 150 DPI and the diagram overflow on all three slides is visually unambiguous.

## Design decision

For pages 4 and 6: reduce the explicit `w:840` width to `w:720`.
For page 8: convert from `h:380` (in 395-zh) or `w:860` (in the other three files) to `w:720`.

Why `w:720` for all three slides:

- It is below every other diagram width in the same report, so the affected slides will visually read as "the spacious ones" rather than competing with the wider pair (`w:900` warmup) and the other `w:860` dual-delivery slide.
- At 16:9 with `80px` horizontal padding, `w:720` leaves roughly the same right-side breathing room as the `w:820` architecture slide on the same theme, while still keeping the diagrams legible — they are Mermaid PNGs rendered at native pixel density, so the smaller display size does not reduce information density.
- It avoids the larger structural change of touching `meowcat.css` padding or the slide layout, which would have cross-cutting effects on the eight other diagrams.
- For page 8 specifically, converting the height-constrained `h:380` to the width-constrained `w:720` keeps the same target width across all four files, so the page 8 layout becomes consistent across the 395-zh, 395-en, hx470-zh, and hx470-en reports.

Why not a smaller number (e.g. `w:640`):

- `w:640` matches the vram-budget diagram, the smallest on the deck — setting two more diagrams to that width would collapse the visual hierarchy instead of repairing it.

Why not a slightly larger number (e.g. `w:780`):

- `w:780` is still close to `w:820`, and would not give the headline enough vertical clearance on slides 4, 6, and 8.

## Reuse

- The existing Marp-native `![w:NNN](./path.png)` and `![h:NNN](./path.png)` syntaxes are reused. No new tokens, no new theme classes, no new Mermaid sources.
- `plans/build-reports.ps1` already regenerates all four HTML/PDF pairs after source edits.
- `plans/themes/meowcat.css` is unchanged. The fix is local to the four slide sources.

## Changes

1. `plans/010-full-scope-report-marp.md`
   - Change: line 53 — replace `![w:840](./diagrams/395-voice-pipeline.png)` with `![w:720](./diagrams/395-voice-pipeline.png)`.
   - Change: line 83 — replace `![w:840](./diagrams/395-dependencies.png)` with `![w:720](./diagrams/395-dependencies.png)`.
   - Change: line 111 — replace `![h:380](./diagrams/dual-hardware-compare.png)` with `![w:720](./diagrams/dual-hardware-compare.png)`.
   - Preserve: every other line, every other diagram width, every other image source path.
   - Verify: grep confirms `w:720` is present and `w:840`, `h:380` are absent in this file.

2. `plans/010-full-scope-report-en-marp.md`
   - Change: line 53 — replace `![w:840](./diagrams/395-voice-pipeline-en.png)` with `![w:720](./diagrams/395-voice-pipeline-en.png)`.
   - Change: line 83 — replace `![w:840](./diagrams/395-dependencies-en.png)` with `![w:720](./diagrams/395-dependencies-en.png)`.
   - Change: line 111 — replace `![w:860](./diagrams/dual-hardware-compare-en.png)` with `![w:720](./diagrams/dual-hardware-compare-en.png)`.
   - Preserve: every other line, every other diagram width, every other image source path.
   - Verify: grep confirms `w:720` is present and `w:840`, `w:860` are absent in this file.

3. `plans/010-full-scope-report-hx470-marp.md`
   - Change: line 53 — replace `![w:840](./diagrams/hx470-voice-pipeline.png)` with `![w:720](./diagrams/hx470-voice-pipeline.png)`.
   - Change: line 83 — replace `![w:840](./diagrams/hx470-dependencies.png)` with `![w:720](./diagrams/hx470-dependencies.png)`.
   - Change: line 111 — replace `![w:860](./diagrams/dual-hardware-compare.png)` with `![w:720](./diagrams/dual-hardware-compare.png)`.
   - Preserve: every other line, every other diagram width, every other image source path.
   - Verify: grep confirms `w:720` is present and `w:840`, `w:860` are absent in this file.

4. `plans/010-full-scope-report-hx470-en-marp.md`
   - Change: line 53 — replace `![w:840](./diagrams/hx470-voice-pipeline-en.png)` with `![w:720](./diagrams/hx470-voice-pipeline-en.png)`.
   - Change: line 83 — replace `![w:840](./diagrams/hx470-dependencies-en.png)` with `![w:720](./diagrams/hx470-dependencies-en.png)`.
   - Change: line 111 — replace `![w:860](./diagrams/dual-hardware-compare-en.png)` with `![w:720](./diagrams/dual-hardware-compare-en.png)`.
   - Preserve: every other line, every other diagram width, every other image source path.
   - Verify: grep confirms `w:720` is present and `w:840`, `w:860` are absent in this file.

5. Rebuild all four reports end-to-end.
   - Change: run `powershell -NoProfile -ExecutionPolicy Bypass -File plans/build-reports.ps1` from the repo root.
   - Preserve: every existing build argument and output path.
   - Verify: `plans/010-full-scope-report-{395-zh,395-en,hx470-zh,hx470-en}.{html,pdf}` all have a fresh mtime and the build script reports `Done. 11 reports × 2 format(s).` (or the equivalent for whatever report count is current).

## Scope

- Inherit: every HTML and PDF that is regenerated by `plans/build-reports.ps1` from the four edited Marp sources. The eight full-scope variants (zh/en × 395/hx470, plus their `_zh` and base-name aliases) all flow through the same source edits.
- Verify: the other six full-scope reports (`010-full-scope-report-{zh,en,hx470}.pdf`) re-render with no content regressions. The executor should spot-check at least one of them by rasterizing the rebuilt PDF and confirming each slide still has exactly one embedded image.
- Exclude: the smaller non-full-scope reports (client overview, ollama, dual-platform, 008) — none of them contain the voice-pipeline, dependencies, or dual-hardware-compare diagrams on the affected slides, so they are unaffected by the source change. They will rebuild cleanly but no edits are needed there.

## Validation

- Product: a reader opening pages 4, 6, and 8 of any of the four full-scope reports should now see diagrams with visible left/right margins, matching the visual rhythm of the rest of the deck. The headline above and the caption below should not crowd the diagram.
- Interface: the `Marp-native w:` directive renders the image at exactly the specified pixel width on the 16:9 canvas. No HTML or theme changes are needed.
- System: the fix is local to three image references per file in four files (twelve changes total). No new tokens, components, or patterns. The existing build pipeline and the existing theme remain the single source of truth for visual tokens.
- Repository: run the following from the repo root and confirm each line matches.

  ```bash
  grep -nE "w:720|dual-hardware-compare" plans/010-full-scope-report-marp.md \
                    plans/010-full-scope-report-en-marp.md \
                    plans/010-full-scope-report-hx470-marp.md \
                    plans/010-full-scope-report-hx470-en-marp.md
  ```

  Expected output: exactly twelve lines — three per file (voice-pipeline `w:720`, dependencies `w:720`, dual-hardware-compare `w:720`).

  ```bash
  grep -nE "w:840|w:860|h:380" plans/010-full-scope-report-marp.md \
                          plans/010-full-scope-report-en-marp.md \
                          plans/010-full-scope-report-hx470-marp.md \
                          plans/010-full-scope-report-hx470-en-marp.md
  ```

  Expected output: no matches.

  After rebuilding, rasterize pages 4, 6, and 8 of `plans/010-full-scope-report-395-zh.pdf` at 150 DPI and confirm visually that the diagrams no longer touch the slide edges.

## Stop conditions

- Stop if `w:840`, `w:860`, or `h:380` reappears anywhere else in the four files outside of an image reference (it does not today, but if a future edit re-introduces any of them, that change is out of scope for this plan).
- Stop if the rebuild produces any Marp error or if any output PDF is missing — fix the build pipeline first before re-applying this plan.
- Stop if any other slide visually regresses — the validation rasterization must cover all four reports, not just one.

## Design documentation

- None required after acceptance. The brand spec is owned by `web/src/index.css` and mirrored by `plans/themes/meowcat.css`. This change is a per-slide content sizing decision, not a design-token change, so no design documentation needs to be updated.
