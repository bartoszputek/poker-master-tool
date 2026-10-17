import assert from 'node:assert/strict';
import { test } from 'node:test';
import ApplicationError from '../../src/errors/ApplicationError.ts';
import ValidationError from '../../src/errors/ValidationError.ts';

test('constructor(): should create an instance of error with proper message and status code', async () => {
  const message: string = 'example message';
  const data = {
    cards: ['Td', 'As'],
  };

  const error = new ValidationError(message, data);

  assert.ok(error instanceof ApplicationError);
  assert.ok(error instanceof ValidationError);
  assert.strictEqual(error.message, message);
  assert.strictEqual(error.statusCode, 400);
  assert.strictEqual(error.data, data);
});
