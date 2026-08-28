import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PythonRunPanel } from "./PythonRunPanel";
import { runPythonInPyodide } from "./pyodideRunner";

// Mock the runner module so tests never fetch Pyodide from the CDN.
vi.mock("./pyodideRunner", () => ({
  runPythonInPyodide: vi.fn(),
}));

const runMock = vi.mocked(runPythonInPyodide);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PythonRunPanel", () => {
  it("renders a Run button and the hint text", () => {
    render(<PythonRunPanel code="print('hi')" />);
    expect(screen.getByRole("button", { name: /run python/i })).toBeTruthy();
    expect(screen.getByText(/pyodide/i)).toBeTruthy();
  });

  it("invokes the runner with the file source on click", () => {
    runMock.mockImplementation((_code, onState) => {
      onState({ status: "done", output: "hi\n", error: null });
      return Promise.resolve();
    });
    render(<PythonRunPanel code="print('hi')" />);
    fireEvent.click(screen.getByRole("button", { name: /run python/i }));
    expect(runMock).toHaveBeenCalledWith("print('hi')", expect.any(Function));
  });

  it("shows the output panel after a successful run", async () => {
    runMock.mockImplementation((_code, onState) => {
      onState({ status: "done", output: "hello world\n", error: null });
      return Promise.resolve();
    });
    render(<PythonRunPanel code="print('hello world')" />);
    fireEvent.click(screen.getByRole("button", { name: /run python/i }));
    await waitFor(() => {
      expect(screen.getByTestId("pyodide-output").textContent).toContain("hello world");
    });
  });

  it("shows errors in the output panel", async () => {
    runMock.mockImplementation((_code, onState) => {
      onState({ status: "done", output: "", error: "ModuleNotFoundError: numpy" });
      return Promise.resolve();
    });
    render(<PythonRunPanel code="import numpy" />);
    fireEvent.click(screen.getByRole("button", { name: /run python/i }));
    await waitFor(() => {
      expect(screen.getByTestId("pyodide-output").textContent).toContain(
        "ModuleNotFoundError",
      );
    });
  });

  it("shows a loading state while the runtime loads", async () => {
    runMock.mockImplementation((_code, onState) => {
      // The component only shows "Loading…" once the runner reports it.
      onState({ status: "loading" });
      return new Promise(() => {});
    });
    render(<PythonRunPanel code="x = 1" />);
    fireEvent.click(screen.getByRole("button", { name: /run python/i }));
    await waitFor(() => {
      expect(screen.getByText(/loading python/i)).toBeTruthy();
    });
  });

  it("clears the output on Clear click", async () => {
    runMock.mockImplementation((_code, onState) => {
      onState({ status: "done", output: "out", error: null });
      return Promise.resolve();
    });
    render(<PythonRunPanel code="print(1)" />);
    fireEvent.click(screen.getByRole("button", { name: /run python/i }));
    await waitFor(() => {
      expect(screen.getByTestId("pyodide-output")).toBeTruthy();
    });
    fireEvent.click(screen.getByRole("button", { name: /clear output/i }));
    expect(screen.queryByTestId("pyodide-output")).toBeNull();
  });
});

describe("runPythonInPyodide (unit, mocked DOM script loading)", () => {
  beforeEach(() => {
    // Fresh module state per test.
    vi.resetModules();
  });

  it("reports a load error when the CDN script fails", async () => {
    // The top-level vi.mock replaces the whole module, so re-import the
    // REAL implementation under a different specifier for this test.
    vi.doUnmock("./pyodideRunner");
    const { runPythonInPyodide: realRunner } = await import("./pyodideRunner");

    const createElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      const el = createElement(tag);
      if (tag === "script") {
        // Simulate script load failure: jsdom fires nothing on its own, so
        // dispatch a real error event once the element is in the document.
        queueMicrotask(() => {
          el.dispatchEvent(new Event("error"));
        });
      }
      return el;
    });

    const states: Array<{ status: string; error?: string | null }> = [];
    await realRunner("print(1)", (s) => states.push(s));

    const last = states[states.length - 1];
    expect(last.status).toBe("done");
    expect(last.error).toContain("Failed to load Pyodide");
  });
});
