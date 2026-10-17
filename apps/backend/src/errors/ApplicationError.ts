export default class ApplicationError extends Error {
  public readonly statusCode: number;

  public readonly data: Record<string, any>;

  constructor(message: string, statusCode: number, data: Record<string, any>) {
    super(message);

    this.statusCode = statusCode;
    this.data = data;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
