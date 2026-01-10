import winston from "winston";
import "express-async-errors";
import "winston-mongodb";

import type { Logger, transport } from "winston";

const { combine, timestamp, printf, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} - [${level}]: ${stack ?? message}`;
});

const transports: transport[] = [
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
];

const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  transports.push(
    new winston.transports.MongoDB({
      db: mongoUri,
      collection: "log",
      level: "warn",
    })
  );
}

//CUSTOM LOGGER
export const logger: Logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    customFormat
  ),
  transports,

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

if (!mongoUri) {
  logger.error("No 'MONGO_URI' found in environment variables");
  process.exit(1);
}
