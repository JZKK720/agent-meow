/**
 * Cross-platform host path helpers.
 *
 * The host daemon reports native paths: POSIX (``/Users/me``) on
 * macOS/Linux and Windows (``C:\Users\me``). The workspace picker,
 * the landing-screen workspace validation, and the home-derivation
 * all used to assume ``/``-separated absolute paths, which broke on
 * Windows hosts (drive-root workspaces, rejected ``C:\`` input).
 * These helpers accept both shapes so the same UI works against
 * either host OS.
 */

/**
 * True when ``path`` is an absolute host path on either OS.
 *
 * POSIX: starts with ``/``. Windows: a drive-letter root or path
 * (``C:\``, ``C:/``, ``C:``) or a UNC share (``\\server\share``).
 *
 * @param path Raw path text, e.g. ``"/tmp"`` or ``"C:\\Users\\me"``.
 * @returns Whether the host can resolve it without a base dir.
 */
export function isAbsolutePath(path: string): boolean {
  return (
    path.startsWith("/") || /^[A-Za-z]:[\\/]/.test(path) || /^[A-Za-z]:$/.test(path) || path.startsWith("\\\\")
  );
}

/**
 * True when a Windows-style path has no directory component yet —
 * a bare drive letter (``C:``) or a drive root (``C:\`` / ``C:/``).
 * These list the whole drive and are never a usable workspace.
 *
 * @param path Raw path text.
 * @returns True for ``"C:"``, ``"C:\"``, ``"C:/"`` (any letter).
 */
export function isWindowsDriveRoot(path: string): boolean {
  return /^[A-Za-z]:[\\/]?$/.test(path);
}

/**
 * Split an absolute path into ``[parent, leaf]`` using the path's
 * own separator style (``/`` for POSIX, ``\`` or ``/`` for Windows).
 * Returns ``null`` when the path is a root (POSIX ``/`` or a Windows
 * drive root) and has no parent.
 *
 * @param path Absolute host path.
 * @returns ``[parent, leaf]`` or ``null`` at a filesystem root.
 */
export function splitParent(path: string): [string, string] | null {
  const stripped = path.replace(/[\\/]+$/, "");
  if (stripped === "" || stripped === "/") return null;
  if (/^[A-Za-z]:$/.test(stripped)) return null; // bare drive letter
  const match = stripped.match(/^(.*[\\/])([^\\/]+)$/);
  if (!match) return null;
  let parent = match[1].replace(/[\\/]+$/, "");
  if (parent === "") parent = "/";
  // A bare drive letter as parent means the child sits at the drive
  // root; the root is "C:\" (separator required) — a bare "C:" would
  // scandir the drive's *current* directory on the host.
  if (/^[A-Za-z]:$/.test(parent)) parent = `${parent}\\`;
  return [parent, match[2]];
}

/**
 * Parent directory of an absolute host path, or ``null`` at a root.
 *
 * @param path Absolute path, e.g. ``"/Users/me"`` or ``"C:\\Users\\me"``.
 * @returns Parent path, or ``null`` for ``/`` and drive roots.
 */
export function parentOfPath(path: string): string | null {
  const split = splitParent(path);
  return split ? split[0] : null;
}

/**
 * Basename of an absolute host path on either OS.
 *
 * @param path Absolute path; ``""`` yields ``"~"`` (home placeholder).
 * @returns Last segment, ``"/"`` at the POSIX root, the drive at a
 *   Windows root (``"C:"``), or ``"~"`` for the empty placeholder.
 */
export function basenameOfPath(path: string): string {
  if (path === "") return "~";
  const stripped = path.replace(/[\\/]+$/, "");
  if (stripped === "" || stripped === "/") return "/";
  if (/^[A-Za-z]:$/.test(stripped)) return stripped;
  const split = splitParent(stripped);
  return split ? split[1] : stripped;
}

/**
 * Join a parent directory and child name into an absolute path,
 * preserving the parent's separator style (``\`` on Windows paths,
 * ``/`` elsewhere). Handles the POSIX root (``/`` + ``x`` → ``/x``).
 *
 * @param dir Absolute parent directory.
 * @param name Child name (trimmed by the caller's convention).
 * @returns Joined absolute path.
 */
export function joinPathSegments(dir: string, name: string): string {
  const trimmedName = name.trim();
  if (dir === "/") return `/${trimmedName}`;
  const sep = dir.includes("\\") ? "\\" : "/";
  const base = dir.replace(/[\\/]+$/, "");
  return `${base}${sep}${trimmedName}`;
}
