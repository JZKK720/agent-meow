// React Query hooks for the agent-meow Videos surface.
// Mirrors the useImages.ts pattern.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteVideo,
  listVideos,
  uploadVideo,
  type VideoAsset,
} from "@/lib/videosApi";

/** Stable query key for a session's videos list. */
export function videosQueryKey(conversationId: string): readonly unknown[] {
  return ["conversation", conversationId, "videos"] as const;
}

/** List videos for a session, newest-first. */
export function useVideos(conversationId: string | null | undefined) {
  return useQuery<VideoAsset[]>({
    queryKey:
      conversationId == null
        ? ["conversation", null, "videos"]
        : videosQueryKey(conversationId),
    queryFn: () => listVideos(conversationId!),
    enabled: conversationId != null,
  });
}

/** Upload a video file to a session. */
export function useUploadVideo(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadVideo(conversationId!, file),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: videosQueryKey(conversationId) });
      }
    },
  });
}

/** Delete a video. */
export function useDeleteVideo(conversationId: string | null | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => deleteVideo(conversationId!, videoId),
    onSuccess: () => {
      if (conversationId != null) {
        void qc.invalidateQueries({ queryKey: videosQueryKey(conversationId) });
      }
    },
  });
}