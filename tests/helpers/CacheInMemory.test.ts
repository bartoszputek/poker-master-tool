import CacheInMemory from 'helpers/CacheInMemory';
import MockDate from 'mockdate';

interface ITestContext {
  cacheInMemory: CacheInMemory<string, Record<string, unknown>>,
  key: string,
  data: Record<string, unknown>
}

let context: ITestContext;

beforeEach(() => {
  const ttlInMs: number = 1000 * 60 * 5;
  const cacheInMemory = new CacheInMemory<string, Record<string, unknown>>(ttlInMs);
  const key: string = 'key';
  const data: Record<string, unknown> = {
    a: 2,
    b: [
      'aaa',
      'bbb',
    ],
  };

  context = {
    cacheInMemory,
    key,
    data,
  };
});

test('get(): should return cached value', async () => {
  const { cacheInMemory, key, data } = context;

  cacheInMemory.set(key, data);

  const value: Record<string, unknown> | undefined = cacheInMemory.get(key);

  expect(value).toBe(data);
});

test('get(): should return undefined when value is not set', async () => {
  const { cacheInMemory, key } = context;

  const value: Record<string, unknown> | undefined = cacheInMemory.get(key);

  expect(value).toBe(undefined);
});

test('get(): should expire data after elapsed time', async () => {
  const { data } = context;

  const key1: string = 'key1';
  const key2: string = 'key2';

  MockDate.set(new Date('2010-03-10 12:30'));

  const ttlInMs: number = 1000 * 60 * 5;
  const cacheInMemory = new CacheInMemory<string, Record<string, unknown>>(ttlInMs);

  cacheInMemory.set(key1, data);

  MockDate.set(new Date('2010-03-10 12:32'));

  cacheInMemory.set(key2, data);

  MockDate.set(new Date('2010-03-10 12:36'));

  const value1: Record<string, unknown> | undefined = cacheInMemory.get(key1);
  const value2: Record<string, unknown> | undefined = cacheInMemory.get(key2);
  const value11: Record<string, unknown> | undefined = cacheInMemory.get(key1);
  const value22: Record<string, unknown> | undefined = cacheInMemory.get(key2);

  expect(value1).toBe(data);
  expect(value2).toBe(data);
  expect(value11).toBe(undefined);
  expect(value22).toBe(data);
});
