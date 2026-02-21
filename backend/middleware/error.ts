import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerSelectionError,
} from "mongodb";
import { logger } from "../logger.js";
import { BadRequestError } from "../errors/bad-request-error.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err);

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
