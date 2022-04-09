import request from 'supertest';
import App from 'App';
import express from 'express';
import { ISerializedBoard, ISerializedPlayer } from 'interfaces';

interface ITestContext {
  app: express.Application
}

let context: ITestContext;

beforeAll(() => {
  const app: express.Application = new App().express;

  context = {
    app,
  };
});

test.skip('should return response', async () => {
  const { app } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['Td', 'As'],
    },
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const board: ISerializedBoard = {
    players,
    communityCards: ['Ts', 'Ad', 'Qc', '2c', '3c'],
    deathCards: ['5d'],
  };

  const response = await request(app).post('/').send({ board });

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ response: '' });
});

test.skip('should return response', async () => {
  const { app } = context;

  const players: ISerializedPlayer[] = [
    {
      cards: ['Td', 'As'],
    },
    {
      cards: ['Kh', 'Qh'],
    },
  ];

  const board: ISerializedBoard = {
    players,
    communityCards: [],
    deathCards: [],
  };

  const response = await request(app).post('/').send({ board });

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ response: '' });
});
