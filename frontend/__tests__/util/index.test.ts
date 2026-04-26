import { it, expect, describe } from "vitest";
import { safeParseJson } from "../../src/util";

describe("safeParseJson", () => {
  it("returns parsed JSON when response status is ok", async () => {
    const responseData = {
      name: "product1",
      price: 10,
      image: "img.png",
    };

    const res = {
      ok: true,
      json: vi.fn().mockResolvedValue(responseData),
    } as unknown as Response;

    const data = await safeParseJson<typeof responseData>(res);
    // if safeParseJson throws, it'll be an automatic test failure

    expect(data).toEqual(responseData);
  });
});
