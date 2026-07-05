// ImageEditor — full-pane image editor for a single image, using Fabric.js.
// Loads the image binary onto a Fabric canvas, supports crop/rotate/filters/
// annotate, and saves the Fabric.js canvas JSON via
// PATCH /v1/sessions/{id}/resources/images/{imageId}/edit (store-and-forward).
//
// The original binary is never modified; the saved edit_json is rendered
// on top of it in the browser. This is the v1 approach — server-side
// rendering is deferred.

import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import {
  DownloadIcon,
  RotateCwIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImage, useUpdateImageEdit } from "@/hooks/useImages";
import { imageUrl } from "@/lib/imagesApi";
import { useTranslation } from "react-i18next";

interface ImageEditorProps {
  conversationId: string;
  imageId: string;
  onClose: () => void;
}

export function ImageEditor({ conversationId, imageId, onClose }: ImageEditorProps) {
  const { data: image, isLoading } = useImage(conversationId, imageId);
  const updateEdit = useUpdateImageEdit(conversationId);
  const { t } = useTranslation();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  // Initialize the Fabric canvas once.
  useEffect(() => {
    if (!canvasElRef.current || canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: "#1a1a1a",
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;
    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, []);

  // Load the image onto the canvas when it arrives.
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const url = imageUrl(conversationId, image.id);

    fabric.Image.fromURL(url).then((img) => {
      // Scale to fit a reasonable editor width.
      const maxW = 800;
      const scale = Math.min(1, maxW / (img.width || maxW));
      img.scale(scale);
      canvas.width = (img.width || 0) * scale;
      canvas.height = (img.height || 0) * scale;
      canvas.backgroundImage = img;
      canvas.renderAll();
    });

    // If there's a saved edit_json, load it on top.
    if (image.hasEdits && (image as { editJson?: string }).editJson) {
      try {
        const json = JSON.parse((image as { editJson?: string }).editJson!);
        canvas.loadFromJSON(json).then(() => canvas.renderAll());
      } catch {
        // Ignore malformed edit JSON.
      }
    }
  }, [image, conversationId]);

  const handleRotate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.rotate((obj.angle || 0) + 90);
      canvas.renderAll();
    }
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const json = JSON.stringify(canvas.toJSON());
    setSaveStatus("saving");
    updateEdit.mutate(
      { imageId: image.id, editJson: json },
      {
        onSuccess: () => {
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1500);
        },
        onError: () => setSaveStatus("error"),
      },
    );
  }, [image, updateEdit]);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `edit-${image?.filename ?? "image"}.png`;
    a.click();
  }, [image]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {t("images.loadingImage")}
      </div>
    );
  }
  if (!image) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-destructive">
        {t("images.notFound")}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {image.filename}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {saveStatus === "saving" && t("docs.saving")}
          {saveStatus === "saved" && t("docs.saved")}
          {saveStatus === "error" && t("docs.saveFailed")}
          {saveStatus === "idle" && `${image.width}×${image.height}`}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("images.rotate")}
          onClick={handleRotate}
        >
          <RotateCwIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("images.download")}
          onClick={handleDownload}
        >
          <DownloadIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("images.saveEdit")}
          onClick={handleSave}
          disabled={updateEdit.isPending}
        >
          <SaveIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t("images.close")}
          onClick={onClose}
        >
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="min-h-0 flex-1 overflow-auto bg-neutral-900 p-4">
        <canvas ref={canvasElRef} className={cn("mx-auto")} />
      </div>
    </div>
  );
}