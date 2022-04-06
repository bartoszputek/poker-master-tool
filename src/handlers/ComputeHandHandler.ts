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

export default class ComputeHandHandler implements IHandler {
  constructor(
    private readonly controller: IController<IComputeHandParams, Promise<IComputeHandResponse>>,
    private readonly boardValidator: IValidator = new BoardValidator(),
  ) {}

  public handle: RequestHandler = async (req: Request, res: Response) => {
    const { board: serializedBoard }: { board: ISerializedBoard } = req.body;

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

    res.send(response);
  };

  public validate: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const { board: serializedBoard }: { board: ISerializedBoard } = req.body;

    this.boardValidator.validate(serializedBoard);

    next();
  };
}
