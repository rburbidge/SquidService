import * as express from 'express';
import * as bodyParser from 'body-parser';
import devicesRouter from './routes/devices';
var validator = require('express-validator');

let app: express.Application = express();

// Logging middleware
app.use('/*', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let operation: string = req.method + ' ' + req.baseUrl;
    console.log('Begin ' + operation);

    // Log the request method, path, status code
    let after: Function = () => {
        console.log('End ' + operation + ' ' + res.statusCode);
        console.log('\n');
    };
    res.on('finish', after);
    res.on('close', after);
    next();
});

app.get('/', (req, res) => {
    res.writeHead(200);
    res.end('Hello Server');
});

app.use(bodyParser.json());
app.use(validator());

app.use('/api/devices', devicesRouter());

let port: number = process.env.PORT || 3000;
app.listen(port);
console.log('Server listening on port ' + port);