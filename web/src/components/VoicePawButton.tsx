// VoicePawButton — the landing hero voice card: paw mic button flanked by
// thin translucent wave bands, connection status lines, and the attach /
// wake-word rows. Extracted verbatim from NewChatDialog's
// NewChatLandingScreen (plan 040 Phase 0) — the component owns the JSX
// only; all state stays in the parent and flows through props.

import { MicIcon, PlusIcon } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { VoiceWaveBand } from "@/components/VoiceWaveBand";
import type { UseRealtimeVoiceResult } from "@/hooks/useRealtimeVoice";
import { cn } from "@/lib/utils";

// Ember glow family — the ONE place the paw's ember shadow literals live.
// Hero (size-16) and dock (size-9/8) paws share the same listening glow so a
// brand tweak updates both together. (unified-surface-audit finding 2.)
const EMBER_GLOW_HERO = "shadow-[0_0_24px_rgba(232,101,26,0.55)]";
const EMBER_GLOW_DOCK = "shadow-[0_0_16px_rgba(232,101,26,0.45)]";

export function VoicePawButton(props: {
  realtimeVoice: UseRealtimeVoiceResult;
  voiceListening: boolean;
  creating: boolean;
  dictationActive: boolean;
  wakeWordActive: boolean;
  wakeWordEnabled: boolean;
  /** "hero" (default): the full landing card with wave bands + glow.
   *  "dock": compact inline control for the unified composer footer —
   *  same paw + states, no card chrome, size-8/9 hit area. */
  variant?: "hero" | "dock";
  /** Fired when a fresh voice session starts — the parent snapshots the
   *  composer text here so it can revert on voice discard. */
  onVoiceStart: () => void;
  onTranscriptAppend: (text: string) => void;
  onAttachClick?: () => void;
  onToggleWakeWord: (next: boolean) => void;
}) {
  const {
    realtimeVoice,
    voiceListening,
    creating,
    dictationActive,
    wakeWordActive,
    wakeWordEnabled,
    variant = "hero",
    onVoiceStart,
    onTranscriptAppend,
    onAttachClick,
    onToggleWakeWord,
  } = props;
  const { t } = useTranslation();
  const isDock = variant === "dock";

  if (isDock) {
    // Compact dock variant: just the paw button, sized to sit in the
    // composer's action row (same 44px hit discipline via size-9/md:size-8).
    return (
      <DockPawCore
        realtimeVoice={realtimeVoice}
        voiceListening={voiceListening}
        creating={creating}
        dictationActive={dictationActive}
        onVoiceStart={onVoiceStart}
        onTranscriptAppend={onTranscriptAppend}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-3 rounded-2xl border bg-card-solid/90 px-6 py-5 backdrop-blur-[2px] transition-all duration-500",
        voiceListening
          ? "border-brand-primary/70 shadow-[0_0_24px_-4px_rgba(232,101,26,0.35),0_12px_20px_-20px_rgba(232,101,26,0.18)]"
          : "border-brand-accent/60 shadow-[0_11.392px_22.336px_0px_rgba(232,101,26,0.09),inset_0_-2px_1px_0px_rgba(255,179,71,0.18)]",
      )}
    >
      {/* Paw mic row — wave bands flank the paw button on each side. */}
      <div className="flex w-full items-center justify-center gap-4">
        <VoiceWaveBand isListening={voiceListening} side="left" className="h-8" />
        <div className="relative">
          {voiceListening && (
            <>
              <span
                className="absolute inset-0 -m-3 rounded-full bg-brand-primary/25 blur-md animate-pulse"
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 -m-6 rounded-full bg-brand-accent/15 blur-lg animate-pulse"
                style={{ animationDelay: "0.3s", animationDuration: "2s" }}
                aria-hidden="true"
              />
            </>
          )}
          {!voiceListening && (
            <div
              className="absolute inset-0 -m-2 rounded-full bg-brand-accent/20 blur-md"
              aria-hidden="true"
            />
          )}
          <button
            type="button"
            disabled={creating || (dictationActive && realtimeVoice.state !== "connected")}
            aria-label={voiceListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={voiceListening}
            onClick={() => {
              if (realtimeVoice.state === "connected") {
                // Capture the transcript BEFORE disconnect — disconnect
                // resets userTranscript to "" synchronously, so reading
                // it after would append nothing and lose the final text.
                const finalTranscript = realtimeVoice.userTranscript;
                realtimeVoice.disconnect();
                if (finalTranscript) onTranscriptAppend(finalTranscript);
              } else {
                onVoiceStart();
                realtimeVoice.connect().then(() => {
                  // Gate every voice turn behind the wake word ("橘宝").
                  // The VAD runs but speech goes to keyword-check, not
                  // straight to STT→LLM→TTS. This prevents background
                  // noise and side-talk from entering the pipeline.
                  // After each turn, wakeWordAutoResume re-enables this
                  // mode automatically (hermesVoice.ts:1502-1504).
                  import("@/lib/hermesVoice").then(({ hermesVoice }) => {
                    hermesVoice.startWakeWordMode();
                  });
                }).catch(() => {
                  // Error state is set by the hook; nothing to do here.
                });
              }
            }}
            data-voice-state={voiceListening ? realtimeVoice.voiceState : "disconnected"}
            className={cn(
              "relative flex size-16 items-center justify-center rounded-full transition-all duration-300 cursor-pointer",
              voiceListening
                ? // Ember → accent warm gradient while listening (mirrors
                  // the Figma "ColorFire ember" hero + brand-accent chain).
                  `bg-linear-to-br from-brand-primary via-brand-accent to-brand-accent/70 text-white ${EMBER_GLOW_HERO} scale-105`
                : "bg-brand-primary/90 text-white shadow-lg hover:bg-brand-primary hover:shadow-xl hover:scale-105 active:scale-95",
              creating && "opacity-50 cursor-not-allowed",
            )}
          >
            {/* Cat paw SVG — the shared 4-toe glyph (paw-redesign 2026-09-02).
                Identical geometry to the old inline copy, one source now. */}
            <PawGlyph
              className={cn(
                "size-9 -translate-y-1 transition-transform duration-300",
                voiceListening && "animate-pulse",
                // ASR-off phases (rule 2/4/7): the paw dims while the
                // mic is not live so "processing/speaking" is visible on
                // the button itself, not just the status line.
                voiceListening &&
                  (realtimeVoice.voiceState === "processing" ||
                    realtimeVoice.voiceState === "speaking") &&
                  "opacity-40",
              )}
            />
            {/* Visible label inside the circle, under the paw icon.
                Rule 2: after the first utterance the mic goes OFF — the
                label flips to the phase (ASR off) instead of "Stop". */}
            <span className="absolute bottom-1.5 text-[10px] font-semibold leading-none tracking-wide">
              {voiceListening
                ? realtimeVoice.voiceState === "processing"
                  ? t("newChat.voiceThinking")
                  : realtimeVoice.voiceState === "speaking"
                    ? t("newChat.voiceSpeaking")
                    : realtimeVoice.isWakeWordOnly
                      ? t("newChat.voicePhaseWake")
                      : t("newChat.voiceStop")
                : t("newChat.voiceStart")}
            </span>
          </button>
        </div>
        {/* Right wave band — mirrors the left band for symmetric wavelength. */}
        <VoiceWaveBand isListening={voiceListening} side="right" className="h-8" />
      </div>
      {realtimeVoice.error && <p className="text-xs text-destructive">{realtimeVoice.error}</p>}
      {realtimeVoice.state === "connecting" && (
        <p className="text-xs text-muted-foreground">Connecting…</p>
      )}
      {/* Voice status indicator — the unified voiceState drives the
          phase text (listening → processing → speaking → listening).
          In wake-word mode, show "Say 橘宝" instead of "Listening…". */}
      {voiceListening && (
        <p
          className="text-xs font-medium text-muted-foreground"
          data-voice-state={realtimeVoice.voiceState}
        >
          {realtimeVoice.voiceState === "speaking"
            ? t("newChat.voiceSpeaking")
            : realtimeVoice.voiceState === "processing"
              ? t("newChat.voiceThinking")
              : realtimeVoice.isWakeWordOnly
                ? t("newChat.wakeWordOff")
                : t("newChat.voiceListening")}
        </p>
      )}
      {/* "+" attach button — bottom-left of the voice card, matching the
          design's orange plus affordance. Triggers the same file input
          as the composer's paperclip. */}
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={() => onAttachClick?.()}
          className="flex size-8 items-center justify-center rounded-full text-brand-primary transition-colors hover:bg-brand-primary/10"
          aria-label={t("newChat.attachFiles")}
          data-testid="new-chat-landing-voice-attach"
        >
          <PlusIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => onToggleWakeWord(!wakeWordActive)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            wakeWordEnabled
              ? "border-brand-primary bg-brand-primary/15 text-brand-primary"
              : wakeWordActive
                ? "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
          )}
          data-testid="new-chat-landing-wake-word-chip"
          aria-pressed={wakeWordEnabled}
        >
          <MicIcon className="size-3.5 shrink-0" />
          <span>{wakeWordEnabled ? t("newChat.wakeWordOn") : wakeWordActive ? t("newChat.wakeWordPaused") : t("newChat.wakeWordOff")}</span>
        </button>
      </div>
    </div>
  );
}

