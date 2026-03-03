import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextFunction, Request, Response } from "express";
import { errorHandler } from "../middleware/error.js";
import { MongoServerError } from "mongodb";
import { logger } from "../logger.js";

vi.mock("../logger.js", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

describe("errorHandler (global error handler)", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
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

  it("calls `res` with 409 and message if MongoServerError of code 11000 is passed", () => {
    let error = {
      code: 11000,
      keyValue: { name: "duplicateName" },
      name: "MongoServerError",
    } as unknown as MongoServerError;

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      errors: [{ message: "Field value already taken" }],
    });
    expect(logger.warn).toHaveBeenCalledOnce();
  });
});
