import { ISerializedBoard, ISerializedPlayer } from 'interfaces';
import Board from 'models/Board';

test('constructor(): should create an instance', async () => {
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
    communityCards: ['3d', '4d', '5d'],
  };

  const board = new Board(serializedBoard);

  expect(board.playersCards.length).toBe(2);
  expect(board.communityCards.length).toBe(3);
});
