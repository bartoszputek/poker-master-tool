import assert from 'node:assert/strict';
import { before, beforeEach, test } from 'node:test';
import { initLookUpTable } from '@poker-master-tool/addon';
import type { ICache, ILogger } from '../../src/interfaces.ts';
import ComputeHandController, {
  type IComputeHandResponse,
} from '../../src/controllers/ComputeHandController.ts';
import Board from '../../src/models/Board.ts';
import { createCacheStub, createLoggerStub, type Mocked } from '../_utils/Stubs.ts';
import { getExampleResults } from '../_utils/Utils.ts';

interface ITestFunction {
  (board: Board): Promise<IComputeHandResponse>;
}

interface ITestContext {
  testFunction: ITestFunction;
  board: Board;
  cacheInMemoryStub: Mocked<ICache<string, IComputeHandResponse>>;
}

let context: ITestContext;

before(() => initLookUpTable());

beforeEach(() => {
  const loggerStub: ILogger = createLoggerStub();

  const cacheInMemoryStub: Mocked<ICache<string, IComputeHandResponse>> = createCacheStub();

  const computeHandController = new ComputeHandController(cacheInMemoryStub);

  const testFunction: ITestFunction = (board) =>
    computeHandController.execute({
      board,
      logger: loggerStub,
    });

  const board: Board = new Board({
    players: [
      {
        cards: ['Td', 'As'],
      },
      {
        cards: ['Kh', 'Kd'],
      },
    ],
    communityCards: ['Qc', '2c', '3c'],
    deathCards: ['6d'],
  });

  context = {
    testFunction,
    board,
    cacheInMemoryStub,
  };
});

test('execute(): should return results', async () => {
  const { testFunction, board } = context;

  const results: IComputeHandResponse = await testFunction(board);

  assert.notStrictEqual(results, undefined);
});

test('execute(): should save results when cache is empty', async () => {
  const { testFunction, board, cacheInMemoryStub } = context;

  await testFunction(board);

  assert.strictEqual(cacheInMemoryStub.set.mock.callCount(), 1);
});

test('execute(): should return results from cache when it is set', async () => {
  const { testFunction, board, cacheInMemoryStub } = context;

  const expectedResults: IComputeHandResponse = getExampleResults();

  cacheInMemoryStub.get.mock.mockImplementation(() => expectedResults);

  const results: IComputeHandResponse = await testFunction(board);

  assert.strictEqual(cacheInMemoryStub.set.mock.callCount(), 0);
  assert.strictEqual(results, expectedResults);
});
