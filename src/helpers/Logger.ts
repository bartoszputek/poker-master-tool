import { ILogger, LoggerMessage } from 'interfaces';
import winston from 'winston';
import { v4 as uuid } from 'uuid';
import Timer from 'helpers/Timer';

import winstonLogger from './WinstonLogger';

export default class Logger implements ILogger {
  private logger: winston.Logger;

  private timer?: Timer;

  constructor() {
    this.logger = winstonLogger.child({ traceId: uuid() });
  }

  public fatal(message:LoggerMessage):void {
    this.logger.log('fatal', message);
  }

  public error(message:LoggerMessage):void {
    this.logger.log('error', message);
  }

  public warn(message:LoggerMessage):void {
    this.logger.log('warn', message);
  }

  public info(message:LoggerMessage):void {
    this.logger.log('info', message);
  }

  public debug(message:LoggerMessage):void {
    this.logger.log('debug', message);
  }

  public trace(message:LoggerMessage):void {
    this.logger.log('trace', message);
  }

  public timeInfo(message:LoggerMessage):void {
    if (!this.timer) {
      this.timer = new Timer();

      this.info(message);

      return;
    }

    if (isString(message)) {
      this.info({
        responseTimeInMs: this.timer.stop(),
        message,
      });

      return;
    }

    this.info({
      responseTimeInMs: this.timer.stop(),
      ...message,
    });
  }
}

function isString(value: unknown): value is String {
  return typeof value === 'string' || value instanceof String;
}
