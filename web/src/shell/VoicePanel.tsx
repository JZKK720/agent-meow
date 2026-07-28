// VoicePanel — the right-side rail tab for the agent-meow Voice surface.
// Shows TTS history (from conversation items), mic status, wake word toggle,
// and Voicebox health. Read-only — no dedicated backend store.

import { AudioLinesIcon, MicIcon, Volume2Icon, WandIcon } from "lucide-react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface VoicePanelProps {
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

interface TtsArtifact {
  text: string;
  url: string;
  timestamp: number;
}

interface VoiceboxHealth {
  status: string;
  model_loaded: boolean;
  model_size: string;
  backend_variant: string;
}

export function VoicePanel({ onClose, frameless }: VoicePanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [voiceboxHealth, setVoiceboxHealth] = useState<VoiceboxHealth | null>(null);
  const [voiceboxError, setVoiceboxError] = useState(false);
  const [ttsArtifacts, setTtsArtifacts] = useState<TtsArtifact[]>([]);

  // Probe Voicebox health on mount.
  useEffect(() => {
    const voiceboxUrl = "/v1/voicebox";
    fetch(`${voiceboxUrl}/health`, { signal: AbortSignal.timeout(5000) })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: VoiceboxHealth) => setVoiceboxHealth(data))
      .catch(() => setVoiceboxError(true));
  }, []);

  // Scan conversation items for TTS tool outputs.
  // Reads from the SSE stream's function_call_output items.
  useEffect(() => {
    if (!conversationId) return;
    // The conversation items are streamed via SSE and stored in the chat store.
    // We read them from the server REST endpoint as a one-shot fetch.
    fetch(`/v1/sessions/${encodeURIComponent(conversationId)}/items?limit=200`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { data?: Array<{ type: string; output?: string; created_at?: number }> }) => {
        const artifacts: TtsArtifact[] = [];
        for (const item of data.data ?? []) {
          if (item.type === "function_call_output" && item.output) {
            try {
              const parsed = JSON.parse(item.output);
              if (parsed.audio_url) {
                artifacts.push({
                  text: parsed.text ?? "Untitled",
                  url: parsed.audio_url,
                  timestamp: item.created_at ?? 0,
                });
              }
            } catch {
              // Not JSON — skip.
            }
          }
        }
        setTtsArtifacts(artifacts.reverse()); // newest first
      })
      .catch(() => {
        // Items endpoint not available or no items — show empty state.
      });
  }, [conversationId]);

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
        {/* Voicebox status */}
        <div className="border-b border-border px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Volume2Icon className="size-3.5" />
            <span>{t("voice.voiceboxStatus", "Voicebox TTS")}</span>
          </div>
          <div className="mt-2">
            {voiceboxError ? (
              <div className="rounded-md bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
                {t(
                  "voice.voiceboxOffline",
                  "Voicebox offline — start the Docker container on port 17493",
                )}
              </div>
            ) : voiceboxHealth ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      voiceboxHealth.status === "healthy" ? "bg-emerald-500" : "bg-amber-500",
                    )}
                  />
                  <span className="text-foreground">
                    {voiceboxHealth.status === "healthy" ? "Healthy" : voiceboxHealth.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {voiceboxHealth.model_size} · {voiceboxHealth.backend_variant}
                </div>
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
              "Click the mic button in the composer to start dictation. Use the global hotkey for system-wide STT via Handy.",
            )}
          </div>
        </div>

        {/* TTS history */}
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <WandIcon className="size-3.5" />
            <span>{t("voice.ttsHistory", "TTS History")}</span>
          </div>
          {ttsArtifacts.length === 0 ? (
            <div className="mt-3 flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
              <AudioLinesIcon className="size-6 opacity-30" />
              <p>{t("voice.noTts", "No TTS artifacts yet. Ask the agent to speak something.")}</p>
            </div>
          ) : (
            <ul className="mt-2 space-y-2">
              {ttsArtifacts.map((artifact, i) => (
                <li key={i} className="rounded-md border border-border bg-muted/30 px-2.5 py-2">
                  <div className="truncate text-xs text-foreground">{artifact.text}</div>
                  <audio controls preload="none" className="mt-1.5 h-7 w-full" src={artifact.url} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
