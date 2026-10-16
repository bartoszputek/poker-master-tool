import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import CacheInMemory from 'helpers/CacheInMemory';

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

  assert.strictEqual(value, data);
});

test('get(): should return undefined when value is not set', async () => {
  const { cacheInMemory, key } = context;

  const value: Record<string, unknown> | undefined = cacheInMemory.get(key);

  assert.strictEqual(value, undefined);
});

test('get(): should expire data after elapsed time', async (t) => {
  const { data } = context;

  const key1: string = 'key1';
  const key2: string = 'key2';

  t.mock.timers.enable({ apis: ['Date'], now: new Date('2010-03-10 12:30') });

  const ttlInMs: number = 1000 * 60 * 5;
  const cacheInMemory = new CacheInMemory<string, Record<string, unknown>>(ttlInMs);

  cacheInMemory.set(key1, data);

  t.mock.timers.setTime(new Date('2010-03-10 12:32').getTime());

  cacheInMemory.set(key2, data);

  t.mock.timers.setTime(new Date('2010-03-10 12:36').getTime());

  const value1: Record<string, unknown> | undefined = cacheInMemory.get(key1);
  const value2: Record<string, unknown> | undefined = cacheInMemory.get(key2);
  const value11: Record<string, unknown> | undefined = cacheInMemory.get(key1);
  const value22: Record<string, unknown> | undefined = cacheInMemory.get(key2);

  assert.strictEqual(value1, data);
  assert.strictEqual(value2, data);
  assert.strictEqual(value11, undefined);
  assert.strictEqual(value22, data);
});
