import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import ComputeHandController, {
  type IComputeHandResponse,
} from './controllers/ComputeHandController.ts';
import ComputeHandHandler from './handlers/ComputeHandHandler.ts';
import ErrorHandler from './handlers/ErrorHandler.ts';
import LoggerHandler from './handlers/LoggerHandler.ts';
import CacheInMemory from './helpers/CacheInMemory.ts';
import { CACHE_TTL_IN_MS } from './constant.ts';
import { CORS_ORIGIN, STATIC_DIRECTORY } from './config.ts';
import { initLookUpTable } from '@poker-master-tool/addon';

class App {
  express: express.Application;

  private computeHandHandler: ComputeHandHandler;

  private loggerHandler: LoggerHandler;

  constructor() {
    this.express = express();
    this.express.use(express.json());
    this.express.use(express.static(STATIC_DIRECTORY));

    this.express.use(helmet());

    if (CORS_ORIGIN !== undefined) {
      this.express.use(cors({ origin: CORS_ORIGIN }));
    }

    this.loggerHandler = new LoggerHandler();
    this.express.use(this.loggerHandler.handle);

    const cacheInMemory: CacheInMemory<string, IComputeHandResponse> = new CacheInMemory(
      CACHE_TTL_IN_MS,
    );

    const computeHandController = new ComputeHandController(cacheInMemory);
    this.computeHandHandler = new ComputeHandHandler(computeHandController);

    this.express.get('/compute', this.computeHandHandler.validate, this.computeHandHandler.handle);

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
