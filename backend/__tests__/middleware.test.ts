import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
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
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {
        "content-type": "application/json",
      },
      body: {},
    };
    mockRes = { status: vi.fn() };
    mockNext = vi.fn();
  });

  afterEach(() => vi.clearAllMocks());

  it("converts JSON SyntaxError with status 400 into BadRequestError", () => {
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

  it("passes through the error if not SyntaxError", () => {
    const error = new Error("Some other error");

    handleInvalidJson(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it("passes through SyntaxError if status is not 400", () => {
    const syntaxError = new SyntaxError("Unexpected token");
    (syntaxError as any).status = 500; // as it would be in case of a syntax error left out by programmer

    handleInvalidJson(
      syntaxError,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(syntaxError);
  });

  it("passes through errors if request has no body property at all", () => {
    delete mockReq.body; // mockReq.body = {} is still valid json OR even mockReq.body = undefined / null still declares the property in the object

    const syntaxError = new SyntaxError("Unexpected token");
    (syntaxError as any).status = 400;

    handleInvalidJson(
      syntaxError,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(syntaxError);
  });

  it("passes through errors if request content-type is not application/json", () => {
    mockReq.headers = {
      "content-type": "text/plain",
    };

    const syntaxError = new SyntaxError("Unexpected token");
    (syntaxError as any).status = 400;

    handleInvalidJson(
      syntaxError,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(syntaxError);
  });

  it("doesn't interact with response objects", () => {
    const syntaxError = new SyntaxError("Unexpected token");
    (syntaxError as any).status = 400;

    handleInvalidJson(
      syntaxError,
      mockReq as Request,
      mockRes as Response,
      mockNext,
    );

    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
