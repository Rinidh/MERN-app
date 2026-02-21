import { CustomError } from "./custom-error.js";

export class ConfigurationError extends CustomError {
  statusCode = 500;

  constructor(message?: string) {
    super(message ? message : "Error in configurations");
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: "Internal Server Error" }];
  }
}
