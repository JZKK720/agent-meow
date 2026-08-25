// Sandboxed HTML renderer for Streamdown code blocks fenced as ```html.
//
// The chat renders agent messages with Streamdown (react-markdown). An
// ```html``` code block would otherwise render as syntax-highlighted source.
// Instead we render it as actual HTML — but only after DOMPurify strips
// anything executable and only inside a `<iframe sandbox="allow-same-origin">`
// that does NOT grant `allow-scripts`, so even a sanitizer miss cannot run
// script. The iframe's `srcdoc` is the sanitized string; the parent document
// and the iframe share origin so the iframe can inherit sizing, but no
// scripts, no forms, no popups, no top navigation.
//
// Registered globally via `STREAMDOWN_PLUGINS.renderers` in
// `streamdown-security.ts`, so every Streamdown surface (chat, reasoning)
// gets the same sandboxed HTML behavior. The component lives here (next to
// `streamdown-security.ts`) rather than in `BlockRenderer.tsx` to avoid a
// circular import: `BlockRenderer` → `message` → `streamdown-security` →
// `BlockRenderer` would otherwise form a cycle.

import DOMPurify from "dompurify";

// The tag allowlist is deliberately broad for presentation (div/span/section/
// tables/lists/figures) but excludes anything that loads external resources
// or runs code: no `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`,
// `<input>`, `<base>`, `<link>`, `<meta>`. Inline `style` is allowed (the
// agent's colored boxes need it); inline event handlers are forbidden by
// `FORBID_ATTR` and would also be inert inside the sandboxed iframe.
const HTML_ALLOWED_TAGS = [
  "div", "span", "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "style",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th", "caption", "colgroup", "col",
  "ul", "ol", "li", "dl", "dt", "dd",
  "img", "a",
  "strong", "em", "b", "i", "u", "s", "del", "ins", "mark", "sub", "sup", "small",
  "code", "pre", "kbd", "samp", "var",
  "blockquote", "q", "cite",
  "figure", "figcaption",
  "section", "article", "header", "footer", "nav", "aside", "main", "address",
  "details", "summary",
  "abbr", "time", "data",
];

const HTML_ALLOWED_ATTR = [
  "style", "class", "id",
  "href", "src", "alt", "title",
  "width", "height",
  "colspan", "rowspan", "span",
  "start", "type", "value", "reversed",
  "datetime",
  "target", "rel",
  "open",
];

// Explicitly forbid on* event handlers and javascript: URLs even though the
// allowlist above already excludes them — defense in depth, and it makes the
// intent obvious to a future reader. DOMPurify strips `javascript:` URIs on
// `href`/`src` by default; FORBID_ATTR is the belt, the sandbox is the
// suspenders.
const HTML_FORBID_ATTR = [
  "onclick", "onload", "onerror", "onmouseover", "onmouseout",
  "onsubmit", "onfocus", "onblur", "onchange", "oninput", "onkeydown",
  "onkeyup", "onmouseenter", "onmouseleave", "ontoggle",
];

export function HtmlRenderer({
  code,
  isIncomplete,
}: {
  code: string;
  isIncomplete: boolean;
  language?: string;
}) {
  // While the agent is still streaming the ```html block, the fence content
  // is partial and may be invalid HTML. Render a placeholder instead of a
  // half-parsed (and possibly flashing) iframe; the final frame replaces it
  // once the block closes.
  if (isIncomplete) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border bg-muted animate-pulse">
        <span className="text-muted-foreground text-sm">Rendering HTML…</span>
      </div>
    );
  }

  const clean = DOMPurify.sanitize(code, {
    ALLOWED_TAGS: HTML_ALLOWED_TAGS,
    ALLOWED_ATTR: HTML_ALLOWED_ATTR,
    FORBID_ATTR: HTML_FORBID_ATTR,
    // `javascript:` and `data:` URLs on href/src are stripped by default;
    // keep that default rather than re-listing URI schemes here.
  });

  return (
    <iframe
      srcDoc={clean}
      // `allow-same-origin` only — NO `allow-scripts`. The iframe shares the
      // page origin (so it can size/styled) but cannot execute any script,
      // submit forms, open popups, or navigate the top window. Even if a
      // sanitizer bypass let an event handler through, the sandbox makes it
      // inert.
      sandbox="allow-same-origin"
      className="w-full border rounded-md"
      style={{ minHeight: "200px" }}
      title="HTML preview"
    />
  );
}