import ApplicationError from 'errors/ApplicationError';
import { NextFunction, Request, Response } from 'express';

import ErrorHandler from 'handlers/ErrorHandler';
import { ILogger } from 'interfaces';
import { createLoggerStub } from '../Stubs';

interface ITestContext {
  errorHandler: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
}

let context: ITestContext;

beforeEach(() => {
  const errorHandler = new ErrorHandler();
  const req: Partial<Request> = {} as Request;

  const loggerStub: ILogger = createLoggerStub();

  const res: Partial<Response> = {
    status: jest.fn(),
    send: jest.fn(),
    locals: {
      logger: loggerStub,
    },
  };
  const next: NextFunction = jest.fn();

  context = {
    errorHandler,
    req: req as Request,
    res: res as Response,
    next,
  };
});

test('handle(): should call next function if headers are sent', async () => {
  const { errorHandler, req, res, next } = context;

  res.headersSent = true;
  const error = new Error();

  errorHandler.handle(error, req, res, next);

  expect(next).toBeCalledWith(error);
});

test('handle(): should handle application error', async () => {
  const { errorHandler, req, res, next } = context;

  const errorMessage: string = 'error message';
  const statusCode: number = 404;
  const data: Record<string, any> = {
    a: 2,
    b: [
      'aaa',
      'bbb',
    ],
  };
  const error = new ApplicationError(errorMessage, statusCode, data);

  errorHandler.handle(error, req, res, next);

  expect(res.status).toBeCalledWith(statusCode);
  expect(res.send).toBeCalledWith({ message: error.message, statusCode: error.statusCode, data: error.data });
});

test('handle(): should handle JSON parsing error', async () => {
  const { errorHandler, req, res, next } = context;

  const errorMessage: string = 'error message';
  const body: string = '{\r\n"players": [\r\n{\r\n"cards": ["Td", "As"]\r\n}\r\n{\r\n\r\n}\r\n]\r\n}\r\n';
  const error = {
    type: 'entity.parse.failed',
    message: errorMessage,
    body,
  };

  errorHandler.handle(error, req, res, next);

  expect(res.status).toBeCalledWith(400);
  expect(res.send).toBeCalledWith({ message: error.message, statusCode: 400, data: { body } });
});

test('handle(): should handle an error', async () => {
  const { errorHandler, req, res, next } = context;

  const exit = jest.spyOn(process, 'exit').mockImplementation((number) => number as never);

  const errorMessage: string = 'error message';
  const error = new Error(errorMessage);

  errorHandler.handle(error, req, res, next);

  expect(res.status).toBeCalledWith(500);
  expect(res.send).toBeCalledWith({ message: error.message, statusCode: 500, data: 'Internal server error' });
  expect(exit).toHaveBeenCalledWith(1);
});
