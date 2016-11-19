var bodyParser = require('body-parser'),
    express = require('express'),
    validator = require('express-validator');

var app = express();

// Logging middleware
app.use('/*', function(req, res, next) {
    var operation = req.method + ' ' + req.baseUrl;
    console.log('Begin ' + operation);
    
    // Collect the response body as a string
    var superWrite = res.write,
        superEnd = res.end;
    var body;   
    var chunks = [];
    res.write = function (chunk) {
        chunks.push(new Buffer(chunk));
        superWrite.apply(res, arguments);
    };
    res.end = function (chunk) {
        if(chunk) {
            chunks.push(new Buffer(chunk));
        }
        body = Buffer.concat(chunks).toString('utf8');
        superEnd.apply(res, arguments);
    };

    // Log the request method, path, status code
    function after() {
        if(chunks.length > 0 && res.statusCode >= 400 && res.statusCode <= 500) {
            console.warn('Error: response body=' + body);
        }
        console.log('End ' + operation + ' ' + res.statusCode);
        console.log('\n');
    }
    res.on('finish', after);
    res.on('close', after);
    next();
});

app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('Sir Nommington');
});

app.use(bodyParser.json());
app.use(validator());

require('./routes/device.js')(app);

app.listen(process.env.PORT || 3000);

module.exports = app;