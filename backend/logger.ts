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
    customFormat
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

const addMongoDBTransport = () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    logger.add(
      new winston.transports.MongoDB({
        db: mongoUri,
        collection: "log",
        level: "warn",
      })
    );
  } else {
    logger.error("No 'MONGO_URI' found in environment variables");
    process.exit(1);
    // throw new Error("No 'MONGO_URI' found in environment variables");
  }
};
addMongoDBTransport();
