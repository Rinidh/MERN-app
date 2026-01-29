import { RequestHandler } from "express";

export const requireJson: RequestHandler = (req, res, next) => {
  if (!req.is("application/json")) {
    res
      .status(415)
      .json({ message: "Unsupported Media Type. Expected application/json." });
  }

  next();
};
