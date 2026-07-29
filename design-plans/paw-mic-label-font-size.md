# Enlarge paw-mic Start/Stop label by 1px

Written against: 6a06f8b1

## Evidence chain

- Surface: `web/src/shell/NewChatDialog.tsx` — new-chat dialog paw-mic voice button (idle and connected states)
- Problem: The "Start"/"Stop" state label inside the circular paw button renders at `text-[9px]`, which is hard to read at the button's `size-16` (64px) hit area. User-selected improvement: increase the label font-size by 1px.
- Design evidence: `web/src/shell/NewChatDialog.tsx` line 3365 — the label span `className="absolute bottom-1 text-[9px] font-medium leading-none"` is the sole owner of this label's presentation; the button itself (`size-16 rounded-full`) and paw SVG (`size-8`) are unchanged by this decision.
- Owner: `web/src/shell/NewChatDialog.tsx` (paw-mic button label span, ~line 3365)
- Scope and affected surfaces: Only the paw-mic button in the new-chat dialog. The second `ComposerMicButton` in the text composer does not render this label and is unaffected.
- Uncertainty: none

## Design decision

Increase the Start/Stop label font-size from `text-[9px]` to `text-[10px]` — exactly +1px as selected. Keep all other label properties (`absolute bottom-1 font-medium leading-none`, inherited white text color) unchanged so the label stays inside the circle under the paw icon. The circle shape, paw icon, colors, and button behavior are preserved.

## Reuse

- Tailwind arbitrary-size utility `text-[10px]` (same pattern as the existing `text-[9px]`)
- Exemplar: `web/src/shell/NewChatDialog.tsx` line 3365 (the span being edited)

No new primitive is required; this is a one-off arbitrary size on a single label, not a shared token.

## Changes

1. `web/src/shell/NewChatDialog.tsx` (paw-mic button label span, ~line 3365)
   - Change: replace `text-[9px]` with `text-[10px]` in the span's className.
   - Preserve: `absolute bottom-1 font-medium leading-none`, the `{voiceListening ? "Stop" : "Start"}` conditional, the paw SVG, the button's `size-16 rounded-full` shape and color/shadow classes, aria-label/aria-pressed, and onClick behavior.
   - Verify: in the idle state the circle shows "Start" at 10px under the paw icon, fully inside the circle with no clipping or overlap of the icon; after connecting, it shows "Stop" at 10px in the same position.

## Scope

- Inherit: none — single label span only.
- Verify: the paw-mic button in both idle ("Start") and connected ("Stop") states at the default viewport.
- Exclude: the composer `ComposerMicButton`, wake-word chip, voiceHint text, error text, and all button behavior/state logic.

## Validation

- Product: open the new-chat dialog; the paw button label reads "Start" (10px) idle and "Stop" (10px) while the voice session is connected.
- Interface: `/` (new-chat view), both label states, default desktop viewport; confirm the 10px text remains inside the 64px circle without touching the paw icon or the circle edge.
- System: confirm no other component adopts a parallel 9px/10px in-circle label pattern as a result of this change.
- Repository: `cd web && npx vitest run src/hooks/useRealtimeVoice.test.ts` → 10/10 tests pass (no behavior change; guards against accidental logic edits).

## Stop conditions

- Stop if the 10px label overlaps the paw icon or clips outside the circle — in that case reduce the paw icon to `size-7` or move the label to `bottom-0.5` instead of widening scope.

## Design documentation

- None — arbitrary one-off size adjustment; no token or documented decision to record.
