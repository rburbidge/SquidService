import { Config, validateConfig }  from './config/config';
import { Devices } from './data/devices';
import { Google } from './services/google'
import { devicesRouter } from './routes/devices';
import { indexRouter}  from './routes/index';
import { logger } from './logging/request-logger';
import { ITelemetry } from './logging/telemetry';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as exphbs  from 'express-handlebars';
import * as path from 'path';
import * as mongodb from 'mongodb';
import * as winston from 'winston';
import { squidIndexRouter } from './routes/squid';
import { Users } from './data/users';

const validator = require('express-validator');

export interface ServerOptions {
    config: Config;
    db: mongodb.Db;
    google: Google;
    telemetry: ITelemetry;
}

export function createServer(options: ServerOptions): http.Server {
    // Start the server and log any errors that occur
    try {
        return startServer(options);
    } catch(error) {
        winston.error(`Server could not be started: ${error}`);
        return null;
    }
}

function startServer(options: ServerOptions): http.Server {
    // Create dependencies
    const devicesDb: mongodb.Collection = options.db.collection('userDevices');
    const devices = new Devices(devicesDb);
    const usersDb: mongodb.Collection = options.db.collection('users');
    const users = new Users(usersDb);

    // Bootstrap server and pipeline
    const app: express.Application = express();

    setupViewEngine(app, options.config);

    app.use(bodyParser.json());
    app.use(validator());
    app.use(logger);

    // Routers
    app.use('', indexRouter());
    app.use('/api/devices', devicesRouter(users, devices, options.google, options.telemetry));
    app.use('/squid', squidIndexRouter());
    app.use('/public/squid', express.static('public/squid'));

    const port = process.env.PORT
        ? process.env.PORT
        : options.config.defaultPort;
    winston.info('Server listening on port ' + port);

    return app.listen(port);
}

/** Setup the view engine to use handlebars. */
function setupViewEngine(app: express.Application, config: Config): void {
    const hbs = exphbs(
        {
            extname: 'hbs',
            defaultLayout: 'layout',
            partialsDir: 'views/partials/'
        });
    app.engine('hbs', hbs);
    app.set('view engine', 'hbs');

    // App Insights key must be in all view models for app-insights.hbs partial
    // The value is injected into JS, so wrap in two quotes
    app.locals.insightsKey = '"' + config.insightsKey + '"';
}