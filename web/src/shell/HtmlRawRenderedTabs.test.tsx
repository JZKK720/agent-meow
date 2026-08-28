import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { HtmlRawRenderedTabs } from "./HtmlRawRenderedTabs";

afterEach(() => {
  cleanup();
});

describe("HtmlRawRenderedTabs", () => {
  it("shows the rendered preview by default", () => {
    render(
      <HtmlRawRenderedTabs
        rendered={<div data-testid="rendered-view">live preview</div>}
        raw="<p>source</p>"
        truncated={false}
      />,
    );
    expect(screen.getByTestId("rendered-view")).toBeTruthy();
    expect(screen.queryByTestId("html-raw-source")).toBeNull();
  });

  it("switches to raw source on Raw click", () => {
    render(
      <HtmlRawRenderedTabs
        rendered={<div data-testid="rendered-view">live preview</div>}
        raw="<p>source</p>"
        truncated={false}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /raw/i }));
    expect(screen.queryByTestId("rendered-view")).toBeNull();
    const raw = screen.getByTestId("html-raw-source");
    expect(raw.textContent).toContain("<p>source</p>");
  });

  it("switches back to rendered on Rendered click", () => {
    render(
      <HtmlRawRenderedTabs
        rendered={<div data-testid="rendered-view">live preview</div>}
        raw="<p>source</p>"
        truncated={false}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: /raw/i }));
    fireEvent.click(screen.getByRole("tab", { name: /rendered/i }));
    expect(screen.getByTestId("rendered-view")).toBeTruthy();
  });

  it("marks the active tab with aria-selected", () => {
    render(
      <HtmlRawRenderedTabs
        rendered={<div>live</div>}
        raw="src"
        truncated={false}
      />,
    );
    const renderedTab = screen.getByRole("tab", { name: /rendered/i });
    const rawTab = screen.getByRole("tab", { name: /raw/i });
    expect(renderedTab.getAttribute("aria-selected")).toBe("true");
    expect(rawTab.getAttribute("aria-selected")).toBe("false");
    fireEvent.click(rawTab);
    expect(rawTab.getAttribute("aria-selected")).toBe("true");
    expect(renderedTab.getAttribute("aria-selected")).toBe("false");
  });

  it("shows the truncation note on the Raw tab only", () => {
    render(
      <HtmlRawRenderedTabs
        rendered={<div>live</div>}
        raw="partial source"
        truncated
      />,
    );
    expect(screen.queryByText(/large file/i)).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /raw/i }));
    expect(screen.getByText(/large file/i)).toBeTruthy();
  });
});
