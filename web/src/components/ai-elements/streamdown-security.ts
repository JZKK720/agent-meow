import { cjk } from "@streamdown/cjk";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import { defaultRehypePlugins, type LinkSafetyConfig, type StreamdownProps } from "streamdown";
import { HtmlRenderer } from "./htmlRenderer";
import { lazyCodePlugin } from "./lazyCodePlugin";

type StreamdownRehypePlugins = NonNullable<StreamdownProps["rehypePlugins"]>;
type StreamdownRehypePlugin = StreamdownRehypePlugins[number];
type StreamdownPluginTuple = Extract<StreamdownRehypePlugin, readonly unknown[]>;
type StreamdownHardenOptions = {
  allowedImagePrefixes: string[];
  allowedLinkPrefixes?: string[];
  allowedProtocols?: string[];
  allowDataImages?: boolean;
  defaultOrigin?: string;
};
type StreamdownHardenPlugin = StreamdownPluginTuple & {
  1: StreamdownHardenOptions;
};

// `renderers` wires custom code-block renderers. The `html` renderer
// (defined in `htmlRenderer.tsx`) sanitizes the fenced HTML with DOMPurify
// and renders it in a `<iframe sandbox="allow-same-origin">` (no
// `allow-scripts`), so agent-authored ```html blocks render as live UI
// without ever executing script. See `htmlRenderer.tsx` for the full
// security rationale.
// Image sources allowed to render inline in chat markdown. The SPA is
// served by the same server that hosts session resources
// (/sessions/{id}/resources/images), so relative prefixes are inherently
// first-party — no external fetches. data:image URIs cover agent-generated
// inline charts/plots. Everything else (arbitrary remote URLs) stays
// blocked: markdown images are a known prompt-injection exfiltration
// channel (see wraith.sh "Data Exfiltration via Markdown Images").
export const CHAT_IMAGE_ALLOWLIST = [
  "/sessions/",
  "/v1/sessions/",
  "data:image/",
];

// Cap base64 image payloads so a hallucinating model can't bloat the DOM
// with multi-megabyte data URIs (same failure class as the TTS size guard).
// ~2MB of binary ≈ 2.7MB of base64.
export const MAX_DATA_IMAGE_BYTES = 2 * 1024 * 1024;

export const STREAMDOWN_PLUGINS = {
  cjk,
  code: lazyCodePlugin,
  math,
  mermaid,
  renderers: [{ language: "html", component: HtmlRenderer }],
};
export const SECURE_STREAMDOWN_REHYPE_PLUGINS = createSecureStreamdownRehypePlugins();

// Streamdown enables a link-safety confirmation modal by default: clicking any
// markdown link pops an "Open external link?" dialog instead of following the
// link. Disable it so chat links behave like ordinary links — a plain click
// opens them and cmd/ctrl-click opens a new tab. With safety off Streamdown
// still renders the anchor as `<a target="_blank" rel="noreferrer">`, so we
// keep new-tab opening plus referrer/reverse-tabnabbing protection without the
// extra confirmation click.
export const CHAT_LINK_SAFETY: LinkSafetyConfig = { enabled: false };

function isStreamdownHardenPlugin(
  plugin: StreamdownRehypePlugin,
): plugin is StreamdownHardenPlugin {
  return Array.isArray(plugin) && plugin.length >= 2 && isHardenOptions(plugin[1]);
}

function isHardenOptions(value: unknown): value is StreamdownHardenOptions {
  return (
    typeof value === "object" &&
    value !== null &&
    "allowedImagePrefixes" in value &&
    Array.isArray(value.allowedImagePrefixes)
  );
}

function createSecureStreamdownRehypePlugins(): StreamdownRehypePlugins {
  return Object.entries(defaultRehypePlugins).map(([key, plugin]) => {
    if (key !== "harden") {
      return plugin;
    }

    if (!isStreamdownHardenPlugin(plugin)) {
      throw new Error("Streamdown harden plugin must be a [plugin, options] tuple");
    }

    return [
      plugin[0],
      {
        ...plugin[1],
        // Resolve relative image/link URLs against the page origin. The
        // SPA is served by the same server that hosts session resources,
        // so this keeps first-party paths working while rehype-harden
        // requires an explicit origin when specific prefixes are set.
        defaultOrigin:
          typeof window !== "undefined" ? window.location.origin : undefined,
        allowedImagePrefixes: CHAT_IMAGE_ALLOWLIST,
        allowDataImages: true,
      },
    ] satisfies StreamdownPluginTuple;
  });
}
