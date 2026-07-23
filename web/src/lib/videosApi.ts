// Typed client for the agent-meow Videos surface endpoints:
//   GET    /v1/sessions/{id}/resources/videos
//   POST   /v1/sessions/{id}/resources/videos        (multipart upload)
//   GET    /v1/sessions/{id}/resources/videos/{id}   (binary)
//   DELETE /v1/sessions/{id}/resources/videos/{id}
//
// Mirrors agent_meow/server/routes/videos.py. Wire is snake_case; the TS
// surface is camelCase. Conversions happen at the boundary.
// The Videos surface is the backend-wired analog of Images: binary assets
// owned by a conversation, with metadata in VideoStore + binary in
// ArtifactStore. The agent-side `video_*` tools are dispatched via
// `_execute_video_tool` in the runner; this client is what the web UI uses
// to browse/play/delete videos the agent (or the user) uploads.

import { authenticatedFetch } from "./identity";

/** Wire shape of a video metadata response from the server. */
interface VideoWire {
  id: string;
  object: "video";
  conversation_id: string;
  filename: string;
  mime: string;
  duration_seconds: number | null;
  width: number;
  height: number;
  bytes_size: number;
  created_at: number;
  updated_at: number;
  created_by: string | null;
}

/** UI-facing video record (camelCase). */
export interface VideoAsset {
  id: string;
  conversationId: string;
  filename: string;
  mime: string;
  durationSeconds: number | null;
  width: number;
  height: number;
  bytesSize: number;
  createdAt: number;
  updatedAt: number;
  createdBy: string | null;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toVideo(w: VideoWire): VideoAsset {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    filename: w.filename,
    mime: w.mime,
    durationSeconds: w.duration_seconds,
    width: w.width,
    height: w.height,
    bytesSize: w.bytes_size,
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    createdBy: w.created_by,
  };
}

/** List videos for a session, newest-first. */
export async function listVideos(conversationId: string): Promise<VideoAsset[]> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/videos`,
  );
  if (!res.ok) {
    throw new Error(`listVideos failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: VideoWire[] };
  return body.data.map(toVideo);
}

/** Upload a video file to a session (multipart). */
export async function uploadVideo(
  conversationId: string,
  file: File,
): Promise<VideoAsset> {
  const form = new FormData();
  form.append("file", file);
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/videos`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    throw new Error(`uploadVideo failed: ${res.status} ${res.statusText}`);
  }
  return toVideo((await res.json()) as VideoWire);
}

/** Delete a video. */
export async function deleteVideo(conversationId: string, videoId: string): Promise<void> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/videos/${encodeURIComponent(videoId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteVideo failed: ${res.status} ${res.statusText}`);
  }
}

/** Build the binary URL for a video (used as <video src>). */
export function videoUrl(conversationId: string, videoId: string): string {
  return `/v1/sessions/${encodeURIComponent(conversationId)}/resources/videos/${encodeURIComponent(videoId)}`;
}