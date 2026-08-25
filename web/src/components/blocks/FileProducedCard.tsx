import { SessionImage } from "@/components/SessionImage";
import { FileIcon } from "lucide-react";

export interface ProducedFile {
  path: string;
  mime: string;
  size: number;
  contentUrl: string;
}

export function FileProducedCard({ file }: { file: ProducedFile }) {
  if (file.mime.startsWith("image/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        <SessionImage path={file.contentUrl} alt={file.path} className="max-w-full rounded" />
      </div>
    );
  }

  if (file.mime.startsWith("video/")) {
    return (
      <div className="my-2 rounded-md border p-2">
        <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileIcon className="size-3" />
          <span>{file.path}</span>
          <span className="text-muted-foreground/60">·</span>
          <span>{formatSize(file.size)}</span>
        </div>
        <video controls src={file.contentUrl} className="w-full rounded-md" />
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