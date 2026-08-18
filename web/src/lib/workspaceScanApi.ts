// Typed client for the workspace file scanner endpoint:
//   POST /v1/sessions/{id}/resources/scan-workspace
//
// Scans the session's workspace directory for .md, image, and video files
// and imports them into the surface stores so they appear in the
// Docs / Images / Videos panels.

import { authenticatedFetch } from "./identity";

/** Result of a workspace scan operation. */
export interface WorkspaceScanResult {
  object: "workspace_scan_result";
  sessionId: string;
  workspace: string;
  scanned: number;
  importedDocs: number;
  importedImages: number;
  importedVideos: number;
  skipped: number;
  errors: string[];
}

/** Wire shape from the server (snake_case). */
interface WorkspaceScanResultWire {
  object: "workspace_scan_result";
  session_id: string;
  workspace: string;
  scanned: number;
  imported_docs: number;
  imported_images: number;
  imported_videos: number;
  skipped: number;
  errors: string[];
}

/** Convert wire shape to UI-facing camelCase. */
function toCamel(wire: WorkspaceScanResultWire): WorkspaceScanResult {
  return {
    object: wire.object,
    sessionId: wire.session_id,
    workspace: wire.workspace,
    scanned: wire.scanned,
    importedDocs: wire.imported_docs,
    importedImages: wire.imported_images,
    importedVideos: wire.imported_videos,
    skipped: wire.skipped,
    errors: wire.errors,
  };
}

/**
 * Scan the session workspace for files and import them into surface stores.
 *
 * @param conversationId - The session/conversation ID.
 * @returns The scan result with counts of imported files.
 */
export async function scanWorkspace(
  conversationId: string,
): Promise<WorkspaceScanResult> {
  const res = await authenticatedFetch(
    `/v1/sessions/${conversationId}/resources/scan-workspace`,
    { method: "POST" },
  );
  if (!res.ok) {
    // 409 = runner not connected, 400 = no workspace — both expected
    // for voice sessions that don't have a runner. Degrade gracefully.
    if (res.status === 409 || res.status === 400) {
      return { importedFiles: 0, importedImages: 0, importedVideos: 0, importedDocs: 0 };
    }
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`scanWorkspace failed: ${res.status} ${text}`);
  }
  const wire = (await res.json()) as WorkspaceScanResultWire;
  return toCamel(wire);
}
