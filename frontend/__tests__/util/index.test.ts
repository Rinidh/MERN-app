import { it, expect, describe } from "vitest";
import { safeParseJson } from "../../src/util";

const mockResponse = (options: { ok: boolean; json?: () => Promise<any> }) =>
  ({
    ok: options.ok,
    json: options.json || vi.fn().mockRejectedValue(new Error("failed")),
  }) as unknown as Response;

describe("safeParseJson", () => {
  it("returns parsed JSON when response status is ok", async () => {
    const responseData = {
      name: "product1",
      price: 10,
      image: "img.png",
    };

    const res = mockResponse({
      ok: true,
      json: vi.fn().mockResolvedValue(responseData),
    });

    const data = await safeParseJson<typeof responseData>(res);
    // if safeParseJson throws, it'll be an automatic test failure

    expect(data).toEqual(responseData);
  });

  it("propagate JSON parsing error when ok=true but fails to parse json", async () => {
    const res = mockResponse({
      ok: true,
      json: vi.fn().mockRejectedValue("Failed to parse JSON"),
    });

    await expect(safeParseJson(res)).rejects.toThrow("Failed to parse JSON");
  });

  it("throws error with message when res.json() fails (Vite proxy returns empty body)", async () => {
    const res = mockResponse({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error("Unexpected end of JSON")),
    });

    await expect(safeParseJson(res)).rejects.toThrow("Server error");
  });

  it("throws backend message when returned from server", async () => {
    const res = mockResponse({
      ok: false,
      json: vi.fn().mockResolvedValue({ message: "failed to create" }),
    });

    await expect(safeParseJson(res)).rejects.toThrow("failed to create");
  });

  it("throws 'Request failed' when no backend message", async () => {
    const res = mockResponse({
      ok: false,
      json: vi.fn().mockResolvedValue({ error: "failed" }),
    });

    await expect(safeParseJson(res)).rejects.toThrow("Request failed");
  });

  it("throws 'Request failed' when parsed JSON is not object", async () => {
    const res = mockResponse({
      ok: false,
      json: vi.fn().mockResolvedValue("failed"),
    });

    await expect(safeParseJson(res)).rejects.toThrow("Request failed");
  });
});
