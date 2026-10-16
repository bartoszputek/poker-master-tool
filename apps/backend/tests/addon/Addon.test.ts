import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculate, initLookUpTable } from '@poker-master-tool/addon';
import { getExampleResults } from '../_utils/Utils.ts';

test('calculate(): should return a response', async () => {
  await initLookUpTable();

  const playerCards: number[][] = [
    [1, 11],
    [2, 12],
    [3, 13],
    [6, 16],
    [7, 17],
    [9, 19],
  ];

  const communityCards: number[] = [21];

  const deathCards: number[] = [22];

  const results = await calculate(playerCards, communityCards, deathCards);

  assert.deepStrictEqual(results, getExampleResults());
});

test('calculate(): should throw an error if there are more than 9 players', async () => {
  const playerCards: number[][] = [
    [1, 11],
    [2, 12],
    [3, 13],
    [4, 14],
    [5, 15],
    [6, 16],
    [7, 17],
    [8, 18],
    [9, 19],
    [10, 20],
  ];

  const testFunction = async () => calculate(playerCards, [], []);

  await assert.rejects(testFunction(), new Error('Maximum length of players array is 9!'));
});

test('calculate(): should throw an error if any player has more than 2 cards', async () => {
  const playerCards: number[][] = [
    [1, 11],
    [2, 12],
    [3, 13, 7],
    [4, 14],
    [5, 15],
    [6, 16],
    [7, 17],
    [8, 18],
    [9, 19],
  ];

  const testFunction = async () => calculate(playerCards, [], []);

  await assert.rejects(testFunction(), new Error('Player should have two cards!'));
});

test('calculate(): should throw an error if there is more than 5 community cards', async () => {
  const playerCards: number[][] = [
    [1, 11],
    [2, 12],
    [3, 13],
    [4, 14],
    [5, 15],
    [6, 16],
    [7, 17],
    [8, 18],
    [9, 19],
  ];

  const communityCards: number[] = [20, 21, 22, 23, 24, 25];

  const testFunction = async () => calculate(playerCards, communityCards, []);

  await assert.rejects(testFunction(), new Error('Maximum length of communityCards array is 5!'));
});

test('calculate(): should throw an error if deathCards parameter is not an array', async () => {
  const playerCards: number[][] = [
    [1, 11],
    [2, 12],
    [3, 13],
    [4, 14],
    [5, 15],
    [6, 16],
    [7, 17],
    [8, 18],
    [9, 19],
  ];

  const communityCards: number[] = [20, 21, 22, 23, 24];

  const deathCards: number = 1;

  const testFunction = async () =>
    calculate(playerCards, communityCards, deathCards as unknown as number[]);

  await assert.rejects(testFunction(), new Error('The argument deathCards should be an array!'));
});
