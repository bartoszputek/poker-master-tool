import ArrayValidator from 'validators/ArrayValidator';
import ValidationError from 'errors/ValidationError';

interface ITestContext {
  arrayValidator: ArrayValidator
}

let context: ITestContext;

beforeAll(() => {
  const arrayValidator: ArrayValidator = new ArrayValidator();

  context = {
    arrayValidator,
  };
});

test('validate(): should return true', async () => {
  const { arrayValidator } = context;

  const array: string[] = [
    'aaa',
    'bbb',
  ];

  const response = arrayValidator.validate(array);

  expect(response).toBe(true);
});

test('validate(): should throw an error when object is not an array', async () => {
  const { arrayValidator } = context;

  const array: string = 'aaa';

  const response = () => {
    arrayValidator.validate(array);
  };

  const expectedError: ValidationError = new ValidationError('Object is not an array', { array });

  expect(response).toThrow(expectedError);
});
