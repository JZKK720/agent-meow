// Persisted, app-global preference for the shared workspace folder path.
//
// The Files panel header shows a folder-path input that lets the user
// pick a local directory as the dedicated file folder for agent-meow.
// The selected path is persisted in localStorage (never throws, degrades
// gracefully) so it carries over across sessions and survives a refresh.
//
// Mirrors the filesPanelPreferences.ts pattern: a single localStorage key,
// defensive parsing, and a safe default.

const STORAGE_KEY = "agent-meow:shared-folder-path";

/** Read the persisted shared-folder path, or null when unset/invalid. */
export function readSharedFolderPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "string" || parsed.trim() === "") return null;
    return parsed.trim();
  } catch {
    return null;
  }
}

/** Persist the shared-folder path. Swallows quota/access errors. */
export function writeSharedFolderPath(path: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (path === null || path.trim() === "") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(path.trim()));
    }
  } catch {
    // localStorage quota or access errors shouldn't break the app.
  }
}
