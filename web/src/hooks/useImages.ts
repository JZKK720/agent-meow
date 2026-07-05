// React Query hooks for the agent-meow Images surface.
// Mirrors the useDocuments.ts pattern.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteImage,
  getImage,
  listImages,
  updateImageEdit,
  uploadImage,
  type ImageAsset,
} from "@/lib/imagesApi";

/** Stable query key for a session's images list. */
export function imagesQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "images"] as const;
}

/** Stable query key for a single image. */
export function imageQueryKey(conversationId: string, imageId: string): readonly unknown[] {
  return ["conversation", conversationId, "images", imageId] as const;
}

/** Fetch a single image's metadata by id. */
export function useImage(
  conversationId: string | null | undefined,
  imageId: string | null | undefined,
) {
  return useQuery<ImageAsset>({
    queryKey:
      conversationId == null || imageId == null
        ? ["conversation", null, "images", null]
        : imageQueryKey(conversationId, imageId),
    queryFn: () => getImage(conversationId!, imageId!),
    enabled: conversationId != null && imageId != null,
  });
}

/** List images for a session, newest-first. */
export function useImages(conversationId: string | null | undefined) {
  return useQuery<ImageAsset[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "images"]
        : imagesQueryKey(conversationId),
    queryFn: () => listImages(conversationId!),
    enabled: conversationId != null,
  });
}

/** Upload an image file to a session. */
export function useUploadImage(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadImage(conversationId!, file),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: imagesQueryKey(conversationId) });
      }
    },
  });
}

/** Apply Fabric.js edit JSON to an image. */
export function useUpdateImageEdit(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { imageId: string; editJson: string }) =>
      updateImageEdit(conversationId!, input.imageId, input.editJson),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: imagesQueryKey(conversationId) });
      }
    },
  });
}

/** Delete an image. */
export function useDeleteImage(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteImage(conversationId!, imageId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: imagesQueryKey(conversationId) });
      }
    },
  });
}