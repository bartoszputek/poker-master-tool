import { NextFunction, Request, Response } from 'express';

import LoggerHandler from 'handlers/LoggerHandler';
import Logger from 'helpers/Logger';

interface ITestContext {
  loggerHandler: LoggerHandler,
  req: Request,
  res: Response,
  next: NextFunction
}

let context: ITestContext;

beforeEach(() => {
  const loggerHandler = new LoggerHandler();
  const req: Partial<Request> = {} as Request;
  const res: Partial<Response> = {
    status: jest.fn(),
    send: jest.fn(),
    locals: {},
  };
  const next: NextFunction = jest.fn();

  context = {
    loggerHandler,
    req: req as Request,
    res: res as Response,
    next,
  };
});

test('handle(): should add logger to res.locals', async () => {
  const { loggerHandler, req, res, next } = context;

  loggerHandler.handle(req, res, next);

  expect(res.locals.logger).toBeInstanceOf(Logger);
});

test('handle(): should next function', async () => {
  const { loggerHandler, req, res, next } = context;

  loggerHandler.handle(req, res, next);

  expect(next).toBeCalled();
});
