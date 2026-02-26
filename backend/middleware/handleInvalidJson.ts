import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/bad-request-error.js";

export const handleInvalidJson = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in req &&
    req.headers["content-type"]?.includes("application/json")
  ) {
    next(new BadRequestError("Invalid JSON body"));
    return;
  }

  next(err);
};
