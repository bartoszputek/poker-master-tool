import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import ArrayValidator from '../../src/validators/ArrayValidator.ts';
import ValidationError from '../../src/errors/ValidationError.ts';

interface ITestContext {
  arrayValidator: ArrayValidator;
}

let context: ITestContext;

before(() => {
  const arrayValidator: ArrayValidator = new ArrayValidator();

  context = {
    arrayValidator,
  };
});

test('validate(): should return true', async () => {
  const { arrayValidator } = context;

  const array: string[] = ['aaa', 'bbb'];

  const response = arrayValidator.validate(array);

  assert.strictEqual(response, true);
});

test('validate(): should throw an error when object is not an array', async () => {
  const { arrayValidator } = context;

  const array: string = 'aaa';

  const response = () => {
    arrayValidator.validate(array);
  };

  const expectedError: ValidationError = new ValidationError('Object is not an array', { array });

  assert.throws(response, expectedError);
});
