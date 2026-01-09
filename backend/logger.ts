import winston from "winston";
import "express-async-errors";
import "winston-mongodb";

import type { Logger } from "winston";

//CUSTOM LOGGER
export const logger: Logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
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
      db: "mongodb+srv://rinidhdhokia_db_user:qv7QrkWnYZw1YUx1@cluster0.s3sdw6b.mongodb.net/products?appName=Cluster0",
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
