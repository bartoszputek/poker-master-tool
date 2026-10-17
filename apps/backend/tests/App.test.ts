import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { before, test } from 'node:test';
import request from 'supertest';
import App from '../src/App.ts';
import { STATIC_DIRECTORY } from '../src/config.ts';
import { SECONDS_IN_HOUR, SECONDS_IN_YEAR } from '../src/constant.ts';
import type express from 'express';
import type { ISerializedBoard, ISerializedPlayer } from '../src/interfaces.ts';
import { getExampleResults } from './_utils/Utils.ts';

interface ITestContext {
  app: express.Application;
}

let context: ITestContext;

before(async () => {
  const app = new App();

  await app.initData();

  const expressApp: express.Application = app.express;

  context = {
    app: expressApp,
  };
});

test('GET:/compute: should return response', async () => {
  const { app } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['2c', '4h'],
    },
    {
      cards: ['2d', '4s'],
    },
    {
      cards: ['2h', '5c'],
    },
    {
      cards: ['3d', '5s'],
    },
    {
      cards: ['3h', '6c'],
    },
    {
      cards: ['4c', '6h'],
    },
  ];

  const board: ISerializedBoard = {
    players,
    communityCards: ['7c'],
    deathCards: ['7d'],
  };

  const encodedBoard: string = Buffer.from(JSON.stringify(board)).toString('base64');

  const response = await request(app).get('/compute').query(`board=${encodedBoard}`);

  assert.strictEqual(response.statusCode, 200);
  assert.partialDeepStrictEqual(response.body, getExampleResults());
});

test('GET:/: should not cache keep the app entry point', async () => {
  const { app } = context;

  const response = await request(app).get('/');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.headers['cache-control'], 'no-cache');
});

test('GET:/_app/immutable: should cache the hashed files for one year', async () => {
  const { app } = context;

  const [fileName] = readdirSync(path.join(STATIC_DIRECTORY, '_app', 'immutable', 'entry'));
  const response = await request(app).get(`/_app/immutable/entry/${fileName}`);

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(
    response.headers['cache-control'],
    `public, max-age=${SECONDS_IN_YEAR}, immutable`,
  );
});

test('GET:/_app/version.json: should cache the files without a hash for one hour', async () => {
  const { app } = context;

  const response = await request(app).get('/_app/version.json');

  assert.strictEqual(response.statusCode, 200);
  assert.strictEqual(response.headers['cache-control'], `public, max-age=${SECONDS_IN_HOUR}`);
});
