// Typed client for the agent-meow Images surface endpoints:
//   GET    /v1/sessions/{id}/resources/images
//   POST   /v1/sessions/{id}/resources/images        (multipart upload)
//   GET    /v1/sessions/{id}/resources/images/{id}   (binary)
//   PATCH  /v1/sessions/{id}/resources/images/{id}/edit
//   DELETE /v1/sessions/{id}/resources/images/{id}
//
// Mirrors agent_meow/server/routes/images.py. Wire is snake_case; the TS
// surface is camelCase. Conversions happen at the boundary.

import { authenticatedFetch } from "./identity";

/** Wire shape of an image metadata response from the server. */
interface ImageWire {
  id: string;
  object: "image";
  conversation_id: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  bytes_size: number;
  has_edits: boolean;
  created_at: number;
  updated_at: number;
  created_by: string | null;
}

/** UI-facing image record (camelCase). */
export interface ImageAsset {
  id: string;
  conversationId: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  bytesSize: number;
  hasEdits: boolean;
  createdAt: number;
  updatedAt: number;
  createdBy: string | null;
}

function normalizeEpochSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1_000_000) : value;
}

function toImage(w: ImageWire): ImageAsset {
  return {
    id: w.id,
    conversationId: w.conversation_id,
    filename: w.filename,
    mime: w.mime,
    width: w.width,
    height: w.height,
    bytesSize: w.bytes_size,
    hasEdits: w.has_edits,
    createdAt: normalizeEpochSeconds(w.created_at),
    updatedAt: normalizeEpochSeconds(w.updated_at),
    createdBy: w.created_by,
  };
}

/** List images for a session, newest-first. */
export async function listImages(conversationId: string): Promise<ImageAsset[]> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images`,
  );
  if (!res.ok) {
    throw new Error(`listImages failed: ${res.status} ${res.statusText}`);
  }
  const body = (await res.json()) as { data: ImageWire[] };
  return body.data.map(toImage);
}

/** Fetch a single image's metadata by id. */
export async function getImage(conversationId: string, imageId: string): Promise<ImageAsset> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images/${encodeURIComponent(imageId)}`,
  );
  // The GET endpoint returns binary, not metadata. For metadata, use the
  // list endpoint and find the entry — the server's GET /images/{id} route
  // returns the binary blob directly. So we fetch the list and filter.
  if (!res.ok) {
    throw new Error(`getImage failed: ${res.status} ${res.statusText}`);
  }
  // If the response is JSON (metadata), parse it; otherwise fall back to
  // the list endpoint. The route returns binary, so use the list.
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return toImage((await res.json()) as ImageWire);
  }
  // Fallback: fetch the list and find the image.
  const all = await listImages(conversationId);
  const found = all.find((i) => i.id === imageId);
  if (!found) {
    throw new Error(`getImage: image ${imageId} not found in session ${conversationId}`);
  }
  return found;
}

/** Upload an image file to a session (multipart). */
export async function uploadImage(
  conversationId: string,
  file: File,
): Promise<ImageAsset> {
  const form = new FormData();
  form.append("file", file);
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images`,
    { method: "POST", body: form },
  );
  if (!res.ok) {
    throw new Error(`uploadImage failed: ${res.status} ${res.statusText}`);
  }
  return toImage((await res.json()) as ImageWire);
}

/** Build the binary URL for an image (used as <img src>). */
export function imageUrl(conversationId: string, imageId: string): string {
  return `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images/${encodeURIComponent(imageId)}`;
}

/** Apply Fabric.js edit JSON to an image (store-and-forward). */
export async function updateImageEdit(
  conversationId: string,
  imageId: string,
  editJson: string,
): Promise<ImageAsset> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images/${encodeURIComponent(imageId)}/edit`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edit_json: editJson }),
    },
  );
  if (!res.ok) {
    throw new Error(`updateImageEdit failed: ${res.status} ${res.statusText}`);
  }
  return toImage((await res.json()) as ImageWire);
}

/** Delete an image. */
export async function deleteImage(
  conversationId: string,
  imageId: string,
): Promise<ImageAsset> {
  const res = await authenticatedFetch(
    `/v1/sessions/${encodeURIComponent(conversationId)}/resources/images/${encodeURIComponent(imageId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    throw new Error(`deleteImage failed: ${res.status} ${res.statusText}`);
  }
  return toImage((await res.json()) as ImageWire);
}