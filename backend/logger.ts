import winston from "winston";
import "winston-mongodb";
import path from "path";

import type { Logger } from "winston";
import { ConfigurationError } from "./errors/configuration-error.js";

const { combine, timestamp, printf, errors } = winston.format;

export const customFormat = printf(
  ({ level, message, timestamp, stack }) =>
    `${timestamp} - [${level}]: ${stack ?? message}`,
);

const logDir = path.resolve(process.cwd(), "logs");

//CUSTOM LOGGER
export const logger: Logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    customFormat,
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "errors.log"),
      level: "error",
    }),

    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    new winston.transports.Console(),
  ],

  //PROCESS CATCHERS:
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
    }),
    new winston.transports.Console(),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
    }),
    new winston.transports.Console(),
  ],
});

export const initMongoDBLogger = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri)
    throw new ConfigurationError(
      "MongoDB logging not intiated, no MONGO_URI found",
    );

  logger.add(
    new winston.transports.MongoDB({
      db: mongoUri,
      collection: "logs",
      level: process.env.LOG_LEVEL ?? "info",
      tryReconnect: true,
    }),
  );
};

if (process.env.NODE_ENV === "test") {
  logger.silent = true;
}
