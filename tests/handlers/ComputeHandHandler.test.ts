import { NextFunction, Request, Response } from 'express';

import { IComputeHandParams, IComputeHandResponse } from 'controllers/ComputeHandController';
import ComputeHandHandler from 'handlers/ComputeHandHandler';
import Board from 'models/Board';
import { IController, ILogger, ISerializedBoard, IValidator } from 'interfaces';
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
    execute: jest.fn(async () => exampleResult()),
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
  expect(res.send).toBeCalledWith(exampleResult());
});

test('validate(): should call validation methods and next function', async () => {
  const { computeHandHandler, boardValidatorStub, seralizedBoard, req, res, next } = context;

  computeHandHandler.validate(req, res, next);

  expect(boardValidatorStub.validate).toBeCalledWith(seralizedBoard);
  expect(next).toBeCalled();
});

function exampleResult(): IComputeHandResponse {
  return {
    players: [
      {
        handTypes: {
          bad: 0,
          highCard: 317149,
          onePair: 771874,
          twoPair: 398148,
          trips: 78736,
          straight: 64152,
          flush: 38642,
          fullHouse: 40896,
          quads: 2376,
          straightFlush: 331,
        },
        results: {
          win: [
            953955,
            55.72,
          ],
          draw: [
            7346,
            0.43,
          ],
          lose: [
            751003,
            43.86,
          ],
        },
      },
      {
        handTypes: {
          bad: 0,
          highCard: 293411,
          onePair: 725109,
          twoPair: 386284,
          trips: 76721,
          straight: 62074,
          flush: 123468,
          fullHouse: 40896,
          quads: 2376,
          straightFlush: 1965,
        },
        results: {
          win: [
            751003,
            43.86,
          ],
          draw: [
            7346,
            0.43,
          ],
          lose: [
            953955,
            55.72,
          ],
        },
      },
    ],
    combinations: 1712304,
  };
}
