import { NextFunction, Request, Response } from 'express';

import { IComputeHandParams, IComputeHandResponse } from 'controllers/ComputeHandController';
import ComputeHandHandler from 'handlers/ComputeHandHandler';
import Board from 'models/Board';
import { IController, ILogger, ISerializedBoard, IValidator } from 'interfaces';
import { getExampleResults } from '../Utils';
import { createLoggerStub } from '../Stubs';

interface ITestContext {
  computeHandHandler: ComputeHandHandler,
  computeHandControllerStub: IController<IComputeHandParams, Promise<IComputeHandResponse>>,
  boardValidatorStub: IValidator
  seralizedBoard: ISerializedBoard,
  parameters: IComputeHandParams,
  req: Request,
  res: Response,
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

  const req: Partial<Request> = {
    body: {
      board: seralizedBoard,
    },
  } as Request;
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
    req: req as Request,
    res: res as Response,
    next,
  };
});

test('handle(): should call execute method and send response', async () => {
  const { computeHandHandler, computeHandControllerStub, parameters, req, res, next } = context;

  await computeHandHandler.handle(req, res, next);

  expect(computeHandControllerStub.execute).toBeCalledWith(parameters);
  expect(res.send).toBeCalledWith(getExampleResults());
});

test('validate(): should call validation methods and next function', async () => {
  const { computeHandHandler, boardValidatorStub, seralizedBoard, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  expect(boardValidatorStub.validate).toBeCalledWith(seralizedBoard);
  expect(next).toBeCalled();
});
