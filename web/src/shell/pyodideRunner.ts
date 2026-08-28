/**
 * Pyodide (CPython on WebAssembly) runner for dependency-free Python
 * previews in the CodeViewer. The runtime (~10MB) is fetched from the
 * CDN only when the user clicks Run — opening a .py file costs nothing.
 *
 * Security: Pyodide executes inside the page's JS sandbox with no
 * filesystem or network access beyond what the page itself has. This
 * is the same trust level as the sandboxed HTML preview (scripts run,
 * but can't reach app data). Files that import heavy native deps
 * (numpy/pandas/torch) will fail with ModuleNotFoundError — that's the
 * documented limitation; server-side execution covers those cases.
 */

// Pin the version so a CDN update can never break the API surface.
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;

type PyodideApi = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (s: string) => void }) => void;
  setStderr: (opts: { batched: (s: string) => void }) => void;
};

let pyodidePromise: Promise<PyodideApi> | null = null;

/** Load (once) and return the Pyodide runtime. */
function loadPyodideRuntime(): Promise<PyodideApi> {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    // Inject the script tag once; loadPyodide is the global it defines.
    if (!(window as unknown as { loadPyodide?: unknown }).loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = PYODIDE_URL;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Pyodide from CDN"));
        document.head.appendChild(script);
      });
    }
    const loader = (window as unknown as { loadPyodide: (opts?: object) => Promise<PyodideApi> })
      .loadPyodide;
    if (typeof loader !== "function") {
      throw new Error("Pyodide loaded but loadPyodide() is unavailable");
    }
    return loader({ indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/` });
  })();
  // Don't cache failures — a transient network error should be retryable.
  pyodidePromise.catch(() => {
    pyodidePromise = null;
  });
  return pyodidePromise;
}

export type PyodideRunState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "running" }
  | { status: "done"; output: string; error: string | null };

/**
 * Run Python source in Pyodide, capturing stdout/stderr.
 * Returns the combined output and any exception text.
 */
export async function runPythonInPyodide(
  code: string,
  onState: (state: PyodideRunState) => void,
): Promise<void> {
  onState({ status: "loading" });
  let pyodide: PyodideApi;
  try {
    pyodide = await loadPyodideRuntime();
  } catch (err) {
    onState({
      status: "done",
      output: "",
      error: err instanceof Error ? err.message : String(err),
    });
    return;
  }

  onState({ status: "running" });
  const chunks: string[] = [];
  const errChunks: string[] = [];
  pyodide.setStdout({ batched: (s) => chunks.push(s + "\n") });
  pyodide.setStderr({ batched: (s) => errChunks.push(s + "\n") });

  try {
    await pyodide.runPythonAsync(code);
    onState({ status: "done", output: chunks.join(""), error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onState({
      status: "done",
      output: chunks.join(""),
      // Pyodide tracebacks embed the full internal frames; keep the tail
      // (the actual exception) so the panel stays readable.
      error: errChunks.join("") + message.split("\n").slice(-3).join("\n"),
    });
  }
}
