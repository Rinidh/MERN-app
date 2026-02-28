import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";

import { requireJson } from "../middleware/requireJson.js";
import { UnsupportedMediaTypeError } from "../errors/unsupported-media-type-error.js";
import { handleInvalidJson } from "../middleware/handleInvalidJson.js";
import { BadRequestError } from "../errors/bad-request-error.js";

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

describe("handleInvalidJson middleware", () => {
  it("converts JSON SyntaxError with status 400 into BadRequestError", () => {
    // json syntax error is thrown by express.json() middleware in real implementation
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    mockReq = {
      headers: {
        "content-type": "application/json",
      },
      body: {},
    };
    mockRes = {};
    mockNext = vi.fn();

    const syntaxError = new SyntaxError("Unexpected token");
    (syntaxError as any).status = 400;

    handleInvalidJson(
      syntaxError,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledOnce();

    const passedError = vi.mocked(mockNext).mock.calls[0][0];
    expect(passedError).toBeInstanceOf(BadRequestError);
    expect((passedError as any).message).toBe("Invalid JSON body");
  });
});
