import assert from 'node:assert/strict';
import { beforeEach, mock, Mock, test } from 'node:test';
import { NextFunction, Request, Response } from 'express';

import { IComputeHandParams, IComputeHandResponse } from '../../src/controllers/ComputeHandController';
import ComputeHandHandler, { SECONDS_IN_MONTH } from '../../src/handlers/ComputeHandHandler';
import Board from '../../src/models/Board';
import { IController, ILogger, ISerializedBoard, IValidator } from '../../src/interfaces';
import { getExampleResults } from '../_utils/Utils';
import { createLoggerStub, Mocked } from '../_utils/Stubs';

interface ITestContext {
  computeHandHandler: ComputeHandHandler,
  computeHandControllerStub: Mocked<IController<IComputeHandParams, Promise<IComputeHandResponse>>>,
  boardValidatorStub: Mocked<IValidator>,
  seralizedBoard: ISerializedBoard,
  parameters: IComputeHandParams,
  req: Request<any, any, any, any, { board: ISerializedBoard, logger: ILogger }>,
  res: Response<any, { board: ISerializedBoard, logger: ILogger }>,
  set: Mock<Response['set']>,
  send: Mock<Response['send']>,
  next: Mock<NextFunction>
}

let context: ITestContext;

beforeEach(() => {
  const computeHandControllerStub: Mocked<IController<IComputeHandParams, Promise<IComputeHandResponse>>> = {
    execute: mock.fn(async () => getExampleResults()),
  };
  const boardValidatorStub: Mocked<IValidator> = {
    validate: mock.fn(() => true),
  };

  const loggerStub: ILogger = createLoggerStub();

  const computeHandHandler = new ComputeHandHandler(
    computeHandControllerStub,
    boardValidatorStub,
  );

  const seralizedBoard: ISerializedBoard = {
    players: [
      {
        cards: ['Td', 'As'],
      },
      {
        cards: ['Td', 'As'],
      },
    ],
    communityCards: ['Td', 'As', 'Qc', '2c', '3c'],
    deathCards: ['6d'],
  };

  const parameters: IComputeHandParams = {
    board: new Board(seralizedBoard),
    logger: loggerStub,
  };

  const encodedBoard: string = Buffer.from(JSON.stringify(seralizedBoard)).toString('base64');

  const req: Partial<Request> = {
    query: {
      board: encodedBoard,
    },
  } as Request<any, any, any, any, { board: ISerializedBoard, logger: ILogger }>;
  const set: Mock<Response['set']> = mock.fn();
  const send: Mock<Response['send']> = mock.fn();

  const res: Partial<Response> = {
    status: mock.fn<Response['status']>(),
    send,
    set,
    locals: {
      logger: loggerStub,
    },
  };
  const next: Mock<NextFunction> = mock.fn();

  context = {
    computeHandHandler,
    computeHandControllerStub,
    boardValidatorStub,
    seralizedBoard,
    parameters,
    req: req as Request<any, any, any, any, { board: ISerializedBoard, logger: ILogger }>,
    res: res as Response<any, { board: ISerializedBoard, logger: ILogger }>,
    set,
    send,
    next,
  };
});

test('handle(): should call execute method and send response', async () => {
  const { computeHandHandler, computeHandControllerStub, parameters, req, res, send, next } = context;

  computeHandHandler.validate(req, res, next);

  await computeHandHandler.handle(req, res, next);

  assert.deepStrictEqual(computeHandControllerStub.execute.mock.calls.map((call) => call.arguments), [[parameters]]);
  assert.deepStrictEqual(send.mock.calls.map((call) => call.arguments), [[getExampleResults()]]);
});

test('handle(): should set cache and content-type headers', async () => {
  const { computeHandHandler, req, res, set, next } = context;

  computeHandHandler.validate(req, res, next);

  await computeHandHandler.handle(req, res, next);

  assert.deepStrictEqual(set.mock.calls.map((call) => call.arguments), [
    ['Cache-Control', `public, max-age=${SECONDS_IN_MONTH}`],
    ['Content-Type', 'application/json'],
  ]);
});

test('validate(): should call validation methods and next function', async () => {
  const { computeHandHandler, boardValidatorStub, seralizedBoard, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  assert.deepStrictEqual(boardValidatorStub.validate.mock.calls.map((call) => call.arguments), [[seralizedBoard]]);
  assert.strictEqual(next.mock.callCount(), 1);
});
