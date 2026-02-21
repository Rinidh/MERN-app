import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerError,
  MongoServerSelectionError,
} from "mongodb";
import mongoose from "mongoose";
import { logger } from "../logger.js";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { DocumentCastError } from "../errors/document-cast-error.js";
import { NotFoundError } from "../errors/not-found-error.js";
import { UnsupportedMediaTypeError } from "../errors/unsupported-media-type-error.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  switch (true) {
    case err instanceof BadRequestError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError ||
      err instanceof UnsupportedMediaTypeError: {
      res.status(err.statusCode).json({
        errors: err.serializeErrors(),
      });
      return;
    }

    case err instanceof DocumentCastError: {
      logger.warn(`Invalid mongo ID detected: ${err.invalidMongoId}`);
      res.status(err.statusCode).json({
        errors: err.serializeErrors(),
      });
      return;
    }

    case err instanceof mongoose.Error.ValidationError: {
      res.status(422).json({
        errors: Object.values(err.errors).map((e) => ({ message: e.message })),
      });
      return;
    }

    case err instanceof mongoose.Error.CastError: {
      res.status(422).json({
        errors: [{ message: err.message }],
      });
      return;
    }

    case (err as MongoServerError).name === "MongoServerError" &&
      (err as MongoServerError).code === 11000: {
      logger.warn(
        `Duplicate unique key: ${JSON.stringify((err as MongoServerError).keyValue)}`,
      );
      res.status(409).json({
        errors: [{ message: "Field value already taken" }],
      });
      return;
    }

    case err instanceof MongoNetworkError ||
      err instanceof MongoServerSelectionError ||
      err instanceof MongoNetworkTimeoutError: {
      logger.error((err as any).constructor?.name);
      logger.error(err);

      res.status(503).json({
        errors: [
          {
            message: "Database unavailabe",
          },
        ],
      });
      return;
    }

    case (err as any).code === "ECONNRESET": {
      logger.error((err as any).constructor?.name);
      logger.error(err);

      res.status(503).json({
        errors: [
          {
            message: "Service is unavailable",
          },
        ],
      });
      return;
    }

    case err instanceof Error:
      logger.error("An unhandled error was thrown");
      logger.error(err);
      return res.status(500).json({
        errors: [{ message: "Internal Server Error" }],
      });

    default:
      logger.error("An nnknown non-error was thrown");
      logger.error(err);
      return res.status(500).json({
        errors: [{ message: "Internal Server Error" }],
      });
  }
};
