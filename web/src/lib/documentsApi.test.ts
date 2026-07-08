import { beforeEach, describe, expect, it, vi } from "vitest";

import { listDocuments } from "./documentsApi";
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
});