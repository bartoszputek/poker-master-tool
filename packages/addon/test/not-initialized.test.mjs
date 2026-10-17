import assert from 'node:assert/strict';
import { test } from 'node:test';
import addon from '../index.js';

test('calculate(): rejects when the lookup table is not loaded', async () => {
  // Given: a new process, because node:test runs each file in a new process

  // When
  const result = addon.calculate([[1, 2]], [], []);

  // Then
  await assert.rejects(
    result,
    new Error('The lookup table is not loaded. Call initLookUpTable() first!'),
  );
});
