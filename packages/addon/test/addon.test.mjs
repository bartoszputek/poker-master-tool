import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import addon from '../index.js';
import golden from './golden.json' with { type: 'json' };

const binding = createRequire(import.meta.url)('../build/Release/addon.node');

before(() => addon.initLookUpTable());

test('initLookUpTable(): does not read the table again after it is loaded', async () => {
  // Given: the table is loaded by before()
  const { players, community, death, expected } = golden[0];

  // When: the table is loaded again from a file that does not exist
  await binding.initLookUpTable('/no/such/HandRanks.dat');

  // Then: the call resolves, because the file is not read, and the table is unchanged
  assert.deepStrictEqual(await addon.calculate(players, community, death), expected);
});

for (const { name, players, community, death, expected } of golden) {
  test(`calculate(): ${name}`, async () => {
    // Given: a board with known results

    // When
    const result = await addon.calculate(players, community, death);

    // Then
    assert.deepStrictEqual(result, expected);
  });
}

for (const { name, players, community, death } of golden) {
  test(`calculate(): results are consistent for ${name}`, async () => {
    // Given: a board

    // When
    const result = await addon.calculate(players, community, death);

    // Then: each board gives each player exactly one hand type
    for (const { handTypes } of result.players) {
      const handTypeTotal = Object.values(handTypes).reduce((sum, count) => sum + count, 0);
      assert.equal(handTypeTotal, result.combinations);
    }

    // Then: lose is derived from win and draw, so it is negative if they are counted twice
    for (const { results } of result.players) {
      assert.ok(results.lose[0] >= 0);
    }

    // Then: only one player can win a board alone
    const wins = result.players.reduce((sum, { results }) => sum + results.win[0], 0);
    assert.ok(wins <= result.combinations);
  });
}

const throwingCard = {
  valueOf() {
    throw new Error('valueOf() was called');
  },
};

const validInput = { players: [[1, 2]], communityCards: [], deathCards: [] };

const invalidInputs = [
  {
    name: 'players that are not an array',
    input: { players: {} },
    message: 'The argument playersCards should be an array!',
  },
  {
    name: 'no players',
    input: { players: [] },
    message: 'Minimum length of players array is 1!',
  },
  {
    name: 'more than 9 players',
    input: { players: Array.from({ length: 10 }, (_, i) => [i + 1, i + 11]) },
    message: 'Maximum length of players array is 9!',
  },
  {
    name: 'a player with three cards',
    input: { players: [[1, 2, 3]] },
    message: 'Player should have two cards!',
  },
  {
    name: 'a player that is a string',
    input: { players: ['ab'] },
    message: 'Player should have two cards!',
  },
  {
    name: 'community cards that are not an array',
    input: { communityCards: 3 },
    message: 'The argument communityCards should be an array!',
  },
  {
    name: 'more than 5 community cards',
    input: { communityCards: [3, 4, 5, 6, 7, 8] },
    message: 'Maximum length of communityCards array is 5!',
  },
  {
    name: 'death cards that are not an array',
    input: { deathCards: 1 },
    message: 'The argument deathCards should be an array!',
  },
  {
    name: 'card 0',
    input: { players: [[0, 2]] },
    message: 'Card should be an integer from 1 to 52!',
  },
  {
    name: 'card 53',
    input: { communityCards: [53] },
    message: 'Card should be an integer from 1 to 52!',
  },
  {
    name: 'a card that is not an integer',
    input: { players: [[1, 2.5]] },
    message: 'Card should be an integer from 1 to 52!',
  },
  {
    name: 'a card that is a string',
    input: { deathCards: ['3'] },
    message: 'Card should be an integer from 1 to 52!',
  },
  {
    name: 'a card with a valueOf() that throws',
    input: { players: [[1, throwingCard]] },
    message: 'Card should be an integer from 1 to 52!',
  },
  {
    name: 'a duplicated card',
    input: {
      players: [
        [1, 2],
        [2, 3],
      ],
    },
    message: 'Each card can be used only one time!',
  },
  {
    name: 'too few cards to complete the board',
    input: { deathCards: Array.from({ length: 46 }, (_, i) => i + 3) },
    message: 'Not enough cards are left in the deck to complete the board!',
  },
];

for (const { name, input, message } of invalidInputs) {
  test(`calculate(): rejects ${name}`, async () => {
    // Given
    const { players, communityCards, deathCards } = { ...validInput, ...input };

    // When
    const result = addon.calculate(players, communityCards, deathCards);

    // Then
    await assert.rejects(result, new TypeError(message));
  });
}

test('calculate(): works in a worker thread', async () => {
  // Given: a worker thread that loads the addon and calculates a board
  const players = [
    [50, 51],
    [45, 48],
  ];
  const communityCards = [1, 2, 3];
  const code = `
    const { parentPort, workerData } = require('node:worker_threads');
    const addon = require(workerData.addonPath);
    addon.initLookUpTable()
      .then(() => addon.calculate(workerData.players, workerData.communityCards, []))
      .then((result) => parentPort.postMessage(result));
  `;
  const addonPath = fileURLToPath(new URL('../index.js', import.meta.url));

  // When
  const worker = new Worker(code, {
    eval: true,
    workerData: { addonPath, players, communityCards },
  });
  const result = await new Promise((resolve, reject) => {
    worker.once('message', resolve).once('error', reject);
  });
  await worker.terminate();

  // Then: the result is the same as in the main thread
  assert.deepStrictEqual(result, await addon.calculate(players, communityCards, []));
});
