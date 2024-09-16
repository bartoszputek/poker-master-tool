import { NextFunction, Request, Response } from 'express';

import { IComputeHandParams, IComputeHandResponse } from 'controllers/ComputeHandController';
import ComputeHandHandler, { SECONDS_IN_MONTH } from 'handlers/ComputeHandHandler';
import Board from 'models/Board';
import { IController, ILogger, ISerializedBoard, IValidator } from 'interfaces';
import { getExampleResults } from '../_utils/Utils';
import { createLoggerStub } from '../_utils/Stubs';

interface ITestContext {
  computeHandHandler: ComputeHandHandler,
  computeHandControllerStub: IController<IComputeHandParams, Promise<IComputeHandResponse>>,
  boardValidatorStub: IValidator
  seralizedBoard: ISerializedBoard,
  parameters: IComputeHandParams,
  req: Request<any, any, any, any, { board: ISerializedBoard, logger: ILogger }>,
  res: Response<any, { board: ISerializedBoard, logger: ILogger }>,
  next: NextFunction
}

let context: ITestContext;

beforeEach(() => {
  const computeHandControllerStub: IController<IComputeHandParams, Promise<IComputeHandResponse>> = {
    execute: jest.fn(async () => getExampleResults()),
  };
  const boardValidatorStub: IValidator = {
    validate: jest.fn(),
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
  const res: Partial<Response> = {
    status: jest.fn(),
    send: jest.fn(),
    set: jest.fn(),
    locals: {
      logger: loggerStub,
    },
  };
  const next: NextFunction = jest.fn();

  context = {
    computeHandHandler,
    computeHandControllerStub,
    boardValidatorStub,
    seralizedBoard,
    parameters,
    req: req as Request<any, any, any, any, { board: ISerializedBoard, logger: ILogger }>,
    res: res as Response<any, { board: ISerializedBoard, logger: ILogger }>,
    next,
  };
});

test('handle(): should call execute method and send response', async () => {
  const { computeHandHandler, computeHandControllerStub, parameters, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  await computeHandHandler.handle(req, res, next);

  expect(computeHandControllerStub.execute).toBeCalledWith(parameters);
  expect(res.send).toBeCalledWith(getExampleResults());
});

test('handle(): should set cache and content-type headers', async () => {
  const { computeHandHandler, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  await computeHandHandler.handle(req, res, next);

  expect(res.set).toBeCalledWith('Cache-Control', `public, max-age=${SECONDS_IN_MONTH}`);
  expect(res.set).toBeCalledWith('Content-Type', 'application/json');
});

test('validate(): should call validation methods and next function', async () => {
  const { computeHandHandler, boardValidatorStub, seralizedBoard, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  expect(boardValidatorStub.validate).toBeCalledWith(seralizedBoard);
  expect(next).toBeCalled();
});
