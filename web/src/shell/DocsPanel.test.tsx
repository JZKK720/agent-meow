// Colocated tests for the DocsPanel binary-document affordances.
//
// Pins: documents carrying binary bytes (artifact_key) render a filename/
// size badge plus a download button; markdown-only documents render neither.
// The upload affordance (header) is always present.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DocsPanel } from "./DocsPanel";

const getDocumentBinaryMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useDocuments", () => ({
  useDocuments: vi.fn(),
  useCreateDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteDocument: () => ({ mutate: vi.fn(), isPending: false }),
  useUploadDocumentFile: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/lib/documentsApi", () => ({
  getDocumentBinary: getDocumentBinaryMock,
}));

vi.mock("@/lib/routing", () => ({
  useParams: () => ({ conversationId: "conv_1" }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { useDocuments } from "@/hooks/useDocuments";

vi.mocked(useDocuments).mockReturnValue({
  data: [
    {
      id: "doc_bin",
      conversationId: "conv_1",
      title: "Report",
      format: "binary",
      contentMd: "",
      contentJson: null,
      createdAt: 1_783_235_315,
      updatedAt: 1_783_235_315,
      version: 1,
      createdBy: null,
      filename: "Report.docx",
      mime: "application/msword",
      hasBinary: true,
      bytesSize: 48_210,
    },
    {
      id: "doc_md",
      conversationId: "conv_1",
      title: "Notes",
      format: "markdown",
      contentMd: "# hi",
      contentJson: null,
      createdAt: 1_783_235_315,
      updatedAt: 1_783_235_315,
      version: 1,
      createdBy: null,
      filename: null,
      mime: null,
      hasBinary: false,
      bytesSize: 0,
    },
  ],
  isLoading: false,
  error: null,
} as never);

describe("DocsPanel binary documents", () => {
  beforeEach(() => {
    getDocumentBinaryMock.mockReset();
  });

  it("shows the filename + size badge for binary documents", () => {
    render(<DocsPanel onDocSelect={vi.fn()} selectedDocId={null} />);
    expect(screen.getByText("Report.docx")).toBeInTheDocument();
    expect(screen.getByText(/47 KB/)).toBeInTheDocument();
  });

  it("renders a download button only for binary documents", async () => {
    getDocumentBinaryMock.mockResolvedValue({
      blob: new Blob([new Uint8Array([1])]),
      filename: "Report.docx",
      mime: "application/msword",
    });
    render(<DocsPanel onDocSelect={vi.fn()} selectedDocId={null} />);

    const buttons = screen.getAllByRole("button", { name: "docs.download" });
    expect(buttons).toHaveLength(1);

    fireEvent.click(buttons[0]);
    await expect(getDocumentBinaryMock).toHaveBeenCalledWith("conv_1", "doc_bin");
  });

  it("always renders the upload affordance in the header", () => {
    render(<DocsPanel onDocSelect={vi.fn()} selectedDocId={null} />);
    expect(screen.getByLabelText("docs.uploadFile")).toBeInTheDocument();
  });
});