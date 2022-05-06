import { ICache, ILogger } from 'interfaces';
import ComputeHandController, { IComputeHandResponse } from 'controllers/ComputeHandController';
import Board from 'models/Board';
import { createCacheStub, createLoggerStub } from '../_utils/Stubs';
import { getExampleResults } from '../_utils/Utils';

interface ITestFunction {
  (board: Board): Promise<IComputeHandResponse>;
}

interface ITestContext {
  testFunction: ITestFunction,
  board: Board,
  cacheInMemoryStub: jest.Mocked<ICache<string, IComputeHandResponse>>
}

let context: ITestContext;

beforeEach(() => {
  const loggerStub: ILogger = createLoggerStub();

  const cacheInMemoryStub: jest.Mocked<ICache<string, IComputeHandResponse>> = createCacheStub();

  const computeHandController = new ComputeHandController(cacheInMemoryStub);

  const testFunction: ITestFunction = (board) => computeHandController.execute(
    {
      board,
      logger: loggerStub,
    },
  );

  const board: Board = new Board(
    {
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
    },
  );

  context = {
    testFunction,
    board,
    cacheInMemoryStub,
  };
});

test('execute(): should return results', async () => {
  const { testFunction, board } = context;

  const results: IComputeHandResponse = await testFunction(board);

  expect(results).toBeDefined();
});

test('execute(): should save results when cache is empty', async () => {
  const { testFunction, board, cacheInMemoryStub } = context;

  await testFunction(board);

  expect(cacheInMemoryStub.set).toBeCalled();
});

test('execute(): should return results from cache when it is set', async () => {
  const { testFunction, board, cacheInMemoryStub } = context;

  const expectedResults: IComputeHandResponse = getExampleResults();

  cacheInMemoryStub.get.mockReturnValue(expectedResults);

  const results: IComputeHandResponse = await testFunction(board);

  expect(cacheInMemoryStub.set).not.toBeCalled();
  expect(results).toBe(expectedResults);
});
