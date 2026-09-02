import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useSnippets", () => ({
  useSnippets: () => ({ data: [], isLoading: false, error: null }),
  useCreateSnippet: () => ({ mutate: () => {}, isPending: false }),
  useDeleteSnippet: () => ({ mutate: () => {} }),
}));

vi.mock("@/lib/routing", () => ({
  useParams: () => ({ conversationId: "conv_test" }),
}));

import { SnippetsPanel } from "./SnippetsPanel";

afterEach(() => {
  cleanup();
});

describe("SnippetsPanel", () => {
  it("renders the panel title", () => {
    render(
      <SnippetsPanel onSnippetSelect={() => {}} selectedSnippetId={null} frameless />,
    );
    expect(screen.getByText("Snippets")).toBeDefined();
  });

  it("shows empty state when no snippets exist", () => {
    render(
      <SnippetsPanel onSnippetSelect={() => {}} selectedSnippetId={null} frameless />,
    );
    expect(screen.getByText("No snippets yet")).toBeDefined();
  });
});