// VoicePanel — the right-side rail tab for the agent-meow Voice surface.
// Shows the Hermes gateway health, mic/composer instructions, the live
// voice conversation transcript, and past voice conversations.

import { AudioLinesIcon, MicIcon, Volume2Icon, MessageSquareIcon, HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from "@/lib/routing";

interface VoicePanelProps {
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

export function VoicePanel({ onClose, frameless }: VoicePanelProps) {
  const { t } = useTranslation();
  const [hermesUp, setHermesUp] = useState<boolean | null>(null);

  // Live voice session — gives us the user + assistant transcripts
  // and connection state so the panel reflects the active voice conversation.
  const realtimeVoice = useRealtimeVoice();

  // Probe Hermes gateway health on mount.
  // Hermes health check — uses the Vite proxy (/health → gateway).
  useEffect(() => {
    const fetchHealth = () => {
      // eslint-disable-next-line no-restricted-globals -- Hermes gateway is a separate service.
      fetch(`/hermes-health`, { signal: AbortSignal.timeout(5000) })
        .then((r) => {
          setHermesUp(r.ok);
        })
        .catch(() => setHermesUp(false));
    };
    fetchHealth();
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
        {/* Hermes gateway status */}
        <div className="border-b border-border px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Volume2Icon className="size-3.5" />
            <span>{t("voice.hermesStatus", "Hermes Voice Gateway")}</span>
          </div>
          <div className="mt-2">
            {hermesUp === null ? (
              <div className="text-xs text-muted-foreground">{t("common.loading", "Loading…")}</div>
            ) : hermesUp ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span className="text-foreground">{t("voice.hermesOnline", "Online")}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  STT: /v1/audio/transcriptions · TTS: /v1/audio/speech
                </div>
              </div>
            ) : (
              <div className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                {t("voice.hermesOffline", "Hermes gateway offline — start Hermes on port 8642")}
              </div>
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
              'Click the paw-mic button to start a voice session. Say "橘宝" to wake hands-free.',
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
              {realtimeVoice.isAudioPlaying ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-brand-primary" />
                  {t("voice.speaking", "Speaking…")}
                </div>
              ) : (
                realtimeVoice.isResponding && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                    {t("voice.responding", "Responding…")}
                  </div>
                )
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

        <PastVoiceConversations />
      </div>
    </div>
  );
}

/** Past voice conversations — sessions titled "Voice conversation" from the sidebar. */
function PastVoiceConversations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // Search for sessions with "Voice conversation" in the title.
  const { data, isLoading } = useConversations("Voice conversation");

  const sessions = data?.pages.flatMap((p) => p.data) ?? [];
  if (isLoading && sessions.length === 0) return null;
  if (sessions.length === 0) return null;

  return (
    <div className="border-t border-border px-3 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <HistoryIcon className="size-3.5" />
        <span>{t("voice.history", "Past Voice Conversations")}</span>
      </div>
      <div className="mt-2 space-y-1">
        {sessions.slice(0, 10).map((s) => (
          <button
            key={s.id}
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => navigate(`/c/${s.id}`)}
            title={t("voice.continueAsText", "Continue as text")}
          >
            <AudioLinesIcon className="size-3 shrink-0 opacity-50" />
            <span className="truncate">{s.title || "Voice conversation"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
