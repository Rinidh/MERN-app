import winston from "winston";
import "express-async-errors";
import "winston-mongodb";

import type { Logger } from "winston";

const { combine, timestamp, printf, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} - [${level}]: ${stack ?? message}`;
});

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
      filename: "logs/errors.log",
      level: "error",
    }),

    new winston.transports.File({
      filename: "logs/combined.log",
    }),

    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],

  //PROCESS CATCHERS:
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});

export const initMongoDBLogger = () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.warn("MongoDB logging not intiated, no MONGO_URI found");
    return;
  }

  logger.add(
    new winston.transports.MongoDB({
      db: mongoUri,
      collection: "logs",
      level: process.env.LOG_LEVEL ?? "info",
      tryReconnect: true,
    }),
  );
};
