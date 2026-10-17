import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import { LOG_FORMAT, LOG_TO_FILE } from '../config.ts';

function createTransport(name: string): winston.transport {
  return new winston.transports.DailyRotateFile({
    filename: `logs/${name}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '5m',
    maxFiles: '14d',
  });
}

function createErrorTransport(): winston.transport {
  const transport: winston.transport = createTransport('error');
  transport.level = 'error';

  return transport;
}

const logLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
  },
  colors: {
    fatal: 'bold red',
    error: 'bold red',
    warn: 'bold yellow',
    info: 'bold blue',
    debug: 'bold magenta',
    trace: 'bold gray',
  },
};

winston.addColors(logLevels.colors);

function createConsoleTransport(): winston.transport {
  return new winston.transports.Console({
    stderrLevels: ['fatal', 'error'],
    handleExceptions: true,
    handleRejections: true,
    format:
      LOG_FORMAT === 'pretty'
        ? format.combine(
            format.colorize(),
            format.printf((info) => {
              const { timestamp, level, ...content } = info;
              return `${level} ${timestamp}: ${JSON.stringify(content, null, 4)}`;
            }),
          )
        : undefined,
  });
}

const winstonLogger = winston.createLogger({
  level: 'trace',
  levels: logLevels.levels,
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      const { timestamp, level, ...content } = info;
      return JSON.stringify({ timestamp, level, ...content });
    }),
  ),
  transports: [createConsoleTransport()],
});

if (LOG_TO_FILE) {
  winstonLogger.add(createTransport('logs'));
  winstonLogger.add(createErrorTransport());
  winstonLogger.exceptions.handle(createTransport('exceptions'));
  winstonLogger.rejections.handle(createTransport('rejections'));
}

export default winstonLogger;
