// VoicePanel — the right-side rail tab for the agent-meow Voice surface.
// Shows the QAA voice gateway health, mic/composer instructions, and the live
// voice conversation transcript from the realtime session. Read-only panel.

import { AudioLinesIcon, MicIcon, Volume2Icon, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";

interface VoicePanelProps {
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

/** QAA gateway health from GET /api/health on :3101. */
interface QaaHealth {
  ok: boolean;
  voiceConfigured: boolean;
  realtimeProvider: string;
  realtimeLabel: string;
  realtimeModel: string;
  voiceClients?: {
    connected: number;
    activeOwners: number;
  };
  backend?: {
    kind: string;
    label: string;
    ok: boolean;
  };
}

export function VoicePanel({ onClose, frameless }: VoicePanelProps) {
  const { t } = useTranslation();
  const [qaaHealth, setQaaHealth] = useState<QaaHealth | null>(null);
  const [qaaError, setQaaError] = useState(false);

  // Live realtime voice session — gives us the user + assistant transcripts
  // and connection state so the panel reflects the active voice conversation.
  const realtimeVoice = useRealtimeVoice();

  // Probe QAA gateway health on mount.
  // QAA runs on :3101 and exposes /api/health with provider, model, and
  // voice client connection info.
  useEffect(() => {
    const fetchHealth = () => {
      fetch("http://127.0.0.1:3101/api/health", { signal: AbortSignal.timeout(5000) })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((data: QaaHealth) => {
          setQaaHealth(data);
          setQaaError(false);
        })
        .catch(() => setQaaError(true));
    };
    fetchHealth();
    // Poll every 15s to keep health status fresh.
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        frameless ? "" : "rounded-lg border border-border bg-card",
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <AudioLinesIcon className="size-4 text-muted-foreground" />
          <span>{t("voice.title", "Voice")}</span>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("voice.closePanel", "Close panel")}
            onClick={onClose}
          >
            <span className="text-lg leading-none">&times;</span>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* QAA voice gateway status */}
        <div className="border-b border-border px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Volume2Icon className="size-3.5" />
            <span>{t("voice.qaaStatus", "QAA Voice Gateway")}</span>
          </div>
          <div className="mt-2">
            {qaaError ? (
              <div className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                {t(
                  "voice.qaaOffline",
                  "QAA voice gateway offline — start qwen-audio-agent on port 3101",
                )}
              </div>
            ) : qaaHealth ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className={cn("size-1.5 rounded-full", qaaHealth.ok ? "bg-emerald-500" : "bg-red-500")} />
                  <span className="text-foreground">
                    {qaaHealth.ok ? t("voice.qaaOnline", "Online") : t("voice.qaaError", "Error")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Provider: {qaaHealth.realtimeLabel || qaaHealth.realtimeProvider}
                </div>
                {qaaHealth.realtimeModel && (
                  <div className="text-xs text-muted-foreground">
                    Model: {qaaHealth.realtimeModel}
                  </div>
                )}
                {qaaHealth.backend && (
                  <div className="text-xs text-muted-foreground">
                    Backend: {qaaHealth.backend.label} {qaaHealth.backend.ok ? "✓" : "✗"}
                  </div>
                )}
                {qaaHealth.voiceClients && qaaHealth.voiceClients.connected > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {qaaHealth.voiceClients.connected} voice client(s) connected
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">{t("common.loading", "Loading…")}</div>
            )}
          </div>
        </div>

        {/* Mic status */}
        <div className="border-b border-border px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MicIcon className="size-3.5" />
            <span>{t("voice.micStatus", "Microphone")}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t(
              "voice.micHint",
              'Click the paw-mic button to start a realtime voice session. Say "橘宝" to wake hands-free.',
            )}
          </div>
        </div>

        {/* Live voice conversation */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MessageSquareIcon className="size-3.5" />
            <span>{t("voice.conversation", "Voice Conversation")}</span>
          </div>
          {realtimeVoice.state === "connected" ? (
            <div className="mt-2 space-y-2">
              {realtimeVoice.userTranscript && (
                <div className="rounded-md bg-muted/40 px-2.5 py-2">
                  <div className="text-[10px] font-medium uppercase text-muted-foreground">
                    {t("voice.youSaid", "You said")}
                  </div>
                  <div className="mt-0.5 text-xs text-foreground">
                    {realtimeVoice.userTranscript}
                  </div>
                </div>
              )}
              {realtimeVoice.assistantTranscript && (
                <div className="rounded-md bg-primary/10 px-2.5 py-2">
                  <div className="text-[10px] font-medium uppercase text-muted-foreground">
                    {t("voice.agentSaid", "Agent said")}
                  </div>
                  <div className="mt-0.5 text-xs text-foreground">
                    {realtimeVoice.assistantTranscript}
                  </div>
                </div>
              )}
              {realtimeVoice.isResponding && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {t("voice.responding", "Responding…")}
                </div>
              )}
              {!realtimeVoice.userTranscript && !realtimeVoice.assistantTranscript && (
                <div className="text-xs text-muted-foreground">
                  {t("voice.listening", "Listening…")}
                </div>
              )}
            </div>
          ) : realtimeVoice.state === "connecting" ? (
            <div className="mt-3 text-xs text-muted-foreground">
              {t("voice.connecting", "Connecting…")}
            </div>
          ) : realtimeVoice.error ? (
            <div className="mt-2 rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
              {realtimeVoice.error}
            </div>
          ) : (
            <div className="mt-3 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
              <AudioLinesIcon className="size-6 opacity-30" />
              <p>
                {t(
                  "voice.noSession",
                  "No active voice session. Click the paw-mic button to start talking.",
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
