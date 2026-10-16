import assert from 'node:assert/strict';
import { beforeEach, mock, type Mock, test } from 'node:test';
import ApplicationError from '../../src/errors/ApplicationError.ts';
import type { NextFunction, Request, Response } from 'express';

import ErrorHandler from '../../src/handlers/ErrorHandler.ts';
import type { ILogger } from '../../src/interfaces.ts';
import { createLoggerStub } from '../_utils/Stubs.ts';

interface ITestContext {
  errorHandler: ErrorHandler;
  req: Request;
  res: Response;
  status: Mock<Response['status']>;
  send: Mock<Response['send']>;
  next: Mock<NextFunction>;
}

let context: ITestContext;

beforeEach(() => {
  const errorHandler = new ErrorHandler();
  const req: Partial<Request> = {} as Request;

  const loggerStub: ILogger = createLoggerStub();

  const status: Mock<Response['status']> = mock.fn();
  const send: Mock<Response['send']> = mock.fn();

  const res: Partial<Response> = {
    status,
    send,
    locals: {
      logger: loggerStub,
    },
  };
  const next: Mock<NextFunction> = mock.fn();

  context = {
    errorHandler,
    req: req as Request,
    res: res as Response,
    status,
    send,
    next,
  };
});

test('handle(): should call next function if headers are sent', async () => {
  const { errorHandler, req, res, next } = context;

  res.headersSent = true;
  const error = new Error();

  errorHandler.handle(error, req, res, next);

  assert.deepStrictEqual(
    next.mock.calls.map((call) => call.arguments),
    [[error]],
  );
});

test('handle(): should handle application error', async () => {
  const { errorHandler, req, res, status, send, next } = context;

  const errorMessage: string = 'error message';
  const statusCode: number = 404;
  const data: Record<string, any> = {
    a: 2,
    b: ['aaa', 'bbb'],
  };
  const error = new ApplicationError(errorMessage, statusCode, data);

  errorHandler.handle(error, req, res, next);

  assert.deepStrictEqual(
    status.mock.calls.map((call) => call.arguments),
    [[statusCode]],
  );
  assert.deepStrictEqual(
    send.mock.calls.map((call) => call.arguments),
    [[{ message: error.message, statusCode: error.statusCode, data: error.data }]],
  );
});

test('handle(): should handle JSON parsing error', async () => {
  const { errorHandler, req, res, status, send, next } = context;

  const errorMessage: string = 'error message';
  const body: string =
    '{\r\n"players": [\r\n{\r\n"cards": ["Td", "As"]\r\n}\r\n{\r\n\r\n}\r\n]\r\n}\r\n';
  const error = {
    type: 'entity.parse.failed',
    message: errorMessage,
    body,
  };

  errorHandler.handle(error, req, res, next);

  assert.deepStrictEqual(
    status.mock.calls.map((call) => call.arguments),
    [[400]],
  );
  assert.deepStrictEqual(
    send.mock.calls.map((call) => call.arguments),
    [[{ message: error.message, statusCode: 400, data: { body } }]],
  );
});

test('handle(): should handle an error', async (t) => {
  const { errorHandler, req, res, status, send, next } = context;

  const exit = t.mock.method(process, 'exit', (code?: number) => code as never);

  const errorMessage: string = 'error message';
  const error = new Error(errorMessage);

  errorHandler.handle(error, req, res, next);

  assert.deepStrictEqual(
    status.mock.calls.map((call) => call.arguments),
    [[500]],
  );
  assert.deepStrictEqual(
    send.mock.calls.map((call) => call.arguments),
    [[{ message: error.message, statusCode: 500, data: 'Internal server error' }]],
  );
  assert.deepStrictEqual(
    exit.mock.calls.map((call) => call.arguments),
    [[1]],
  );
});
