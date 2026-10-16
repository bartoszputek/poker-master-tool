import assert from 'node:assert/strict';
import { test } from 'node:test';
import ApplicationError from '../../src/errors/ApplicationError';

test('constructor(): should create an instance of error with proper message and status code', async () => {
  const message: string = 'example message';
  const statusCode: number = 402;
  const data = {
    cards: ['Td', 'As'],
  };

  const error = new ApplicationError(message, statusCode, data);

  assert.ok(error instanceof Error);
  assert.ok(error instanceof ApplicationError);
  assert.strictEqual(error.message, message);
  assert.strictEqual(error.statusCode, 402);
  assert.strictEqual(error.data, data);
});
