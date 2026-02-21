import { CustomError } from "./custom-error.js";

export class UnsupportedMediaTypeError extends CustomError {
  statusCode = 415;

  constructor() {
    super("Unsupported Media Type. Expected application/json.");
    Object.setPrototypeOf(this, UnsupportedMediaTypeError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
