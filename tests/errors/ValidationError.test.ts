import ApplicationError from 'errors/ApplicationError';
import ValidationError from 'errors/ValidationError';

test('constructor(): should create an instance of error with proper message and status code', async () => {
  const message: string = 'example message';
  const data = {
    cards: ['Td', 'As'],
  };

  const error = new ValidationError(message, data);

  expect(error).toBeInstanceOf(ApplicationError);
  expect(error).toBeInstanceOf(ValidationError);
  expect(error.message).toBe(message);
  expect(error.statusCode).toBe(400);
  expect(error.data).toBe(data);
});
