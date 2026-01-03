import winston from "winston";
import "express-async-errors";

//CUSTOM LOGGER
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({
      filename: "onlyErrors.log",
      level: "error", //only lvl error msgs go here
    }),
    new winston.transports.File({ filename: "infoAndHigher.log" }), //all logs (info and errors) using this custom logger go here
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

//PROCESS CATCHERS:
export const processCatchers = function () {
  process.on("uncaughtException", (ex) => {
    logger.error(ex.message, ex);
    process.exit(1);
  });
  process.on("unhandledRejection", (rejErrorObj) => {
    logger.error(rejErrorObj.message, rejErrorObj);
    process.exit(1);
  });
};
