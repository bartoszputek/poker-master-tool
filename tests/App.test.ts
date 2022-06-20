import request from 'supertest';
import App from 'App';
import express from 'express';
import { ISerializedBoard, ISerializedPlayer } from 'interfaces';
import { getExampleResults } from './_utils/Utils';

interface ITestContext {
  app: express.Application
}

let context: ITestContext;

beforeAll(async () => {
  const app = new App();

  await app.initData();

  const expressApp: express.Application = app.express;

  context = {
    app: expressApp,
  };
});

test('should return response', async () => {
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

  const response = await request(app).post('/').send({ board });

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject(getExampleResults());
});
