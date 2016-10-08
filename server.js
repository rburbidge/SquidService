var bodyParser = require('body-parser'),
    express = require('express');

var app = express();

// Logging middleware
app.use('/*', function(req, res, next) {
    var operation = req.method + ' ' + req.baseUrl;
    console.log('Begin ' + operation);
    
    function after() {
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

require('./routes/device.js')(app);

app.listen(process.env.PORT || 3000);

module.exports = app;