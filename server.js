var express = require('express')

var app = express();
app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('Sir Nommington');
});
app.listen(process.env.PORT || 3000);