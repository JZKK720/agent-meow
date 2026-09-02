import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useImages", () => ({
  useImages: () => ({ data: [], isLoading: false, error: null }),
  useUploadImage: () => ({ mutate: () => {}, isPending: false }),
  useDeleteImage: () => ({ mutate: () => {} }),
}));

vi.mock("@/hooks/useFileIndex", () => ({
  useFileIndex: () => ({ byPath: new Map(), counts: {}, isLoading: false }),
}));

vi.mock("@/hooks/useFileTags", () => ({
  useFileTagsByBasename: () => ({ byBasename: new Map() }),
  useAnalyzeFiles: () => ({ analyze: () => {}, isPending: false }),
}));

vi.mock("@/lib/routing", () => ({
  useParams: () => ({ conversationId: "conv_test" }),
}));

// Search hook is mocked at the boundary: the hook's own contract (debounce,
// enabled-gating) is covered by its own suite; the panel only needs
// "given hits, render them; given empty query, don't fire".
const searchSpy = vi.fn((q: string) => ({
  results:
    q.trim() === ""
      ? []
      : [
          {
            path: "photos/2026/beach.jpg",
            kind: "image",
            size: 2048,
            status: "indexed",
            contentHash: "h1",
            thumbPath: null,
            error: null,
            indexedAt: 1700000000,
            meta: { width: 4000, height: 3000, camera_model: "Canon EOS R5" },
            score: 1.5,
          },
        ],
  isSearching: false,
}));

vi.mock("@/hooks/useFileSearch", () => ({
  useFileSearch: (_conversationId: string | undefined, query: string) =>
    searchSpy(query),
}));

import { ImagesPanel } from "./ImagesPanel";

afterEach(() => {
  cleanup();
  searchSpy.mockClear();
});

describe("ImagesPanel search", () => {
  it("renders a labeled search input over an existing conversation", () => {
    render(<ImagesPanel onImageSelect={() => {}} selectedImageId={null} frameless />);
    const input = screen.getByLabelText(/Search images/);
    expect(input).toBeDefined();
  });

  it("fires the search with the typed query and renders the ranked hit", async () => {
    render(<ImagesPanel onImageSelect={() => {}} selectedImageId={null} frameless />);
    const input = screen.getByLabelText(/Search images/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "beach" } });
    // The panel debounces 250ms before the query lands.
    await waitFor(() => expect(searchSpy).toHaveBeenCalledWith("beach"));
    // The hit renders its workspace-relative path (title-cased basename).
    expect(screen.getByText(/beach\.jpg/i)).toBeDefined();
    // EXIF badge data from the index meta surfaces on the hit.
    expect(screen.getByText(/Canon EOS R5/)).toBeDefined();
  });

  it("leaves the gallery mounted while searching (results append, not replace)", async () => {
    render(<ImagesPanel onImageSelect={() => {}} selectedImageId={null} frameless />);
    const input = screen.getByLabelText(/Search images/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "sunset" } });
    // The panel debounces 250ms before the query activates the results area.
    await waitFor(() => expect(screen.getByTestId("images-search-results")).toBeDefined());
    // The upload affordance stays (search narrows, doesn't hijack the panel).
    expect(screen.getByLabelText(/Upload image/)).toBeDefined();
  });
});