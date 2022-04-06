import { ErrorRequestHandler, RequestHandler } from 'express';

export interface IHandler{
  handle: RequestHandler | ErrorRequestHandler;
}

export interface IController<Arguments, Response>{
  execute(arg:Arguments): Response
}

export interface IValidator{
  validate(arg:unknown): boolean
}

export type LoggerMessage = Record<string, unknown> | string;

export interface ILogger {
  fatal(message:LoggerMessage):void,
  error(message:LoggerMessage):void,
  warn(message:LoggerMessage):void,
  info(message:LoggerMessage):void,
  debug(message:LoggerMessage):void,
  trace(message:LoggerMessage):void,
  timeInfo(message:LoggerMessage):void
}

export interface ICache<K, V> {
  get(key: K): V | undefined,
  set(key: K, value: V): void
}

export interface ISerializedBoard {
  players: ISerializedPlayer[],
  communityCards: string[],
  deathCards: string[],
}

export interface ISerializedPlayer {
  cards: string[],
}
