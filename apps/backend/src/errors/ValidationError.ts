import ApplicationError from './ApplicationError';

export default class ValidationError extends ApplicationError {
  constructor(message:string, data: Record<string, any>) {
    const statusCode: number = 400;
    super(message, statusCode, data);
  }
}
