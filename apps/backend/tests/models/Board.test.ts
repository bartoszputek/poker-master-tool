import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { Card } from '../../src/constant';
import { ISerializedBoard, ISerializedPlayer } from '../../src/interfaces';
import Board from '../../src/models/Board';

interface ITestContext {
  serializedBoard: ISerializedBoard;
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

  assert.deepStrictEqual(board.playersCards[0], [Card['qc'], Card['as']]);
  assert.deepStrictEqual(board.playersCards[1], [Card['2h'], Card['td']]);
});

test('constructor(): should sort communityCards', async () => {
  const { serializedBoard } = context;

  const board = new Board(serializedBoard);

  assert.deepStrictEqual(board.communityCards, [Card['4d'], Card['5d'], Card['7d']]);
});

test('constructor(): should sort deathCards', async () => {
  const { serializedBoard } = context;

  const board = new Board(serializedBoard);

  assert.deepStrictEqual(board.deathCards, [Card['2s'], Card['6d']]);
});
