var bodyParser = require('body-parser'),
    express = require('express');

var app = express();
app.use(bodyParser.json());

// Logging middleware
app.use('/*', function(req, res, next) {
    var operation = req.method + ' ' + req.baseUrl;
    console.log('Begin ' + operation);
    
    function after() {
        console.log('End ' + operation + '\n');
    }
    res.on('finish', after);
    res.on('close', after);
    next();
});

app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('Sir Nommington');
});

require('./routes/device.js')(app);

app.listen(process.env.PORT || 3000);

module.exports = app;