/**
 * Monitoring Dashboard — live service health for the packaged desktop app.
 *
 * Polls GET /v1/stack/status every 5s and renders status cards with
 * PID, uptime, restart count, and a restart button for degraded services.
 *
 * This is the user-facing surface for the two-layer watchdog + service
 * supervisor architecture. The FirstBootChecklist shows on first launch;
 * this page is the persistent view accessible from Settings → Runtime Status.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckIcon,
  AlertTriangleIcon,
  Loader2Icon,
  RefreshCwIcon,
  ActivityIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageScroll } from "@/components/PageScroll";
import { authenticatedFetch } from "@/lib/identity";
import { cn } from "@/lib/utils";

type ComponentStatus = "ok" | "down" | "unconfigured" | "auth_error" | "no_model" | "empty";

interface ServiceMetric {
  name: string;
  pid: number | null;
  port: number;
  state: string;
  uptime_s: number;
  restart_count: number;
  last_error: string | null;
}

interface StackStatus {
  server: { status: ComponentStatus; detail?: string };
  hermes: { status: ComponentStatus; detail?: string };
  ollama: { status: ComponentStatus; detail?: string; models?: string[]; count?: number };
  lemonade_stt?: { status: ComponentStatus; detail?: string; model?: string };
  tts?: { status: ComponentStatus; detail?: string };
  services?: ServiceMetric[];
}

function StatusIcon({ status }: { status: ComponentStatus }) {
  if (status === "ok") return <CheckIcon className="size-4 text-emerald-500" />;
  if (status === "unconfigured") return <span className="text-muted-foreground">—</span>;
  if (status === "down" || status === "auth_error")
    return <AlertTriangleIcon className="size-4 text-red-500" />;
  return <Loader2Icon className="size-4 text-amber-500 animate-spin" />;
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
}

export function RuntimeStatusPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StackStatus | null>(null);
  const [restarting, setRestarting] = useState<string | null>(null);
  const [lastPoll, setLastPoll] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/v1/stack/status");
      if (res.ok) {
        setStatus(await res.json());
        setLastPoll(Date.now());
      }
    } catch {
      // Server not up — keep polling
    }
  }, []);

  useEffect(() => {
    void poll();
    timerRef.current = setInterval(poll, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [poll]);

  const restartService = async (name: string) => {
    setRestarting(name);
    try {
      await authenticatedFetch(`/v1/services/restart/${name}`, { method: "POST" });
    } catch {
      // best-effort
    } finally {
      setRestarting(null);
      void poll();
    }
  };

  const services = status?.services ?? [];
  const getServiceMetric = (name: string) => services.find((s) => s.name === name);
  const secondsSincePoll = lastPoll ? Math.round((Date.now() - lastPoll) / 1000) : 0;

  return (
    <PageScroll>
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">{t("Runtime Status")}</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void poll()}>
            <RefreshCwIcon className="size-4" />
          </Button>
        </div>

        <StatusCard
          title="agent-meow Server"
          port={6767}
          status={status?.server?.status ?? "unconfigured"}
        />

        <StatusCard
          title="Hermes CLI"
          status={status?.hermes?.status ?? "unconfigured"}
        />

        <StatusCard
          title="Ollama"
          port={11434}
          status={status?.ollama?.status ?? "unconfigured"}
          detail={status?.ollama?.models?.[0]}
        />

        <StatusCard
          title="Lemonade STT"
          port={13305}
          status={status?.lemonade_stt?.status ?? "unconfigured"}
          detail={status?.lemonade_stt?.model}
          metric={getServiceMetric("lemonade")}
          onRestart={() => restartService("lemonade")}
          restarting={restarting === "lemonade"}
        />

        <StatusCard
          title="Qwen3-TTS"
          port={8890}
          status={status?.tts?.status ?? "unconfigured"}
          metric={getServiceMetric("tts_server")}
          onRestart={() => restartService("tts_server")}
          restarting={restarting === "tts_server"}
        />

        <p className="text-xs text-muted-foreground pt-2">
          {t("Watchdog")}: {t("Active")} ({t("last check")}: {secondsSincePoll}s{" "}
          {t("ago")})
        </p>
      </div>
    </PageScroll>
  );
}

function StatusCard({
  title,
  port,
  status,
  detail,
  metric,
  onRestart,
  restarting,
}: {
  title: string;
  port?: number;
  status: ComponentStatus;
  detail?: string;
  metric?: ServiceMetric;
  onRestart?: () => void;
  restarting?: boolean;
}) {
  const isDegraded = metric?.state === "degraded";
  const isRestarting = metric?.state === "restarting";

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-1",
        isDegraded && "border-red-200 dark:border-red-900",
        isRestarting && "border-amber-200 dark:border-amber-900",
      )}
    >
      <div className="flex items-center gap-2">
        <StatusIcon status={status} />
        <span className="font-medium">{title}</span>
        {port && <span className="text-xs text-muted-foreground">:{port}</span>}
      </div>
      {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
      {metric && (
        <div className="text-xs text-muted-foreground flex gap-4">
          {metric.pid && <span>PID: {metric.pid}</span>}
          {metric.uptime_s > 0 && <span>Uptime: {formatUptime(metric.uptime_s)}</span>}
          <span>Restarts: {metric.restart_count}</span>
        </div>
      )}
      {metric?.last_error && (
        <p className="text-xs text-red-500">{metric.last_error}</p>
      )}
      {isDegraded && onRestart && (
        <Button size="sm" variant="outline" onClick={onRestart} disabled={restarting} className="mt-2">
          {restarting ? "Restarting..." : "Restart now"}
        </Button>
      )}
    </div>
  );
}
