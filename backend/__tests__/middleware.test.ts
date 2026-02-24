import { describe, it, expect, vi } from "vitest";
import { requireJson } from "../middleware/requireJson.js";
import { UnsupportedMediaTypeError } from "../errors/unsupported-media-type-error.js";

describe("requireJson", () => {
  it("calls next() for requests with 'application/json' in content-type header", async () => {
    const req = {
      is: vi.fn().mockReturnValue(true),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => requireJson(req, res, next)).not.toThrowError();
    expect(next).toHaveBeenCalledOnce();
  });

  it("throws UnsupportedMediaTypeError for 'application/json' missing in content type header", async () => {
    const req = {
      is: vi.fn().mockReturnValue(false),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    expect(() => requireJson(req, res, next)).toThrow(
      UnsupportedMediaTypeError,
    );
    expect(next).not.toHaveBeenCalled();
  });
});
