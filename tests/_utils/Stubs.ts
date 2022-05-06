import { ICache, ILogger } from 'interfaces';

export function createLoggerStub(): ILogger {
  return {
    fatal: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
    timeInfo: jest.fn(),
  };
}

export function createCacheStub<K, V>(): jest.Mocked<ICache<K, V>> {
  return {
    get: jest.fn(),
    set: jest.fn(),
  };
}
