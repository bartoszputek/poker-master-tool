import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';

import { IComputeHandParams, IComputeHandResponse } from 'controllers/ComputeHandController';
import {
  ISerializedBoard,
  IController,
  IHandler,
  IValidator,
  ILogger,
} from 'interfaces';
import BoardValidator from 'validators/BoardValidator';
import Board from 'models/Board';
import ValidationError from '../errors/ValidationError';

export const SECONDS_IN_MONTH: number = 60 * 60 * 24 * 30;

export default class ComputeHandHandler implements IHandler {
  constructor(
    private readonly controller: IController<IComputeHandParams, Promise<IComputeHandResponse>>,
    private readonly boardValidator: IValidator = new BoardValidator(),
  ) { }

  public handle: RequestHandler<any, any, any, any, { board: ISerializedBoard, logger: ILogger }> =
  async (req: Request, res: Response<any, { board: ISerializedBoard, logger: ILogger }>) => {
    const { board: serializedBoard }: { board: ISerializedBoard } = res.locals;

    const logger: ILogger = res.locals.logger as ILogger;

    const board: Board = new Board(serializedBoard);

    const parameters: IComputeHandParams = {
      board,
      logger,
    };

    const response: IComputeHandResponse = await this.controller.execute(parameters);

    logger.timeInfo({
      message: 'The ComputeHandHandler handled response successfully',
      statusCode: 200,
    });

    res.set('Cache-Control', `public, max-age=${SECONDS_IN_MONTH}`);
    res.set('Content-Type', 'application/json');

    res.send(response);
  };

  public validate: RequestHandler<any, any, any, { board: string }> = (
    req: Request<any, any, any, { board: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    const { board }: { board: string } = req.query;

    if (typeof board !== 'string') {
      throw new ValidationError('The board query parameter is not a string.', { board });
    }

    const serializedBoard: ISerializedBoard = this._deseralizeBase64Json(board);

    this.boardValidator.validate(serializedBoard);

    res.locals.board = serializedBoard;

    next();
  };

  private _deseralizeBase64Json(board: string): ISerializedBoard {
    const base64Value: string = Buffer.from(board, 'base64').toString('ascii');

    try {
      const json = JSON.parse(base64Value);

      return json;
    } catch (error) {
      throw new ValidationError('The board query parameter is not a parsable JSON string.', { board });
    }
  }
}
