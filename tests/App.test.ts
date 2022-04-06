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
  };

  const response = await request(app).post('/').send({ board });

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ response: 'eska34,52,41,1,5' });
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
  };

  const response = await request(app).post('/').send({ board });

  expect(response.statusCode).toBe(200);
  expect(response.body).toMatchObject({ response: 'eska34,52,41,1,5' });
});
