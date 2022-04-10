import { Card } from 'constant';
import { ISerializedBoard, ISerializedPlayer } from 'interfaces';
import Board from 'models/Board';

interface ITestContext {
  serializedBoard: ISerializedBoard,
}

let context: ITestContext;

beforeEach(() => {
  const players: ISerializedPlayer[] = [
    {
      cards: ['As', 'Qc'],
    },
    {
      cards: ['Td', '2h'],
    },
  ];

  const serializedBoard: ISerializedBoard = {
    players,
    communityCards: ['7d', '4d', '5d'],
    deathCards: ['6d', '2s'],
  };

  context = {
    serializedBoard,
  };
});

test('constructor(): should sort player cards', async () => {
  const { serializedBoard } = context;

  const board = new Board(serializedBoard);

  expect(board.playersCards[0]).toEqual([Card['qc'], Card['as']]);
  expect(board.playersCards[1]).toEqual([Card['2h'], Card['td']]);
});

test('constructor(): should sort communityCards', async () => {
  const { serializedBoard } = context;

  const board = new Board(serializedBoard);

  expect(board.communityCards).toEqual([Card['4d'], Card['5d'], Card['7d']]);
});

test('constructor(): should sort deathCards', async () => {
  const { serializedBoard } = context;

  const board = new Board(serializedBoard);

  expect(board.deathCards).toEqual([Card['2s'], Card['6d']]);
});
