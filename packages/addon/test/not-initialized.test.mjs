import assert from 'node:assert/strict';
import { test } from 'node:test';
import addon from '../index.js';

// node:test runs each file in a new process, so the table is not loaded here.
test('calculate(): rejects when the lookup table is not loaded', async () => {
  await assert.rejects(
    addon.calculate([[1, 2]], [], []),
    new Error('The lookup table is not loaded. Call initLookUpTable() first!'),
  );
});
