import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerSelectionError,
} from "mongodb";
import { logger } from "../logger.js";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ValidationError } from "../errors/validation-error.js";
import mongoose from "mongoose";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error((err as any).constructor?.name); // custom error name logged for exact description
  logger.error(err);

  if (err instanceof BadRequestError || err instanceof ValidationError) {
    res.status(err.statusCode).json({
      errors: err.serializeErrors(),
    });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(422).json({
      errors: Object.values(err.errors).map((e) => ({ message: e.message })),
    });
    return;
  }

  if (
    err instanceof MongoNetworkError ||
    err instanceof MongoServerSelectionError ||
    err instanceof MongoNetworkTimeoutError
  ) {
    res.status(503).json({
      errors: [
        {
          message: "Database unavailabe",
        },
      ],
    });
    return;
  }

  if ((err as any).code === "ECONNRESET") {
    res.status(503).json({
      errors: [
        {
          message: "Service is unavailable",
        },
      ],
    });
    return;
  }

  if (err instanceof Error) {
    logger.error("An unhandled error was thrown");
  } else {
    logger.error("An nnknown non-error was thrown");
  }

  return res.status(500).json({
    errors: [{ message: "Internal Server Error" }],
  });
};
