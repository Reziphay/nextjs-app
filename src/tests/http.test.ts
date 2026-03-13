import { ApiError, fetchJson } from "@/lib/api/http";

describe("fetchJson", () => {
  it("unwraps response envelopes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            value: 42,
          },
        }),
      }),
    );

    await expect(fetchJson<{ value: number }>("http://example.com")).resolves.toEqual({
      value: 42,
    });
  });

  it("throws ApiError on failed responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(fetchJson("http://example.com")).rejects.toBeInstanceOf(ApiError);
  });
});
