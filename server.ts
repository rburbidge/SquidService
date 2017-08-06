import IConfig from './config/config';
import Devices from './data/devices';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import devicesRouter from './routes/devices';
import requestLogger from './logging/request-logger';
import * as mongodb from 'mongodb';
var validator = require('express-validator');
var config = require('config');

let serverConfig = config.get('server') as IConfig;

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
    app.use(requestLogger);
    app.get('/', (req, res) => {
        res.writeHead(200);
        res.end('Hello Server2');
    });
    app.use('/api/devices', devicesRouter(devices));

    let port: number = process.env.PORT || serverConfig.defaultPort;
    app.listen(port);
    console.log('Server listening on port ' + port);
}