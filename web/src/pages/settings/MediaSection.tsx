// MediaSection — settings section for configuring image/video generation
// providers and vision models. Lets end-users set up DashScope, fal.ai,
// local A1111, or HyperFrames without needing to set environment variables.
//
// Config is persisted via PUT /v1/settings/media and read via GET /v1/settings/media.
// The backend stores it in ~/.agent-meow/media-config.json and applies the env
// vars to the running process so the runner picks them up.

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, FilmIcon, EyeIcon, CheckIcon, AlertCircleIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/identity";

// Re-declare Section locally since SettingsPage doesn't export it.
function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────

interface MediaConfig {
  image_provider: string;      // "none" | "dashscope" | "fal" | "a1111" | "hosted"
  image_api_key: string;       // DASHSCOPE_API_KEY or FAL_KEY
  image_api_url: string;       // A1111_API_URL or IMAGE_GEN_API_URL
  image_model: string;         // optional model override
  video_provider: string;      // "none" | "dashscope" | "fal" | "hyperframes" | "pixelle"
  video_api_key: string;       // DASHSCOPE_API_KEY or FAL_KEY (shared with image if same)
  video_api_url: string;       // PIXELLE_VIDEO_URL
  video_model: string;         // optional model override
  vision_provider: string;     // "none" | "ollama" | "main"
  vision_model: string;        // e.g. "gemma4:26b-a4b-it-qat"
}

const DEFAULT_CONFIG: MediaConfig = {
  image_provider: "none",
  image_api_key: "",
  image_api_url: "",
  image_model: "",
  video_provider: "none",
  video_api_key: "",
  video_api_url: "",
  video_model: "",
  vision_provider: "none",
  vision_model: "",
};

// ── Provider metadata ──────────────────────────────────────────────────────

const IMAGE_PROVIDERS = [
  { value: "none", label: "None", needsKey: false, needsUrl: false },
  { value: "dashscope", label: "DashScope (万相)", needsKey: true, needsUrl: false, defaultModel: "wanx2.1-t2i-turbo" },
  { value: "fal", label: "fal.ai", needsKey: true, needsUrl: false, defaultModel: "fal-ai/flux/schnell" },
  { value: "a1111", label: "Local A1111 (Stable Diffusion)", needsKey: false, needsUrl: true, defaultModel: "" },
  { value: "hosted", label: "Custom hosted API", needsKey: true, needsUrl: true, defaultModel: "" },
];

const VIDEO_PROVIDERS = [
  { value: "none", label: "None", needsKey: false, needsUrl: false },
  { value: "dashscope", label: "DashScope (万相视频)", needsKey: true, needsUrl: false, defaultModel: "wan2.2-t2v-flash" },
  { value: "fal", label: "fal.ai", needsKey: true, needsUrl: false, defaultModel: "fal-ai/wan-2.1-i2v" },
  { value: "hyperframes", label: "HyperFrames (local, free)", needsKey: false, needsUrl: false, defaultModel: "" },
  { value: "pixelle", label: "Pixelle-Video (self-hosted)", needsKey: false, needsUrl: true, defaultModel: "" },
];

const VISION_PROVIDERS = [
  { value: "none", label: "None", needsModel: false },
  { value: "main", label: "Use main model (if vision-capable)", needsModel: false },
  { value: "ollama", label: "Ollama vision model", needsModel: true },
];

// ── Subsection component ───────────────────────────────────────────────────

function ProviderSubsection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex flex-col gap-3 pt-1">{children}</div>
    </div>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ configured }: { configured: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        configured
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      )}
    >
      {configured ? (
        <>
          <CheckIcon className="size-3" />
          Configured
        </>
      ) : (
        <>
          <AlertCircleIcon className="size-3" />
          Not configured
        </>
      )}
    </span>
  );
}

// ── Main section ───────────────────────────────────────────────────────────

