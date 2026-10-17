import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import addon from '../index.js';
import golden from './golden.json' with { type: 'json' };

before(() => addon.initLookUpTable());

for (const { name, players, community, death, expected } of golden) {
  test(`calculate(): ${name}`, async () => {
    assert.deepStrictEqual(await addon.calculate(players, community, death), expected);
  });
}

test('calculate(): rejects more than 9 players', async () => {
  const players = Array.from({ length: 10 }, (_, i) => [i + 1, i + 11]);

  await assert.rejects(addon.calculate(players, [], []), /Maximum length of players array is 9/);
});

test('calculate(): rejects a player without two cards', async () => {
  await assert.rejects(addon.calculate([[1, 2, 3]], [], []), /Player should have two cards/);
});

test('calculate(): rejects more than 5 community cards', async () => {
  await assert.rejects(
    addon.calculate([[1, 2]], [3, 4, 5, 6, 7, 8], []),
    /Maximum length of communityCards array is 5/,
  );
});

test('calculate(): rejects death cards that are not an array', async () => {
  await assert.rejects(addon.calculate([[1, 2]], [], 1), /deathCards should be an array/);
});
