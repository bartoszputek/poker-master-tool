import type { ICache, IController, ILogger } from '../interfaces.ts';
import type Board from '../models/Board.ts';
import { calculate, type ICalculateResponse } from '@poker-master-tool/addon';

export interface IComputeHandParams {
  board: Board;
  logger: ILogger;
}

export type IComputeHandResponse = ICalculateResponse;

export default class ComputeHandController implements IController<
  IComputeHandParams,
  Promise<IComputeHandResponse>
> {
  private readonly cache: ICache<string, IComputeHandResponse>;

  constructor(cache: ICache<string, IComputeHandResponse>) {
    this.cache = cache;
  }

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
