// FirstBootChecklist — one-time stack health checklist shown on the
// chat landing screen when the stack first comes up (Docker quickstart).
//
// Polls GET /v1/stack/status (server-side aggregation of Hermes +
// Ollama health) and renders a live checklist: each row flips from
// spinner → check as its component reports ok. Dismissed state lives in
// localStorage so it shows exactly once per browser; a stack problem
// (hermes down / no models) keeps the card visible with actionable
// hints until the user explicitly dismisses it.
//
// Deliberately NOT a wizard: no forms, no steps — just live status and
// two buttons (Start chatting / Open Settings). Configuration that
// needs input (API keys, MCP servers) links into the existing Settings
// sections rather than duplicating them here.

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, Loader2Icon, SettingsIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MeowCatMascot } from "@/components/icons/MeowCatMascot";
import { authenticatedFetch } from "@/lib/identity";

const DISMISS_KEY = "agent-meow:first-boot-checklist-dismissed";

type ComponentStatus = "ok" | "down" | "unconfigured" | "auth_error" | "no_model" | "empty";

interface StackStatus {
  server: ComponentStatus;
  hermes: { status: ComponentStatus; detail?: string };
  ollama: { status: ComponentStatus; detail?: string; models?: string[]; count?: number };
  whisper_stt?: {
    status: ComponentStatus;
    detail?: string;
    model?: string;
  };
  tts?: { status: ComponentStatus; detail?: string };
}

interface Row {
  id: string;
  label: string;
  state: "ok" | "pending" | "warn";
  hint?: string;
}

function toRowState(s: ComponentStatus): "ok" | "pending" | "warn" {
  if (s === "ok") return "ok";
  if (s === "unconfigured") return "warn";
  return "pending";
}

