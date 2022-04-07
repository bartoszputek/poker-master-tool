import express from 'express';
import cors from 'cors';

import ComputeHandController, { IComputeHandResponse } from 'controllers/ComputeHandController';
import ComputeHandHandler from 'handlers/ComputeHandHandler';
import ErrorHandler from 'handlers/ErrorHandler';
import LoggerHandler from 'handlers/LoggerHandler';
import CacheInMemory from 'helpers/CacheInMemory';
import { CACHE_TTL_IN_MS, FRONTEND_DEV_SERVER_URL } from 'constant';
import { initLookUpTable } from '../addon/addon';

class App {
  express: express.Application;

  private computeHandHandler: ComputeHandHandler;

  private loggerHandler: LoggerHandler;

  constructor() {
    this.express = express();
    this.express.use(express.json());
    this.express.use(express.static('public'));

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
      this.express.use(cors({
        origin: FRONTEND_DEV_SERVER_URL,
      }));
    }

    this.loggerHandler = new LoggerHandler();
    this.express.use(this.loggerHandler.handle);

    const cacheInMemory: CacheInMemory<string, IComputeHandResponse> = new CacheInMemory(CACHE_TTL_IN_MS);

    const computeHandController = new ComputeHandController(cacheInMemory);
    this.computeHandHandler = new ComputeHandHandler(computeHandController);

    this.express.post('/', this.computeHandHandler.validate, this.computeHandHandler.handle);

    const errorHandler = new ErrorHandler();

    this.express.use(errorHandler.handle);
  }

  public async initData() {
    await initLookUpTable();
  }

  public listen(port: number) {
    this.express.listen(port);

    // eslint-disable-next-line no-console
    console.log(`App is listening on http://localhost:${port}`);
  }
}

export default App;
