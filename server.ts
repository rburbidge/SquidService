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

const validator = require('express-validator');
const config = require('config');

export function createServer(): Promise<http.Server> {
    // Start the server and log any errors that occur
    try {
        return startServer()
            .catch(error => {
                console.log(`ERROR: Server could not be started: ${error}`);
                return null;
            });
    } catch(error) {
        console.log(`ERROR: Server could not be started: ${error}`);
    }
}

function startServer(): Promise<http.Server> {
    // Configuration is retrieved from <process.env.NODE_ENV>.json, so make sure that this is defined before proceeding
    if(!process.env.NODE_ENV) throw 'Environment variable NODE_ENV is undefined. Define this and a matching config file\ne.g. NODE_ENV=foo and config file ./config/foo.json';
    const configFileName = `${process.env.NODE_ENV}.json`;

    // Retrieve and validate the config
    const serverConfig = config.get('server') as Config;
    try {
        validateConfig(serverConfig);
    } catch(error) {
        throw `${configFileName} validation failed.\n\nERROR: ${error}.\n\nDid you fill in your config AND set the NODE_ENV environment variable?`
    }

    // Connect to the database and start the server
    const mongoClient: mongodb.MongoClient = mongodb.MongoClient;
    return mongoClient.connect(serverConfig.database.url)
        .then((db: mongodb.Db) => {
            console.log('Connected to MongoDB');
            return onDbConnected(db, serverConfig);
        })
        .catch(error => {
            throw 'Error while connecting to MongoDB: ' + error;
        });
}

function onDbConnected(db: mongodb.Db, serverConfig: Config): http.Server {
    // Create dependencies
    const devicesDb: mongodb.Collection = db.collection('userDevices');
    const devices: Devices = new Devices(devicesDb);
    const google: Google = new Google(serverConfig.googleApiKey, serverConfig.googleValidClientIds);

    // Bootstrap server and pipeline
    const app: express.Application = express();
    app.use(bodyParser.json());
    app.use(validator());
    app.use(logger);

    // Routers
    app.use('', indexRouter());
    app.use('/api/devices', devicesRouter(devices, google));

    const port: number = process.env.PORT || serverConfig.defaultPort;
    console.log('Server listening on port ' + port);

    return app.listen(port);
}