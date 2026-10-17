import path from 'node:path';
import express, { type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import ComputeHandController, {
  type IComputeHandResponse,
} from './controllers/ComputeHandController.ts';
import ComputeHandHandler from './handlers/ComputeHandHandler.ts';
import ErrorHandler from './handlers/ErrorHandler.ts';
import LoggerHandler from './handlers/LoggerHandler.ts';
import CacheInMemory from './helpers/CacheInMemory.ts';
import { CACHE_TTL_IN_MS, SECONDS_IN_HOUR, SECONDS_IN_YEAR } from './constant.ts';
import { CORS_ORIGIN, STATIC_DIRECTORY } from './config.ts';
import { initLookUpTable } from '@poker-master-tool/addon';

// SvelteKit puts a content hash in the names of the files in "_app/immutable".
// Other files keep their names between deploys, so cache them for a short time only.
function setStaticCacheHeaders(res: Response, filePath: string): void {
  const relativePath: string = path.relative(STATIC_DIRECTORY, filePath);

  if (relativePath === 'index.html') {
    res.set('Cache-Control', 'no-cache');
    return;
  }

  if (relativePath.startsWith(path.join('_app', 'immutable') + path.sep)) {
    res.set('Cache-Control', `public, max-age=${SECONDS_IN_YEAR}, immutable`);
    return;
  }

  res.set('Cache-Control', `public, max-age=${SECONDS_IN_HOUR}`);
}

class App {
  express: express.Application;

  private computeHandHandler: ComputeHandHandler;

  private loggerHandler: LoggerHandler;

  constructor() {
    this.express = express();
    this.express.use(express.json());
    // The frontend sets its CSP in a <meta> tag, because only the build knows the hash
    // of the inline script. X-Frame-Options from helmet still blocks the framing of the page.
    this.express.use(helmet({ contentSecurityPolicy: false }));
    this.express.use(express.static(STATIC_DIRECTORY, { setHeaders: setStaticCacheHeaders }));

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
