import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import { authenticatedFetch } from "@/lib/identity";

export interface ProducedFile {
  path: string;
  mime: string;
  size: number;
  contentUrl: string;
}

/**
 * Fetch file content from the runner filesystem API (which returns
 * JSON with base64 or utf-8 encoded content) and convert it to a
 * blob URL suitable for <img src> or <video src>.
 */
function useBlobUrl(contentUrl: string, mime: string): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    (async () => {
      try {
        const res = await authenticatedFetch(contentUrl);
        if (!res.ok) return;
        const data = await res.json();
        let blob: Blob;
        if (data.encoding === "base64") {
          const binary = atob(data.content);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          blob = new Blob([bytes], { type: mime || data.content_type || "application/octet-stream" });
        } else {
          blob = new Blob([data.content], { type: mime || data.content_type || "text/plain" });
        }
        url = URL.createObjectURL(blob);
        if (!cancelled) setBlobUrl(url);
      } catch {
        // Silent fail — card shows file chip fallback
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [contentUrl, mime]);

  return blobUrl;
}

/**
 * Infer MIME type from file extension.
 */
function inferMime(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"];
  const videoExts = ["mp4", "webm", "mov", "avi", "mkv"];
  if (imageExts.includes(ext)) return `image/${ext === "jpg" ? "jpeg" : ext}`;
  if (videoExts.includes(ext)) return `video/${ext}`;
  if (ext === "md") return "text/markdown";
  if (ext === "html") return "text/html";
  return "application/octet-stream";
}

export function FileProducedCard({ file }: { file: ProducedFile }) {
  const effectiveMime = file.mime === "application/octet-stream" ? inferMime(file.path) : file.mime;
  const blobUrl = useBlobUrl(file.contentUrl, effectiveMime);

  if (effectiveMime.startsWith("image/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        {blobUrl ? (
          <img src={blobUrl} alt={file.path} className="max-w-full rounded" />
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">Loading…</div>
        )}
      </div>
    );
  }

  if (effectiveMime.startsWith("video/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        {blobUrl ? (
          <video controls src={blobUrl} className="w-full rounded-md" />
        ) : (
          <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">Loading…</div>
        )}
      </div>
    );
  }

  return (
    <div className="my-2 flex items-center gap-2 rounded-md border p-2">
      <FileIcon className="size-4 text-muted-foreground" />
      <div className="flex flex-col">
        <a href={file.contentUrl} download={file.path} className="text-sm font-medium hover:underline">
          {file.path}
        </a>
        <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
      </div>
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}