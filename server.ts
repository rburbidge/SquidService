import { Config, validateConfig }  from './config/config';
import { Devices } from './data/devices';
import { Google } from './services/google'
import { devicesRouter } from './routes/devices';
import { indexRouter}  from './routes/index';
import { logger } from './logging/request-logger';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as mongodb from 'mongodb';
import * as winston from 'winston';

const validator = require('express-validator');

export interface ServerOptions {
    config: Config;
    db: mongodb.Db;
    google: Google;
}

export function createServer(options: ServerOptions): http.Server {
    winston.info('Starting server');
    // Start the server and log any errors that occur
    try {
        return startServer(options);
    } catch(error) {
        winston.error(`Server could not be started: ${error}`);
        return null;
    }
}

function configureLogging(): void {
    // Conditionally enable logging during test execution
    const loggingTransports: winston.TransportInstance[] = [];
    if(process.env.LOGGING) {
        loggingTransports.push(new winston.transports.Console({
            colorize: true,
            timestamp: true
        }));
    }

    // Configure logging
    winston.configure({
        level: 'silly',
        transports: loggingTransports
    });
}

function startServer(options: ServerOptions): http.Server {
    configureLogging();

    // Create dependencies
    const devicesDb: mongodb.Collection = options.db.collection('userDevices');
    const devices: Devices = new Devices(devicesDb);

    // Bootstrap server and pipeline
    const app: express.Application = express();
    app.use(bodyParser.json());
    app.use(validator());
    app.use(logger);

    // Routers
    app.use('', indexRouter());
    app.use('/api/devices', devicesRouter(devices, options.google));

    const port: number = process.env.PORT || options.config.defaultPort;
    winston.info('Server listening on port ' + port);

    return app.listen(port);
}