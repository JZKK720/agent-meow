import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useNotes", () => ({
  useNotes: () => ({ data: [], isLoading: false, error: null }),
  useCreateNote: () => ({ mutate: () => {}, isPending: false }),
  useDeleteNote: () => ({ mutate: () => {} }),
  usePinNote: () => ({ mutate: () => {} }),
}));

vi.mock("@/lib/routing", () => ({
  useParams: () => ({ conversationId: "conv_test" }),
}));

import { NotesPanel } from "./NotesPanel";

afterEach(() => {
  cleanup();
});

describe("NotesPanel", () => {
  it("renders the panel title", () => {
    render(<NotesPanel onNoteSelect={() => {}} selectedNoteId={null} frameless />);
    expect(screen.getByText("Notes")).toBeDefined();
  });

  it("shows empty state when no notes exist", () => {
    render(<NotesPanel onNoteSelect={() => {}} selectedNoteId={null} frameless />);
    expect(screen.getByText("No notes yet")).toBeDefined();
  });
});