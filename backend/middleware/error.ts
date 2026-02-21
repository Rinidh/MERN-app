import { NextFunction, Request, Response } from "express";
import {
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerSelectionError,
} from "mongodb";
import mongoose from "mongoose";
import { logger } from "../logger.js";
import { BadRequestError } from "../errors/bad-request-error.js";
import { ValidationError } from "../errors/validation-error.js";
import { DocumentCastError } from "../errors/document-cast-error.js";
import { NotFoundError } from "../errors/not-found-error.js";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  switch (true) {
    case err instanceof BadRequestError ||
      err instanceof ValidationError ||
      err instanceof NotFoundError: {
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
      return res.status(500).json({
        errors: [{ message: "Internal Server Error" }],
      });

    default:
      logger.error("An nnknown non-error was thrown");
      return res.status(500).json({
        errors: [{ message: "Internal Server Error" }],
      });
  }
};
