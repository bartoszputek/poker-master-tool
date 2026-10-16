export default class ApplicationError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly data: Record<string, any>) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
