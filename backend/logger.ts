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
      level: "error", //only error level messages go into errors.log
    }),
    new winston.transports.File({ filename: "logs/combined.log" }), //all logs (info, warn and errors) using this custom logger go here
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI,
      collection: "log",
      level: "warn",
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
