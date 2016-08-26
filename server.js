var bodyParser = require('body-parser'),
    express = require('express');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('Sir Nommington');
});

require('./routes/device.js')(app);

app.listen(process.env.PORT || 3000);