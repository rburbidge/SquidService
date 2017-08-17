import { Config}  from './config/config';
import { Devices } from './data/devices';
import { devicesRouter } from './routes/devices';
import { indexRouter}  from './routes/index';
import { logger } from './logging/request-logger';

import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as mongodb from 'mongodb';

var validator = require('express-validator');
var config = require('config');

let serverConfig = config.get('server') as Config;

let mongoClient: mongodb.MongoClient = mongodb.MongoClient;
mongoClient.connect(serverConfig.database.url, (err, db) => {
    if(err) {
        console.log('Error while connecting to MongoDB: ' + err);
    } else {
        console.log('Connected to MongoDB');
        onDbConnected(db);
    }
});

function onDbConnected(db: mongodb.Db) {
    let devicesDb: mongodb.Collection = db.collection('userDevices');
    let devices: Devices = new Devices(devicesDb);

    let app: express.Application = express();
    app.use(bodyParser.json());
    app.use(validator());
    app.use(logger);

    // Routers
    app.use('', indexRouter());
    app.use('/api/devices', devicesRouter(devices));

    let port: number = process.env.PORT || serverConfig.defaultPort;
    app.listen(port);
    console.log('Server listening on port ' + port);
}