import assert from 'node:assert/strict';
import { beforeEach, mock, type Mock, test } from 'node:test';
import type { NextFunction, Request, Response } from 'express';

import LoggerHandler from '../../src/handlers/LoggerHandler.ts';
import Logger from '../../src/helpers/Logger.ts';

interface ITestContext {
  loggerHandler: LoggerHandler;
  req: Request;
  res: Response;
  next: Mock<NextFunction>;
}

let context: ITestContext;

beforeEach(() => {
  const loggerHandler = new LoggerHandler();
  const req: Partial<Request> = {} as Request;
  const res: Partial<Response> = {
    status: mock.fn<Response['status']>(),
    send: mock.fn<Response['send']>(),
    locals: {},
  };
  const next: Mock<NextFunction> = mock.fn();

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

  assert.ok(res.locals.logger instanceof Logger);
});

test('handle(): should next function', async () => {
  const { loggerHandler, req, res, next } = context;

  loggerHandler.handle(req, res, next);

  assert.strictEqual(next.mock.callCount(), 1);
});
