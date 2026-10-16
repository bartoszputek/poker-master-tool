import { mock, Mock } from 'node:test';
import { ICache, ILogger } from '../../src/interfaces';

export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? Mock<T[K]> : T[K];
};

export function createLoggerStub(): Mocked<ILogger> {
  return {
    fatal: mock.fn(),
    error: mock.fn(),
    warn: mock.fn(),
    info: mock.fn(),
    debug: mock.fn(),
    trace: mock.fn(),
    timeInfo: mock.fn(),
  };
}

export function createCacheStub<K, V>(): Mocked<ICache<K, V>> {
  return {
    get: mock.fn<ICache<K, V>['get']>(),
    set: mock.fn<ICache<K, V>['set']>(),
  };
}
