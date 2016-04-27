var http = require('http');
var server = http.createServer(function(req, res) {
		res.writeHead(200, { 'content-type' : 'application/json' });
		res.write('hello\n');
		res.end();
});
server.listen(80);