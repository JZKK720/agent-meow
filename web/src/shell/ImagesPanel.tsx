// ImagesPanel — the right-side rail tab for the agent-meow Images surface.
// Mirrors FilesPanel.tsx structure: a gallery grid of session images with
// an upload dropzone. Selecting an image opens the ImageEditor full-pane.

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2Icon, UploadIcon } from "lucide-react";
import { useParams } from "@/lib/routing";
import { Button } from "@/components/ui/button";
import { MeowCatMascot } from "@/components/icons/MeowCatMascot";
import { WelcomeMascot } from "@/components/icons/WelcomeMascot";
import { cn } from "@/lib/utils";
import {
  useDeleteImage,
  useImages,
  useUploadImage,
} from "@/hooks/useImages";
import { imageUrl } from "@/lib/imagesApi";
import { useTranslation } from "react-i18next";

interface ImagesPanelProps {
  /** Called when an image is selected for editing. */
  onImageSelect: (imageId: string) => void;
  /** Currently selected image id, or null. */
  selectedImageId: string | null;
  /** When provided, renders an X close button (drawer mode). */
  onClose?: () => void;
  /** Frameless mode: drops the rounded card chrome (inline panel). */
  frameless?: boolean;
}

export function ImagesPanel({
  onImageSelect,
  selectedImageId,
  onClose,
  frameless,
}: ImagesPanelProps) {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const { data: images, isLoading, error } = useImages(conversationId);
  const uploadImage = useUploadImage(conversationId);
  const deleteImage = useDeleteImage(conversationId);

  const onDrop = useCallback(
    (accepted: File[]) => {
      for (const file of accepted) {
        uploadImage.mutate(file);
      }
    },
    [uploadImage],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    noClick: true,
  });

  function handleDelete(imageId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(t("images.deleteConfirm"))) {
      deleteImage.mutate(imageId);
    }
  }

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
          <MeowCatMascot className="size-5" />
          <span>{t("images.title")}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t("images.upload")}
            onClick={() => {
              // Trigger a hidden file input via the dropzone's open method.
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.multiple = true;
              input.onchange = () => {
                if (input.files) {
                  for (const f of Array.from(input.files)) {
                    uploadImage.mutate(f);
                  }
                }
              };
              input.click();
            }}
            disabled={uploadImage.isPending}
          >
            <UploadIcon className="size-4" />
          </Button>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t("images.closePanel")}
              onClick={onClose}
            >
              <span className="text-lg leading-none">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto p-2",
          isDragActive && "bg-primary/5",
        )}
      >
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("common.loading")}
          </div>
        ) : error ? (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-destructive">
            {t("images.loadFailed")}
          </div>
        ) : !images || images.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-sm text-muted-foreground">
            <WelcomeMascot className="size-16" />
            <p>{t("images.noImages")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-md border border-border bg-muted/30 hover:ring-2 hover:ring-primary/40",
                  selectedImageId === img.id && "ring-2 ring-primary",
                )}
              >
                <button
                  type="button"
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`Open ${img.filename}`}
                  onClick={() => onImageSelect(img.id)}
                />
                <img
                  src={imageUrl(conversationId!, img.id)}
                  alt={img.filename}
                  className="size-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="truncate text-[10px] text-white">{img.filename}</span>
                  <button
                    type="button"
                    aria-label={t("common.delete")}
                    className="relative z-10 rounded p-0.5 text-white/80 hover:bg-white/20 hover:text-white"
                    onClick={(e) => handleDelete(img.id, e)}
                  >
                    <Trash2Icon className="size-3" />
                  </button>
                </div>
                {img.hasEdits && (
                  <span className="absolute right-1 top-1 rounded bg-primary px-1 text-[9px] text-primary-foreground">
                    {t("images.edited")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}