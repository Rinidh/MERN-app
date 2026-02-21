import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerSelectionError,
} from "mongodb";
import { logger } from "../logger.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof MongoNetworkError ||
    err instanceof MongoServerSelectionError ||
    err instanceof MongoNetworkTimeoutError
  ) {
    logger.error("MongoDB network error");
    res.status(503).json({
      errors: [
        {
          message: "Database unavailabe",
        },
      ],
    });
    return;
  }

  // other network errors thrown at Node.js system-level, uncaught by MongoDB driver
  if ((err as any).code === "ECONNRESET") {
    logger.error("Network error");
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
    logger.error("Unhandled error: ", err);
  } else {
    logger.error("Unknown non-error thrown! : ", err);
  }

  return res.status(500).json({
    errors: [{ message: "Internal Server Error" }],
  });
};
