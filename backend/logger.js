import winston from "winston";
import "express-async-errors";

//CUSTOM LOGGER
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({
      filename: "errors.log",
      level: "error", //only error level messages go into errors.log
    }),
    new winston.transports.File({ filename: "combined.log" }), //all logs (info, warn and errors) using this custom logger go here
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],

  //PROCESS CATCHERS:
  exceptionHandlers: [
    new winston.transports.File({ filename: "exceptions.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "rejections.log" }),
    new winston.transports.Console({ format: winston.format.simple() }),
  ],
});