export function MediaSection() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<MediaConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current config on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await authenticatedFetch("/v1/settings/media");
        if (resp.ok) {
          const data = await resp.json();
          if (!cancelled) setConfig({ ...DEFAULT_CONFIG, ...data });
        }
      } catch {
        // Endpoint may not exist yet — defaults are fine.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback((patch: Partial<MediaConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const resp = await authenticatedFetch("/v1/settings/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!resp.ok) {
        setError(`Save failed: ${resp.status}`);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [config]);

  const imageProvider = IMAGE_PROVIDERS.find((p) => p.value === config.image_provider);
  const videoProvider = VIDEO_PROVIDERS.find((p) => p.value === config.video_provider);
  const visionProvider = VISION_PROVIDERS.find((p) => p.value === config.vision_provider);

  const imageConfigured = config.image_provider !== "none" && Boolean(
    !imageProvider?.needsKey || config.image_api_key
  ) && Boolean(
    !imageProvider?.needsUrl || config.image_api_url
  );
  const videoConfigured = config.video_provider !== "none" && Boolean(
    !videoProvider?.needsKey || config.video_api_key
  ) && Boolean(
    !videoProvider?.needsUrl || config.video_api_url
  );
  const visionConfigured = config.vision_provider !== "none" && Boolean(
    !visionProvider?.needsModel || config.vision_model
  );

  if (loading) {
    return (
      <Section title={t("settings.media", "Media & Generation")}>
        <p className="text-sm text-muted-foreground">{t("common.loading", "Loading…")}</p>
      </Section>
    );
  }

  return (
    <Section
      title={t("settings.media", "Media & Generation")}
      description={t("settings.mediaDesc", "Configure image generation, video generation, and vision providers.")}
    >
      <div className="flex flex-col gap-4">
        {/* Image Generation */}
        <ProviderSubsection
          icon={ImageIcon}
          title={t("settings.imageGen", "Image Generation")}
          description={t("settings.imageGenDesc", "AI text-to-image generation for the Images panel.")}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <StatusBadge configured={imageConfigured} />
          </div>
          <Select value={config.image_provider} onValueChange={(v) => update({ image_provider: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {imageProvider?.needsKey && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={config.image_api_key}
                onChange={(e) => update({ image_api_key: e.target.value })}
              />
            </div>
          )}
          {imageProvider?.needsUrl && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">API URL</label>
              <Input
                type="url"
                placeholder="http://127.0.0.1:7860/v1"
                value={config.image_api_url}
                onChange={(e) => update({ image_api_url: e.target.value })}
              />
            </div>
          )}
          {config.image_provider !== "none" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Model (optional{imageProvider?.defaultModel ? `, default: ${imageProvider.defaultModel}` : ""})
              </label>
              <Input
                type="text"
                placeholder={imageProvider?.defaultModel || "Provider default"}
                value={config.image_model}
                onChange={(e) => update({ image_model: e.target.value })}
              />
            </div>
          )}
        </ProviderSubsection>

        {/* Video Generation */}
        <ProviderSubsection
          icon={FilmIcon}
          title={t("settings.videoGen", "Video Generation")}
          description={t("settings.videoGenDesc", "AI text-to-video generation for the Videos panel.")}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <StatusBadge configured={videoConfigured} />
          </div>
          <Select value={config.video_provider} onValueChange={(v) => update({ video_provider: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VIDEO_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {videoProvider?.needsKey && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <Input
                type="password"
                placeholder="Enter your API key"
                value={config.video_api_key}
                onChange={(e) => update({ video_api_key: e.target.value })}
              />
            </div>
          )}
          {videoProvider?.needsUrl && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">API URL</label>
              <Input
                type="url"
                placeholder="http://127.0.0.1:8000"
                value={config.video_api_url}
                onChange={(e) => update({ video_api_url: e.target.value })}
              />
            </div>
          )}
          {config.video_provider !== "none" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                Model (optional{videoProvider?.defaultModel ? `, default: ${videoProvider.defaultModel}` : ""})
              </label>
              <Input
                type="text"
                placeholder={videoProvider?.defaultModel || "Provider default"}
                value={config.video_model}
                onChange={(e) => update({ video_model: e.target.value })}
              />
            </div>
          )}
        </ProviderSubsection>

        {/* Vision */}
        <ProviderSubsection
          icon={EyeIcon}
          title={t("settings.vision", "Vision (Image Understanding)")}
          description={t("settings.visionDesc", "Configure a vision-capable model so the agent can see and analyze images.")}
        >
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-muted-foreground">Provider</label>
            <StatusBadge configured={visionConfigured} />
          </div>
          <Select value={config.vision_provider} onValueChange={(v) => update({ vision_provider: v })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISION_PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {visionProvider?.needsModel && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <Input
                type="text"
                placeholder="gemma4:26b-a4b-it-qat"
                value={config.vision_model}
                onChange={(e) => update({ vision_model: e.target.value })}
              />
              <p className="text-[11px] text-muted-foreground">
                Use an Ollama model that supports vision (e.g. gemma4, qwen3.5-vision).
              </p>
            </div>
          )}
        </ProviderSubsection>

        {/* Save bar */}
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save configuration"}
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckIcon className="size-4" />
              Saved — restart the server to apply changes.
            </span>
          )}
          {error && (
            <span className="text-sm text-destructive">{error}</span>
          )}
        </div>
      </div>
    </Section>
  );
}