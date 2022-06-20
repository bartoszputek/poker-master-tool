import PlayersValidator from 'validators/PlayersValidator';
import { ISerializedPlayer } from 'interfaces';
import ValidationError from 'errors/ValidationError';

interface ITestContext {
  playersValidator: PlayersValidator
}

let context: ITestContext;

beforeAll(() => {
  const playersValidator: PlayersValidator = new PlayersValidator();

  context = {
    playersValidator,
  };
});

test('validate(): should return true', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['Td', 'As'],
    },
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const response = playersValidator.validate(players);

  expect(response).toBe(true);
});

test('validate(): should throw an error when there is too many players ', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = getPlayers(10);

  const response = () => {
    playersValidator.validate(players);
  };

  const expectedError: ValidationError = new ValidationError('Length of players array is too long (9 is maximum)', players);

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when players array is empty', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = [];

  const response = () => {
    playersValidator.validate(players);
  };

  const expectedError: ValidationError = new ValidationError('Players array should have at least 1 element', players);

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when player has not cards property ', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = [
    {} as ISerializedPlayer,
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const response = () => {
    playersValidator.validate(players);
  };

  const expectedError: ValidationError = new ValidationError('Property cards is missing in player object', players[0]);

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when player has too many card ', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['Td', 'As', 'Qh'],
    },
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const response = () => {
    playersValidator.validate(players);
  };

  const expectedError: ValidationError = new ValidationError(
    'Cards property in player object should have exactly two cards',
    players[0],
  );

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when player has one card', async () => {
  const { playersValidator } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['Td'],
    },
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const response = () => {
    playersValidator.validate(players);
  };

  const expectedError: ValidationError = new ValidationError(
    'Cards property in player object should have exactly two cards',
    players[0],
  );

  expect(response).toThrow(expectedError);
});

function getPlayers(amount: number): ISerializedPlayer[] {
  const players: ISerializedPlayer[] = [];

  for (let i = 0; i < amount; i += 1) {
    const player: ISerializedPlayer = {
      cards: ['Td', 'As'],
    };

    players.push(player);
  }

  return players;
}
