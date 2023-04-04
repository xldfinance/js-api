export class XLDError extends Error {
  name = 'XLDError';

  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);

    this.statusCode = statusCode;

    Object.setPrototypeOf(this, XLDError.prototype);
  }
}
