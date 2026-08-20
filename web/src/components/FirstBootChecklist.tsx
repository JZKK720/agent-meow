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

  const rows: Row[] = [
    {
      id: "server",
      label: t("onboarding.serverRow", "agent-meow framework"),
      state: status?.server === "ok" ? "ok" : "pending",
    },
    {
      id: "hermes",
      label: t("onboarding.hermesRow", "Hermes gateway (voice + tools)"),
      state: status ? toRowState(status.hermes.status) : "pending",
      hint:
        status?.hermes.status === "auth_error"
          ? t("onboarding.hermesAuthHint", "API key mismatch — check HERMES_API_KEY in .env")
          : status?.hermes.status === "unconfigured"
            ? t("onboarding.hermesUnconfiguredHint", "HERMES_VOICE_URL not set — voice disabled")
            : undefined,
    },
    {
      id: "ollama",
      label: status?.ollama.count
        ? t("onboarding.ollamaRowReady", "{{count}} models ready", { count: status.ollama.count })
        : t("onboarding.ollamaRow", "Ollama models"),
      state: status
        ? status.ollama.status === "ok"
          ? "ok"
          : status.ollama.status === "empty"
            ? "pending"
            : toRowState(status.ollama.status)
        : "pending",
      hint:
        status?.ollama.status === "empty"
          ? t("onboarding.ollamaPullingHint", "Pulling default models — first boot takes a few minutes")
          : undefined,
    },
  ];

  const allOk = rows.every((r) => r.state === "ok");

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border bg-card p-5 shadow-sm" data-testid="first-boot-checklist">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MeowCatMascot className="size-7" />
          <h2 className="text-base font-semibold">{t("onboarding.title", "Welcome to agent-meow")}</h2>
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={dismiss} aria-label={t("onboarding.dismiss", "Dismiss")}>
          <XIcon className="size-4" />
        </Button>
      </div>

      <ul className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start gap-2.5 text-sm" data-testid={`checklist-row-${row.id}`}>
            <span className="mt-0.5 shrink-0">
              {row.state === "ok" ? (
                <CheckIcon className="size-4 text-green-600" />
              ) : row.state === "warn" ? (
                <span className="inline-block size-4 rounded-full bg-amber-500/30" />
              ) : (
                <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
              )}
            </span>
            <span>
              <span className={row.state === "ok" ? "text-foreground" : "text-muted-foreground"}>{row.label}</span>
              {row.hint && <span className="block text-xs text-muted-foreground">{row.hint}</span>}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-2">
        <Button size="sm" onClick={dismiss}>
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
  );
}