import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import ValidationError from '../../src/errors/ValidationError.ts';
import type { ISerializedBoard, ISerializedPlayer } from '../../src/interfaces.ts';
import BoardValidator from '../../src/validators/BoardValidator.ts';

interface ITestContext {
  boardValidator: BoardValidator;
  players: ISerializedPlayer[];
}

let context: ITestContext;

before(() => {
  const boardValidator: BoardValidator = new BoardValidator();

  const players: ISerializedPlayer[] = [
    {
      cards: ['Ad', 'Qd'],
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
    communityCards: ['Ts', 'As', 'Qc', '2c', '3c'],
    deathCards: ['6d'],
  };

  const response = boardValidator.validate(board);

  assert.strictEqual(response, true);
});

test('validate(): should throw an error when board has not cards property ', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = { players } as ISerializedBoard;

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError(
    'Property communityCards is missing in board object',
    board,
  );

  assert.throws(response, expectedError);
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

  const expectedError: ValidationError = new ValidationError(
    'Property communityCards has too many cards (5 is maximum)',
    board,
  );

  assert.throws(response, expectedError);
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

  const expectedError: ValidationError = new ValidationError(
    'Property deathCards is missing in board object',
    board,
  );

  assert.throws(response, expectedError);
});

test('validate(): should throw an error when board is not defined', async () => {
  const { boardValidator } = context;

  const board: ISerializedBoard = undefined as unknown as ISerializedBoard;

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError(
    'Board object does not exist in request body',
    board,
  );

  assert.throws(response, expectedError);
});

test('validate(): should throw an error when board includes duplicates', async () => {
  const { boardValidator, players } = context;

  const board: ISerializedBoard = {
    players,
    communityCards: ['Ts', 'As', 'Qc', '2c', '3c'],
    deathCards: ['2c'],
  };

  const response = () => {
    boardValidator.validate(board);
  };

  const expectedError: ValidationError = new ValidationError(
    'Board includes duplicated cards',
    board,
  );

  assert.throws(response, expectedError);
});
