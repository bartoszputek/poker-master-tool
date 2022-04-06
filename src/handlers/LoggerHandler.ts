import {
  RequestHandler, Request, Response, NextFunction,
} from 'express';

import Logger from 'helpers/Logger';
import { IHandler } from 'interfaces';

export default class LoggerHandler implements IHandler {
  public handle: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    res.locals.logger = new Logger();

    const { logger } = res.locals;

    logger.timeInfo({
      message: 'HTTP request is handled',
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      headers: req.headers,
    });

    next();
  };
}
