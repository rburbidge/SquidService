import Config from './config/config'
import Devices from './data/devices';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import devicesRouter from './routes/devices';
import requestLogger from './logging/request-logger';
import * as mongodb from 'mongodb';
var validator = require('express-validator');

let config: Config = new Config;
let mongoClient: mongodb.MongoClient = mongodb.MongoClient;

mongoClient.connect(config.dbUri, (err, db) => {
    if(err) {
        console.log('Error while connecting to MongoDB: ' + err);
    } else {
        console.log('Connected to MongoDB');
        init(db);
    }
});

function init(db: mongodb.Db) {
    let devicesDb: mongodb.Collection = db.collection('userDevices');
    let devices: Devices = new Devices(devicesDb);

    let app: express.Application = express();
    app.use(bodyParser.json());
    app.use(validator());
    app.use(requestLogger);
    app.get('/', (req, res) => {
        res.writeHead(200);
        res.end('Hello Server');
    });
    app.use('/api/devices', devicesRouter(devices));

    let port: number = process.env.PORT || 3000;
    app.listen(port);
    console.log('Server listening on port ' + port);
}