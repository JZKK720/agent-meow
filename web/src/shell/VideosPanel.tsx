// VideosPanel — the right-side rail tab for the agent-meow Videos surface.
// Mirrors ImagesPanel.tsx structure: a gallery grid of session videos with
// an upload button. Clicking a video plays it inline via an expanded <video>
// element. The backend (routes/videos.py) supports upload/list/get/delete;
// this panel covers browse/upload/play/delete. The agent-side `video_*`
// tools (dispatched via _execute_video_tool) populate this panel when an
// agent generates or uploads a video.

import { useState, useCallback } from "react";
import { FilmIcon, Trash2Icon, UploadIcon, XIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useDeleteVideo,
  useUploadVideo,
  useVideos,
} from "@/hooks/useVideos";
import { videoUrl } from "@/lib/videosApi";
import { useTranslation } from "react-i18next";

interface VideosPanelProps {
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

const VIDEO_ACCEPT: Record<string, string[]> = {
  "video/*": [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v", ".ogg"],
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDuration(seconds: number | null): string {
  if (seconds == null || seconds <= 0) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

export function VideosPanel({ onClose, frameless }: VideosPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: videos, isLoading, error } = useVideos(conversationId);
  const uploadVideo = useUploadVideo(conversationId);
  const deleteVideo = useDeleteVideo(conversationId);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      for (const file of accepted) {
        uploadVideo.mutate(file);
      }
    },
    [uploadVideo],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: VIDEO_ACCEPT,
    noClick: true,
  });

  function handleDelete(videoId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("videos.deleteConfirm", "Delete this video?"))) {
      if (playingId === videoId) setPlayingId(null);
      deleteVideo.mutate(videoId);
    }
  }

  function triggerUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = true;
    input.onchange = () => {
      if (input.files) {
        for (const f of Array.from(input.files)) {
          uploadVideo.mutate(f);
        }
      }
    };
    input.click();
  }

  const playingVideo = videos?.find((v) => v.id === playingId) ?? null;

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        frameless ? "" : "rounded-lg border border-border bg-card",
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <FilmIcon className="size-4 text-muted-foreground" />
          <span>{t("videos.title", "Videos")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("videos.upload", "Upload video")}
            onClick={triggerUpload}
            disabled={uploadVideo.isPending}
          >
            <UploadIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("common.close", "Close")}
              onClick={onClose}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Inline player (expanded view) */}
      {playingVideo && (
        <div className="shrink-0 border-b border-border bg-black p-2">
          <div className="relative">
            <video
              key={playingVideo.id}
              src={videoUrl(conversationId!, playingVideo.id)}
              controls
              autoPlay
              className="mx-auto max-h-[40vh] rounded"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 size-7 bg-black/60 text-white hover:bg-black/80"
              aria-label={t("common.close", "Close")}
              onClick={() => setPlayingId(null)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <p className="mt-1 truncate text-center text-xs text-muted-foreground">
            {playingVideo.filename}
          </p>
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading", "Loading…")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("videos.loadFailed", "Failed to load videos.")}
          </div>
        ) : !videos || videos.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <FilmIcon className="size-8 opacity-40" />
            <p>{t("videos.noVideos", "No videos yet.")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerUpload}
              disabled={uploadVideo.isPending}
            >
              <UploadIcon className="size-4" /> {t("videos.upload", "Upload video")}
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-2 gap-2 sm:grid-cols-3",
              isDragActive && "ring-2 ring-primary ring-offset-2 ring-offset-card rounded",
            )}
          >
            {videos.map((video) => (
              <button
                key={video.id}
                type="button"
                onClick={() => setPlayingId(video.id)}
                className="group relative flex flex-col gap-1 rounded-lg border border-border p-1.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/50"
              >
                {/* Thumbnail: a <video> element seeking to 0 with no controls,
                    muted + preload=metadata. Browsers render the first frame
                    as the poster. Cheap enough for a gallery grid. */}
                <div className="relative aspect-video w-full overflow-hidden rounded bg-black/80">
                  <video
                    src={videoUrl(conversationId!, video.id)}
                    muted
                    preload="metadata"
                    className="size-full object-contain"
                    onLoadedMetadata={(e) => {
                      // Some browsers need a tiny seek to paint a frame.
                      const el = e.currentTarget;
                      try {
                        el.currentTime = Math.min(0.1, (el.duration || 1) / 2);
                      } catch {
                        // Seek may throw if duration is unknown; ignore.
                      }
                    }}
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex size-9 items-center justify-center rounded-full bg-black/60 text-white">
                      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  {/* Duration badge */}
                  {video.durationSeconds != null && video.durationSeconds > 0 && (
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium text-white">
                      {formatDuration(video.durationSeconds)}
                    </span>
                  )}
                </div>
                {/* Filename + size */}
                <div className="min-w-0 flex items-center justify-between gap-1">
                  <span className="min-w-0 truncate text-xs font-medium text-foreground" title={video.filename}>
                    {video.filename}
                  </span>
                  <button
                    type="button"
                    aria-label={t("common.delete", "Delete")}
                    onClick={(e) => handleDelete(video.id, e)}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2Icon className="size-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatBytes(video.bytesSize)}
                  {video.width > 0 && video.height > 0 && ` · ${video.width}×${video.height}`}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload hint when dragging */}
      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-primary/10">
          <p className="text-sm font-medium text-primary">
            {t("videos.dropHere", "Drop video files here")}
          </p>
        </div>
      )}
    </div>
  );
}