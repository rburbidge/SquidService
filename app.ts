/**
 * Connects to the database, sets up server dependencies, and starts the server.
 */

import { createServer } from './server';
import { Config, validateConfig } from './config/config';
import { Google } from './services/google'

const config = require('config');
import * as mongodb from 'mongodb';
import * as winston from 'winston';

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

mongodb.MongoClient.connect(serverConfig.database.url)
    .then((mongoClient: mongodb.MongoClient) => {
        winston.info('Connected to MongoDB');
        return createServer({
            config: serverConfig,
            db: mongoClient.db('prod'),
            google: new Google(serverConfig.googleApiKey, serverConfig.googleValidClientIds)
        });
    })
    .catch(error => {
        throw 'Error while connecting to MongoDB: ' + error;
    });