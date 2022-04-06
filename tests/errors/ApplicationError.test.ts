import ApplicationError from 'errors/ApplicationError';

test('constructor(): should create an instance of error with proper message and status code', async () => {
  const message: string = 'example message';
  const statusCode: number = 402;
  const data = {
    cards: ['Td', 'As'],
  };

  const error = new ApplicationError(message, statusCode, data);

  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(ApplicationError);
  expect(error.message).toBe(message);
  expect(error.statusCode).toBe(402);
  expect(error.data).toBe(data);
});
