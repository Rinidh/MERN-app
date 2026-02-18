abstract class CustomError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract statusCode: number;

  abstract serializeErrors(): { message: string; field?: string }[];
}

export class DatabaseError extends CustomError {
  constructor() {
    super("Database operation failed");
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  statusCode = 200;

  serializeErrors(): { message: string; field?: string }[] {
    return [{ message: this.message }];
  }
}
