import { RequestHandler } from "express";
import { UnsupportedMediaTypeError } from "../errors/unsupported-media-type-error.js";

export const requireJson: RequestHandler = (req, res, next) => {
  if (!req.is("application/json")) throw new UnsupportedMediaTypeError();
  next();
};
