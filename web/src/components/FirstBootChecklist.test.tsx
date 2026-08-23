// Tests for FirstBootChecklist — the one-time stack health card shown on
// the chat landing screen (Docker quickstart first boot).
//
// Covers: dismissal persistence, row states from /v1/stack/status, and
// the all-ok button label switch.

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FirstBootChecklist } from "./FirstBootChecklist";

// i18n: interpolate the default string with any options (mirrors
// i18next's t(key, defaultValue, options) behavior for {{count}}).
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, dfltOrOpts?: string | Record<string, unknown>, maybeOpts?: Record<string, unknown>) => {
      const dflt = typeof dfltOrOpts === "string" ? dfltOrOpts : key;
      const opts = typeof dfltOrOpts === "string" ? maybeOpts : dfltOrOpts;
      if (!opts) return dflt;
      return dflt.replace(/\{\{(\w+)\}\}/g, (_m, name) => String(opts[name] ?? ""));
    },
  }),
}));

const fetchMock = vi.fn();
vi.mock("@/lib/identity", () => ({
  authenticatedFetch: (...args: unknown[]) => fetchMock(...args),
}));

vi.mock("@/components/icons/MeowCatMascot", () => ({
  MeowCatMascot: () => <span data-testid="mascot" />,
}));

function statusResponse(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    json: async () => ({
      server: "ok",
      hermes: { status: "ok" },
      ollama: { status: "ok", models: ["m1", "m2"], count: 2 },
      // Default: lemonade not configured → row filtered out, allOk depends
      // on the other 3 rows only. Tests that need lemonade override this.
      lemonade_stt: { status: "unconfigured" },
      ...overrides,
    }),
  };
}

describe("FirstBootChecklist", () => {
  beforeEach(() => {
    window.localStorage.clear();
    fetchMock.mockReset();
  });

  it("renders nothing when previously dismissed", () => {
    window.localStorage.setItem("agent-meow:first-boot-checklist-dismissed", "1");
    const { container } = render(<FirstBootChecklist />);
    expect(container).toBeEmptyDOMElement();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows pending rows before the first status response", async () => {
    fetchMock.mockReturnValue(new Promise(() => {})); // never resolves
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(screen.getByTestId("checklist-row-server")).toBeTruthy(),
    );
    // No check icons yet — everything is a spinner.
    expect(screen.queryByRole("img", { hidden: true })).toBeNull();
  });

  it("flips rows to ok when the stack reports healthy", async () => {
    fetchMock.mockResolvedValue(statusResponse());
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(screen.getByText("2 models ready")).toBeTruthy(),
    );
    // All-ok → the primary button reads "Start chatting".
    expect(screen.getByRole("button", { name: "Start chatting" })).toBeTruthy();
  });

  it("shows the pulling hint while ollama has no models", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ ollama: { status: "empty", models: [], detail: "no models pulled yet" } }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(
        screen.getByText("Pulling default models — first boot takes a few minutes"),
      ).toBeTruthy(),
    );
    // Not all ok → "Continue anyway".
    expect(screen.getByRole("button", { name: "Continue anyway" })).toBeTruthy();
  });

  it("shows the auth hint when hermes rejects the key", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ hermes: { status: "auth_error", detail: "API key rejected" } }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(
        screen.getByText("API key mismatch — check HERMES_API_KEY in .env"),
      ).toBeTruthy(),
    );
  });

  it("keeps rows pending when stack status omits nested component blocks", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ hermes: undefined, ollama: undefined }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(screen.getByTestId("checklist-row-hermes")).toBeTruthy(),
    );
    expect(screen.getByText("Hermes gateway (voice + tools)")).toBeTruthy();
    expect(screen.getByText("Ollama models")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Continue anyway" })).toBeTruthy();
  });

  it("persists dismissal on close", async () => {
    fetchMock.mockResolvedValue(statusResponse());
    render(<FirstBootChecklist />);
    await waitFor(() => expect(screen.getByText("2 models ready")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(
      window.localStorage.getItem("agent-meow:first-boot-checklist-dismissed"),
    ).toBe("1");
  });

  it("hides lemonade row when unconfigured (STT falls back to Hermes)", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ lemonade_stt: { status: "unconfigured", detail: "not set" } }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() => expect(screen.getByText("2 models ready")).toBeTruthy());
    // No lemonade row — it's optional and not configured.
    expect(screen.queryByTestId("checklist-row-lemonade_stt")).toBeNull();
    // All-ok → "Start chatting" (unconfigured lemonade doesn't block).
    expect(screen.getByRole("button", { name: "Start chatting" })).toBeTruthy();
  });

  it("shows lemonade row when configured and ok", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({
        lemonade_stt: { status: "ok", model: "Whisper-Large-v3-Turbo", models: ["Whisper-Large-v3-Turbo"] },
      }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(screen.getByText("Lemonade Server (STT)")).toBeTruthy(),
    );
    // All-ok → "Start chatting".
    expect(screen.getByRole("button", { name: "Start chatting" })).toBeTruthy();
  });

  it("shows lemonade warning when configured but down", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ lemonade_stt: { status: "down", detail: "connection refused" } }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(
        screen.getByText("LEMONADE_STT_URL set but server unreachable"),
      ).toBeTruthy(),
    );
    // Not all ok → "Continue anyway".
    expect(screen.getByRole("button", { name: "Continue anyway" })).toBeTruthy();
  });

  it("shows lemonade pulling hint when model not downloaded", async () => {
    fetchMock.mockResolvedValue(
      statusResponse({ lemonade_stt: { status: "empty", detail: "downloading", model: "Whisper-Large-v3-Turbo" } }),
    );
    render(<FirstBootChecklist />);
    await waitFor(() =>
      expect(
        screen.getByText("Model downloading — STT falls back to Hermes until ready"),
      ).toBeTruthy(),
    );
  });
});