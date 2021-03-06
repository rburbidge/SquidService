/**
 * Connects to the database, sets up server dependencies, and starts the server.
 */

import { createServer } from './server';
import { Config, validateConfig } from './config/config';
import { Google } from './services/google';
import { AppInsights } from './services/app-insights';

const config = require('config');
import * as mongodb from 'mongodb';
import * as winston from 'winston';

// Configure logging
winston.configure({
    level: 'debug',
    transports: [
        new winston.transports.Console({
            colorize: true,
            timestamp: true
        })
    ]
});

// Configuration is retrieved from <process.env.NODE_ENV>.json, so make sure that this is defined before proceeding
if(!process.env.NODE_ENV) throw 'Environment variable NODE_ENV is undefined. Define this and a matching config file\ne.g. NODE_ENV=foo and config file ./config/foo.json';
const configFileName = `${process.env.NODE_ENV}.json`;

let serverConfig: Config;
try {
    serverConfig = config.get('server') as Config;
    validateConfig(serverConfig);
} catch(error) {
    throw `${configFileName} validation failed.\n\nERROR: ${error}.\n\nDid you fill in your config AND set the NODE_ENV environment variable?`
}

// Start app insights first so that it is properly integrated into other imported packages
const appInsights = require('applicationinsights');
appInsights.setup(serverConfig.insightsKey);
appInsights.start();
if(serverConfig.telemetryDisabled) {
    appInsights.defaultClient.config.disableAppInsights = true;
}

const mongoClient: mongodb.MongoClient = mongodb.MongoClient;
mongoClient.connect(serverConfig.database.url)
    .then((db: mongodb.Db) => {
        winston.info('Connected to MongoDB');
        winston.info(`Database name: ${serverConfig.database.name}`);

        return createServer({
            config: serverConfig,
            db: db.db(serverConfig.database.name),
            google: new Google(serverConfig.googleApiKey, serverConfig.googleValidClientIds),
            telemetry: new AppInsights(appInsights.defaultClient)
        });
    })
    .catch(error => {
        throw 'Error while connecting to MongoDB: ' + error;
    });