// ─── Dock variant core ──────────────────────────────────────────────────────

/** Long-press duration that arms wake-word mode from the docked paw. */
const WAKE_ARM_PRESS_MS = 500;

function DockPawCore(props: {
  realtimeVoice: UseRealtimeVoiceResult;
  voiceListening: boolean;
  creating: boolean;
  dictationActive: boolean;
  onVoiceStart: () => void;
  onTranscriptAppend: (text: string) => void;
}) {
  const {
    realtimeVoice,
    voiceListening,
    creating,
    dictationActive,
    onVoiceStart,
    onTranscriptAppend,
  } = props;

  const pressTimerRef = useRef<number | null>(null);
  const armedRef = useRef(false);

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      disabled={creating || (dictationActive && realtimeVoice.state !== "connected")}
      aria-label={voiceListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={voiceListening}
      data-testid="composer-voice-paw"
      data-voice-state={voiceListening ? realtimeVoice.voiceState : "disconnected"}
      onPointerDown={() => {
        armedRef.current = false;
        clearPressTimer();
        pressTimerRef.current = window.setTimeout(() => {
          armedRef.current = true;
          onVoiceStart();
          realtimeVoice
            .connect()
            .then(() => {
              import("@/lib/hermesVoice").then(({ hermesVoice }) => {
                hermesVoice.startWakeWordMode();
              });
            })
            .catch(() => {
              // Error state is set by the hook; nothing to do here.
            });
        }, WAKE_ARM_PRESS_MS);
      }}
      onPointerUp={() => {
        clearPressTimer();
      }}
      onClick={() => {
        if (armedRef.current) return; // long-press already handled it
        if (realtimeVoice.state === "connected") {
          const finalTranscript = realtimeVoice.userTranscript;
          realtimeVoice.disconnect();
          if (finalTranscript) onTranscriptAppend(finalTranscript);
        } else {
          onVoiceStart();
          realtimeVoice.connect().catch(() => {});
        }
      }}
      className={cn(
        "relative flex size-9 items-center justify-center rounded-full transition-all duration-300 cursor-pointer md:size-8",
        voiceListening
          ? `bg-linear-to-br from-brand-primary via-brand-accent to-brand-accent/70 text-white ${EMBER_GLOW_DOCK}`
          : "bg-brand-primary/90 text-white shadow hover:bg-brand-primary active:scale-95",
        creating && "opacity-50 cursor-not-allowed",
      )}
    >
      <PawGlyph className={cn("size-5 -translate-y-0.5", voiceListening && "animate-pulse")} />
      {voiceListening && (
        <span
          className="absolute inset-0 -m-1.5 rounded-full bg-brand-primary/25 blur-md animate-pulse"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

// Paw SVG — 4 toe beans + main pad, matching the brand mascot and the
// hero variant's inline copy. The previous dock glyph had only 3 toe
// beans (two rotated ellipses + one center) which read as a "3-finger"
// paw — the user flagged it as ugly (2026-09-02). This unified glyph is
// now the single source: hero + dock render the same 4-toe paw.
function PawGlyph(props: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={props.className} aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="32" cy="42" rx="13" ry="10" />
        <circle cx="17" cy="27" r="5.5" />
        <circle cx="27" cy="18" r="5.5" />
        <circle cx="41" cy="18" r="5.5" />
        <circle cx="51" cy="27" r="5.5" />
      </g>
    </svg>
  );
}