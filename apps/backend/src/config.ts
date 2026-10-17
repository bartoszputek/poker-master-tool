import path from 'node:path';

function readBoolean(name: string): boolean {
  const value: string | undefined = process.env[name];

  if (value === undefined || value === 'false') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  throw new Error(`${name} must be "true" or "false", received "${value}"`);
}

export type LogFormat = 'json' | 'pretty';

function readLogFormat(): LogFormat {
  const value: string = process.env.LOG_FORMAT ?? 'json';

  if (value === 'json' || value === 'pretty') {
    return value;
  }

  throw new Error(`LOG_FORMAT must be "json" or "pretty", received "${value}"`);
}

export const LOG_FORMAT: LogFormat = readLogFormat();
export const LOG_TO_FILE: boolean = readBoolean('LOG_TO_FILE');
// The CORS middleware is off when this value is not set.
export const CORS_ORIGIN: string | undefined = process.env.CORS_ORIGIN;
// The static build of the frontend. The default works for both src and dist.
export const STATIC_DIRECTORY: string =
  process.env.STATIC_DIRECTORY ?? path.resolve(import.meta.dirname, '../../frontend/build');
