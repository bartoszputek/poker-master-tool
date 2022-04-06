import { ICache, IController, ILogger } from 'interfaces';
import Board from 'models/Board';
import { calculate, ICalculateResponse } from '../../addon/addon';

export interface IComputeHandParams{
  board: Board;
  logger: ILogger
}

export interface IComputeHandResponse extends ICalculateResponse {}

export default class ComputeHandController implements IController<IComputeHandParams, Promise<IComputeHandResponse>> {
  constructor(private readonly cache: ICache<string, IComputeHandResponse>) {}

  public async execute({ board, logger }: IComputeHandParams): Promise<IComputeHandResponse> {
    const { playersCards, communityCards, deathCards } = board;

    const key: string = JSON.stringify(board);
    let results: IComputeHandResponse | undefined = this.cache.get(key);

    if (results) {
      logger.trace({
        message: 'The results are received from cache',
        board,
        results,
      });

      return results;
    }

    results = await calculate(playersCards, communityCards, deathCards);

    this.cache.set(key, results);

    logger.trace({
      message: 'The results are calculated',
    });

    return results;
  }
}
