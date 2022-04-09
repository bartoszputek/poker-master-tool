import ApplicationError from 'errors/ApplicationError';
import {
  ErrorRequestHandler, NextFunction, Response, Request,
} from 'express';
import { IHandler, ILogger } from 'interfaces';

export default class ErrorHandler implements IHandler {
  public handle: ErrorRequestHandler = (error, req:Request, res:Response, next: NextFunction) => {
    const logger: ILogger = res.locals.logger as ILogger;

    if (res.headersSent) {
      logger.fatal({
        message: 'Unknown error',
        error,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        headers: req.headers,
        errorStack: error.stack,
      });

      next(error);
      return;
    }

    if (error instanceof ApplicationError) {
      logger.error({
        message: 'Application error is thrown',
        errorStatus: error.statusCode,
        error,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        headers: req.headers,
        errorStack: error.stack,
      });

      res.status(error.statusCode);
      res.send({ message: error.message, statusCode: error.statusCode, data: error.data });
      return;
    }

    // Handle JSON parsing
    if (error.type === 'entity.parse.failed') {
      const statusCode: number = 400;

      logger.error({
        message: 'JSON parsing error is thrown',
        errorStatus: statusCode,
        error,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        headers: req.headers,
        errorStack: error.stack,
      });

      res.status(statusCode);
      res.send({ message: error.message, statusCode, data: { body: error.body } });
      return;
    }

    if (error instanceof Error) {
      const statusCode: number = 500;

      logger.error({
        message: 'Internal server error is thrown',
        errorStatus: statusCode,
        errorMessage: error.message,
        url: req.originalUrl,
        method: req.method,
        body: req.body,
        headers: req.headers,
        errorStack: error.stack,
      });

      res.status(statusCode);
      res.send({ message: error.message, statusCode, data: 'Internal server error' });

      process.exit(1);
    }
  };
}
