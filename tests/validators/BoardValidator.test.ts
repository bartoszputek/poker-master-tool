import ValidationError from 'errors/ValidationError';
import { ISerializedBoard, ISerializedPlayer } from 'interfaces';
import BoardValidator from 'validators/BoardValidator';

interface ITestContext {
  boardValidator: BoardValidator
  players: ISerializedPlayer[]
}

let context: ITestContext;

beforeAll(() => {
  const boardValidator: BoardValidator = new BoardValidator();

  const players: ISerializedPlayer[] = [
    {
      cards: ['As', 'Qc'],
    },
    {
      cards: ['Td', '2h'],
    },
  ];

  context = {
    boardValidator,
    players,
  };
});

test('validate(): should return true', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = {
    players,
    communityCards: ['Td', 'As', 'Qc', '2c', '3c'],
    deathCards: ['6d'],
  };

  const response = boardValidator.validate(board);

  expect(response).toBe(true);
});

test('validate(): should throw an error when board has not cards property ', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = { players } as ISerializedBoard;

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError('Property cards is missing in board object', board);

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when board has too many card', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = {
    players,
    communityCards: ['Td', 'As', 'Qc', '2c', '3c', '4c'],
    deathCards: ['6d'],
  };

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError('Board has too many cards', { board });

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when board has not deathCards property ', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = {
    players,
    communityCards: ['Td', 'As', 'Qc', '2c', '3c'],
  } as ISerializedBoard;

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError('Property deathCards is missing in board object', board);

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when board is not defined', async () => {
  const { boardValidator } = context;

  const board: ISerializedBoard = undefined as unknown as ISerializedBoard;

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError('Board object does not exist in request body', board);

  expect(response).toThrow(expectedError);
});