export function FirstBootChecklist({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [status, setStatus] = useState<StackStatus | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/v1/stack/status");
      if (res.ok) {
        setStatus((await res.json()) as StackStatus);
      }
    } catch {
      // Server not up yet — keep polling; rows stay "pending".
    }
  }, []);

  useEffect(() => {
    if (dismissed !== false) return;
    void poll();
    timerRef.current = setInterval(poll, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [dismissed, poll]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Storage unavailable — dismissal just won't persist.
    }
    setDismissed(true);
  }, []);

  if (dismissed !== false) return null;

  const hermesStatus = status?.hermes?.status;
  const ollamaStatus = status?.ollama?.status;
  const ollamaCount = status?.ollama?.count;
  const whisperStatus = status?.whisper_stt?.status;

  // Build the row list ONCE — the STT row shows whisper-server (Vulkan iGPU)
  // when configured, else is hidden. Before the first poll, the row shows
  // as "pending" (spinner).
  const sttStatus = whisperStatus;
  const sttLabel = t("onboarding.whisperRow", "whisper-server (STT, Vulkan iGPU)");
  const sttHint = whisperStatus === "down"
    ? t("onboarding.whisperDownHint", "WHISPER_STT_URL set but server unreachable")
    : undefined;

  const allRows: Row[] = [
    {
      id: "server",
      label: t("onboarding.serverRow", "agent-meow framework"),
      state: status?.server === "ok" ? "ok" : "pending",
    },
    {
      id: "hermes",
      label: t("onboarding.hermesRow", "Hermes gateway (voice + tools)"),
      state: hermesStatus ? toRowState(hermesStatus) : "pending",
      hint:
        hermesStatus === "auth_error"
          ? t("onboarding.hermesAuthHint", "API key mismatch — check HERMES_API_KEY in .env")
          : hermesStatus === "unconfigured"
            ? t("onboarding.hermesUnconfiguredHint", "HERMES_VOICE_URL not set — voice disabled")
            : undefined,
    },
    {
      id: "ollama",
      label: ollamaCount
        ? t("onboarding.ollamaRowReady", "{{count}} models ready", { count: ollamaCount })
        : t("onboarding.ollamaRow", "Ollama models"),
      state: ollamaStatus
        ? ollamaStatus === "ok"
          ? "ok"
          : ollamaStatus === "empty"
            ? "pending"
            : toRowState(ollamaStatus)
        : "pending",
      hint:
        ollamaStatus === "empty"
          ? t("onboarding.ollamaPullingHint", "Pulling default models — first boot takes a few minutes")
          : undefined,
    },
    {
      id: "stt",
      label: sttLabel,
      state: sttStatus
        ? sttStatus === "ok"
          ? "ok"
          : sttStatus === "empty"
            ? "pending"
            : sttStatus === "no_model"
              ? "warn"
              : sttStatus === "unconfigured"
                ? "ok" // unconfigured is fine — hidden below, doesn't affect allOk
                : toRowState(sttStatus)
        : "pending",
      hint: sttHint,
    },
  ];

  // Filter out the STT row only when the server explicitly says
  // "unconfigured" for whisper-server — before the first poll,
  // it stays as "pending" so the row is visible (spinner) and doesn't flash.
  const rows = allRows.filter(
    (r) => r.id !== "stt" || sttStatus !== "unconfigured",
  );

  const allOk = rows.every((r) => r.state === "ok");
  const okCount = rows.filter((r) => r.state === "ok").length;
  const progressPct = Math.round((okCount / rows.length) * 100);

  return (
    <div
      className="mx-auto w-full max-w-md overflow-hidden rounded-xl border bg-card"
      data-testid="first-boot-checklist"
      style={{
        animation: "firstboot-card-in 400ms cubic-bezier(0.16, 1, 0.3, 1) both",
        // Glossy surface — same primitives the welcome hero uses:
        // brand-tinted glass surface + warm brand shadow.
        background: "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 3%, var(--card)) 0%, var(--card) 60%)",
        boxShadow: "0 8px 32px color-mix(in srgb, var(--brand-primary) 8%, transparent), 0 1px 3px rgba(0,0,0,0.04)",
        borderColor: "color-mix(in srgb, var(--brand-primary) 12%, var(--border))",
      }}
    >
      {/* Progress bar — gradient fill (brand-primary → brand-primary-hover)
          matching the welcome hero headline gradient. Glossy sheen on top. */}
      <div
        className="h-1 w-full"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{ background: "color-mix(in srgb, var(--border) 50%, transparent)" }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPct}%`,
            background: allOk
              ? "linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%)"
              : "linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 50%, var(--muted-foreground)) 0%, var(--muted-foreground) 100%)",
            boxShadow: allOk ? "0 0 8px color-mix(in srgb, var(--brand-primary) 40%, transparent)" : "none",
          }}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <MeowCatMascot className="size-8" />
            <div>
              <h2 className="text-base font-semibold leading-tight">
                {t("onboarding.title", "Welcome to agent-meow")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {allOk
                  ? t("onboarding.ready", "All systems ready")
                  : t("onboarding.connecting", "Connecting to services…")}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={dismiss} aria-label={t("onboarding.dismiss", "Dismiss")}>
            <XIcon className="size-4" />
          </Button>
        </div>

        <ul className="mt-4 space-y-1">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-sm transition-all duration-200"
              data-testid={`checklist-row-${row.id}`}
              style={{
                animation: "firstboot-row-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
                animationDelay: `${i * 50}ms`,
                background: row.state === "ok"
                  ? "linear-gradient(90deg, color-mix(in srgb, var(--brand-primary) 6%, transparent) 0%, transparent 80%)"
                  : "transparent",
              }}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                {row.state === "ok" ? (
                  <span
                    className="flex size-5 items-center justify-center rounded-full"
                    style={{
                      // Gradient check badge — same gradient as the welcome
                      // hero headline, with a soft glow.
                      background: "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%)",
                      boxShadow: "0 2px 8px color-mix(in srgb, var(--brand-primary) 25%, transparent)",
                      animation: "firstboot-check-in 250ms cubic-bezier(0.16, 1, 0.3, 1) both",
                    }}
                  >
                    <CheckIcon className="size-3 text-white" />
                  </span>
                ) : row.state === "warn" ? (
                  <span className="size-2.5 rounded-full bg-amber-500/40" />
                ) : (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground/60" />
                )}
              </span>
              <span className="flex-1">
                <span
                  className="transition-colors duration-200"
                  style={{ color: row.state === "ok" ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {row.label}
                </span>
                {row.hint && <span className="block text-xs text-muted-foreground/80">{row.hint}</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-2">
          <Button
            size="sm"
            onClick={dismiss}
            style={allOk ? { animation: "firstboot-ready-pulse 400ms cubic-bezier(0.16, 1, 0.3, 1) both" } : undefined}
          >
            {allOk
              ? t("onboarding.startChatting", "Start chatting")
              : t("onboarding.continueAnyway", "Continue anyway")}
          </Button>
          {onOpenSettings && (
            <Button size="sm" variant="outline" onClick={onOpenSettings}>
              <SettingsIcon className="size-4" />
              {t("onboarding.openSettings", "Settings")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}