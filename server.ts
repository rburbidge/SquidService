import * as express from 'express';
import * as bodyParser from 'body-parser';
import devicesRouter from './routes/devices';
import requestLogger from './logging/request-logger';
var validator = require('express-validator');

let app: express.Application = express();
app.use(bodyParser.json());
app.use(validator());
app.use(requestLogger);
app.get('/', (req, res) => {
    res.writeHead(200);
    res.end('Hello Server');
});
app.use('/api/devices', devicesRouter());

let port: number = process.env.PORT || 3000;
app.listen(port);
console.log('Server listening on port ' + port);