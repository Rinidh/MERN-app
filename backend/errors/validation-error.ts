import { CustomError } from "./custom-error.js";

export class ValidationError extends CustomError {
  statusCode = 422;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
