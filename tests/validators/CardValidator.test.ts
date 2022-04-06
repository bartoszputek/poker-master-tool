import ValidationError from 'errors/ValidationError';
import CardValidator from 'validators/CardValidator';

interface ITestContext {
  cardValidator: CardValidator
}

let context: ITestContext;

beforeAll(() => {
  const cardValidator: CardValidator = new CardValidator();

  context = {
    cardValidator,
  };
});

test('validate(): should return true', async () => {
  const { cardValidator } = context;

  const card: string = 'Ks';

  const response = cardValidator.validate(card);

  expect(response).toBe(true);
});

test('validate(): should throw an error when card format is too long', async () => {
  const { cardValidator } = context;

  const card: string = 'Kqq';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when rank is incorrect ', async () => {
  const { cardValidator } = context;

  const card: string = 'Gs';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  expect(response).toThrow(expectedError);
});

test('validate(): should throw an error when suit is incorrect ', async () => {
  const { cardValidator } = context;

  const card: string = 'Kw';

  const response = () => {
    cardValidator.validate(card);
  };

  const expectedError: ValidationError = new ValidationError('Incorrect card format', { card });

  expect(response).toThrow(expectedError);
});
