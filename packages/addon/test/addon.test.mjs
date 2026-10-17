import assert from 'node:assert/strict';
import { before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import addon from '../index.js';
import golden from './golden.json' with { type: 'json' };

before(() => addon.initLookUpTable());

test('initLookUpTable(): resolves again without a new read of the table', async () => {
  await Promise.all([addon.initLookUpTable(), addon.calculate([[1, 2]], [3, 4, 5], [])]);
});

for (const { name, players, community, death, expected } of golden) {
  test(`calculate(): ${name}`, async () => {
    assert.deepStrictEqual(await addon.calculate(players, community, death), expected);
  });
}

const throwingCard = {
  valueOf() {
    throw new Error('valueOf() was called');
  },
};
const duplicatedCards = [
  [1, 2],
  [2, 3],
];

const invalidInputs = [
  ['players that are not an array', [{}, [], []], 'The argument playersCards should be an array!'],
  ['no players', [[], [], []], 'Minimum length of players array is 1!'],
  [
    'more than 9 players',
    [Array.from({ length: 10 }, (_, i) => [i + 1, i + 11]), [], []],
    'Maximum length of players array is 9!',
  ],
  ['a player with three cards', [[[1, 2, 3]], [], []], 'Player should have two cards!'],
  ['a player that is a string', [['ab'], [], []], 'Player should have two cards!'],
  [
    'community cards that are not an array',
    [[[1, 2]], 3, []],
    'The argument communityCards should be an array!',
  ],
  [
    'more than 5 community cards',
    [[[1, 2]], [3, 4, 5, 6, 7, 8], []],
    'Maximum length of communityCards array is 5!',
  ],
  [
    'death cards that are not an array',
    [[[1, 2]], [], 1],
    'The argument deathCards should be an array!',
  ],
  ['card 0', [[[0, 2]], [], []], 'Card should be an integer from 1 to 52!'],
  ['card 53', [[[1, 2]], [53], []], 'Card should be an integer from 1 to 52!'],
  [
    'a card that is not an integer',
    [[[1, 2.5]], [], []],
    'Card should be an integer from 1 to 52!',
  ],
  ['a card that is a string', [[[1, 2]], [], ['3']], 'Card should be an integer from 1 to 52!'],
  [
    'a card with a valueOf() that throws',
    [[[1, throwingCard]], [], []],
    'Card should be an integer from 1 to 52!',
  ],
  ['a duplicated card', [duplicatedCards, [], []], 'Each card can be used only one time!'],
  [
    'too few cards to complete the board',
    [[[1, 2]], [], Array.from({ length: 46 }, (_, i) => i + 3)],
    'Not enough cards are left in the deck to complete the board!',
  ],
];

for (const [name, args, message] of invalidInputs) {
  test(`calculate(): rejects ${name}`, async () => {
    await assert.rejects(addon.calculate(...args), new TypeError(message));
  });
}

test('calculate(): works in a worker thread', async () => {
  const players = [
    [50, 51],
    [45, 48],
  ];
  const code = `
    const { parentPort, workerData } = require('node:worker_threads');
    const addon = require(workerData.addonPath);
    addon.initLookUpTable()
      .then(() => addon.calculate(workerData.players, [1, 2, 3], []))
      .then((result) => parentPort.postMessage(result));
  `;
  const addonPath = fileURLToPath(new URL('../index.js', import.meta.url));
  const worker = new Worker(code, { eval: true, workerData: { addonPath, players } });
  const result = await new Promise((resolve, reject) => {
    worker.once('message', resolve).once('error', reject);
  });
  await worker.terminate();

  assert.deepStrictEqual(result, await addon.calculate(players, [1, 2, 3], []));
});
