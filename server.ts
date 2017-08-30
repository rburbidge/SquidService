import { Config}  from './config/config';
import { Devices } from './data/devices';
import { Google } from './services/google'
import { devicesRouter } from './routes/devices';
import { indexRouter}  from './routes/index';
import { logger } from './logging/request-logger';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongodb from 'mongodb';

const validator = require('express-validator');
const config = require('config');

const serverConfig = config.get('server') as Config;

const mongoClient: mongodb.MongoClient = mongodb.MongoClient;
mongoClient.connect(serverConfig.database.url, (err, db) => {
    if(err) {
        console.log('Error while connecting to MongoDB: ' + err);
    } else {
        console.log('Connected to MongoDB');
        onDbConnected(db);
    }
});

function onDbConnected(db: mongodb.Db) {
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
    app.listen(port);
    console.log('Server listening on port ' + port);
}