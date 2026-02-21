import { CustomError } from "./custom-error.js";

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(message?: string) {
    super(message ? message : "Resource not found");
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
