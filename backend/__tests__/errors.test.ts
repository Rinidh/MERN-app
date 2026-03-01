import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../middleware/error.js";

describe("errorHandler (global error handler)", () => {
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

    mockRes = {};
    mockRes.status = vi.fn().mockReturnValue(mockRes);
    mockRes.json = vi.fn().mockReturnValue(mockRes);

    mockNext = vi.fn();
  });

  afterEach(() => vi.clearAllMocks());

  it("returns response 422 with message if mongoose ValidationError is passed", () => {
    let error = new mongoose.Error.ValidationError();
    error.errors = [new Error("validation error")] as any;

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith({
      errors: [{ message: "validation error" }],
    });
  });
});
