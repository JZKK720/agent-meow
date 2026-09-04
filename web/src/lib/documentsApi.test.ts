import { beforeEach, describe, expect, it, vi } from "vitest";

import { getDocumentBinary, listDocuments, uploadDocumentFile } from "./documentsApi";
import { authenticatedFetch } from "./identity";

vi.mock("./identity", () => ({
  authenticatedFetch: vi.fn(),
}));

const mockAuthenticatedFetch = vi.mocked(authenticatedFetch);

function mockJsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
  } as unknown as Response;
}

describe("documentsApi", () => {
  beforeEach(() => {
    mockAuthenticatedFetch.mockReset();
  });

  it("normalizes microsecond timestamps to epoch seconds", async () => {
    mockAuthenticatedFetch.mockResolvedValueOnce(
      mockJsonResponse({
        data: [
          {
            id: "doc_1",
            object: "document",
            conversation_id: "conv_1",
            title: "Notes",
            format: "markdown",
            content_md: "# hi",
            content_json: null,
            created_at: 1_783_235_315,
            updated_at: 1_783_235_315_835_354,
            version: 2,
            created_by: null,
          },
        ],
      }),
    );

    await expect(listDocuments("conv_1")).resolves.toEqual([
      expect.objectContaining({
        createdAt: 1_783_235_315,
        updatedAt: 1_783_235_315,
      }),
    ]);
  });

  it("maps binary fields onto the Document record", async () => {
    mockAuthenticatedFetch.mockResolvedValueOnce(
      mockJsonResponse({
        data: [
          {
            id: "doc_bin",
            object: "document",
            conversation_id: "conv_1",
            title: "Report",
            format: "binary",
            content_md: "",
            content_json: null,
            created_at: 1_783_235_315,
            updated_at: 1_783_235_315,
            version: 1,
            created_by: null,
            filename: "Report.docx",
            mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            artifact_key: "documents/conv_1/doc_bin/Report.docx",
            bytes_size: 48_210,
          },
        ],
      }),
    );

    const docs = await listDocuments("conv_1");
    expect(docs[0]).toEqual(
      expect.objectContaining({
        filename: "Report.docx",
        hasBinary: true,
        bytesSize: 48_210,
      }),
    );
  });

  it("marks markdown documents as having no binary", async () => {
    mockAuthenticatedFetch.mockResolvedValueOnce(
      mockJsonResponse({
        data: [
          {
            id: "doc_md",
            object: "document",
            conversation_id: "conv_1",
            title: "Notes",
            format: "markdown",
            content_md: "# hi",
            content_json: null,
            created_at: 1_783_235_315,
            updated_at: 1_783_235_315,
            version: 1,
            created_by: null,
            filename: null,
            mime: null,
            artifact_key: null,
            bytes_size: 0,
          },
        ],
      }),
    );

    const docs = await listDocuments("conv_1");
    expect(docs[0]).toEqual(expect.objectContaining({ hasBinary: false, bytesSize: 0 }));
  });

  it("uploads a file via multipart POST", async () => {
    mockAuthenticatedFetch.mockResolvedValueOnce(
      mockJsonResponse({
        id: "doc_up",
        object: "document",
        conversation_id: "conv_1",
        title: "Report",
        format: "binary",
        content_md: "",
        content_json: null,
        created_at: 1_783_235_315,
        updated_at: 1_783_235_315,
        version: 1,
        created_by: null,
        filename: "Report.docx",
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        artifact_key: "documents/conv_1/doc_up/Report.docx",
        bytes_size: 100,
      }),
    );

    const file = new File([new Uint8Array([1, 2, 3])], "Report.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const doc = await uploadDocumentFile("conv_1", file);

    expect(doc.hasBinary).toBe(true);
    expect(doc.filename).toBe("Report.docx");
    const [url, init] = mockAuthenticatedFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/v1/sessions/conv_1/resources/documents");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
  });

  it("fetches binary with disposition filename and mime", async () => {
    const blob = new Blob([new Uint8Array([9, 9])]);
    mockAuthenticatedFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      blob: async () => blob,
      headers: new Headers({
        "Content-Disposition": 'attachment; filename="Report.docx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    } as unknown as Response);

    const result = await getDocumentBinary("conv_1", "doc_bin");
    expect(result.filename).toBe("Report.docx");
    expect(result.mime).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    expect(result.blob.size).toBe(2);
    expect(mockAuthenticatedFetch.mock.calls[0][0]).toBe(
      "/v1/sessions/conv_1/resources/documents/doc_bin/binary",
    );
  });
});