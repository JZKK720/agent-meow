import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFileTags } from "@/hooks/useFileTags";
import { FileTagFilter } from "./FileTagFilter";

// Mock the hooks
vi.mock("@/hooks/useFileTags", () => ({
  useFileTags: vi.fn(() => ({
    data: { tags: [
      { tag: "cat", count: 3 },
      { tag: "dog", count: 2 },
      { tag: "outdoor", count: 5 },
    ]},
    isLoading: false,
  })),
  useAnalyzeFiles: vi.fn(() => ({
    analyze: vi.fn(),
    isPending: false,
  })),
}));

// Mock chatStore — the hook calls useChatStore((s) => s.send) and
// useChatStore((s) => s.boundAgentId), so the mock must accept a
// selector function and return the matching property.
vi.mock("@/store/chatStore", () => ({
  useChatStore: vi.fn((selector?: (s: { send: () => void; boundAgentId: string }) => unknown) =>
    selector ? selector({ send: vi.fn(), boundAgentId: "test-agent" }) : { send: vi.fn(), boundAgentId: "test-agent" },
  ),
}));

function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe("FileTagFilter", () => {
  it("renders tag chips with counts", () => {
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={() => {}}
      />
    );
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("dog")).toBeInTheDocument();
    expect(screen.getByText("outdoor")).toBeInTheDocument();
  });

  it("calls onTagToggle when a chip is clicked", () => {
    const onTagToggle = vi.fn();
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={onTagToggle}
      />
    );
    fireEvent.click(screen.getByText("cat"));
    expect(onTagToggle).toHaveBeenCalledWith("cat");
  });

  it("highlights selected tags", () => {
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={["cat"]}
        onTagToggle={() => {}}
      />
    );
    const catChip = screen.getByText("cat").closest("button");
    expect(catChip).toHaveAttribute("data-selected", "true");
  });

  it("shows empty state when no tags exist", () => {
    vi.mocked(useFileTags).mockReturnValueOnce({
      data: { tags: [] },
      isLoading: false,
    } as never);
    renderWithProviders(
      <FileTagFilter
        conversationId="test-conv"
        selectedTags={[]}
        onTagToggle={() => {}}
      />
    );
    expect(screen.getByText(/no tags yet/i)).toBeInTheDocument();
  });
});
