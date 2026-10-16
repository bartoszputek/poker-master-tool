import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import ValidationError from '../../src/errors/ValidationError.ts';
import CardValidator from '../../src/validators/CardValidator.ts';

interface ITestContext {
  cardValidator: CardValidator;
}

let context: ITestContext;

before(() => {
  const cardValidator: CardValidator = new CardValidator();

  context = {
    cardValidator,
  };
});

test('validate(): should return true', async () => {
  const { cardValidator } = context;

  const card: string = 'Ks';

  const response = cardValidator.validate(card);

  assert.strictEqual(response, true);
});

test('validate(): should throw an error when card format is too long', async () => {
  const { cardValidator } = context;

  const card: string = 'Kqq';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  assert.throws(response, expectedError);
});

test('validate(): should throw an error when rank is incorrect ', async () => {
  const { cardValidator } = context;

  const card: string = 'Gs';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  assert.throws(response, expectedError);
});

test('validate(): should throw an error when suit is incorrect ', async () => {
  const { cardValidator } = context;

  const card: string = 'Kw';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  assert.throws(response, expectedError);
});

test('validate(): should throw an error when card is undefined', async () => {
  const { cardValidator } = context;

  const card: string = undefined as unknown as string;

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  assert.throws(response, expectedError);
});
