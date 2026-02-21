import { CustomError } from "./custom-error.js";

export class DocumentCastError extends CustomError {
  statusCode = 400;
  invalidMongoId?: string;

  constructor(message: string, invalidMongoId?: string) {
    super(message);
    Object.setPrototypeOf(this, DocumentCastError.prototype);
    this.invalidMongoId = invalidMongoId;
  }

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
