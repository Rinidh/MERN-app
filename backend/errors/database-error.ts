import { CustomError } from "./custom-error.js";

export class DatabaseError extends CustomError {
  statusCode = 500;

  constructor() {
    super("Database operation failed");
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
