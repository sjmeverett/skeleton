
import express from 'express';
import moment from 'moment';
import pkg from './package.json';
import rc from 'rc-yaml';
import SereneExpress from 'serene-express';
import winston from 'winston';

export const appName = pkg.name.replace(/[^a-zA-Z0-9]+/g, '');

// get application options
export const config = rc(appName, {
  port: 3000,
  static: './dist',
  baseUrl: 'http://localhost:3000'
});

// set up logger
winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  level: process.env.NODE_ENV == 'production' ? 'info' : 'silly',
  colorize: true,
  timestamp: () => moment().format('YYYY-MM-DD HH:mm:ss.SSS')
});

winston.debug('debug mode');

// set up app
export const app = express();
app.use('/', express.static(config.static));
app.use(new SereneExpress(require('./resources').service));


// start, stop, signals
export var server;

export function start() {
  server = app.listen(config.port);
  winston.info('listening on %d', config.port);

  process.on('SIGINT', function () {
    winston.info('caught SIGINT');
    stop();
  });

  process.on('SIGTERM', function () {
    winston.info('caught SIGTERM');
    stop();
  });
};

export function stop() {
  winston.info('shutting down');
  server && server.close();
  process.exit();
};
