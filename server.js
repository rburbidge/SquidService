var express = require('express'),
	https = require('https'),
	bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.writeHead(200);
    res.end('Sir Nommington');
});

var router =  express.Router();
app.use('/api', router);

router.route('/devices/:deviceId')
.post(function(req, res) {
	console.log(req.body.url);

	// Send GCM message to the device
	// TODO Do not hardcode registration token. Store in secure storage
	var postData = JSON.stringify({
		"data": {
    		"type": "url",
    		"data": req.body.url,
  		},
  		"to" : "eP9SKcIBJew:APA91bF4FE6Gwr8khtKEyHt_SrtgOiIl-gpzN_gMHPvA3Y2xEDTKfXvgrGn02TJKptw09TLKn3UfhEWojM3VouypndZtE5QXr0qW-c4wnCEPccUPrWR40ByDdEqU18PhKv6kvzXjZE6g"
	});

	// TODO Do not hardcode API key
	var options = {
		method: 'POST',
		host: 'gcm-http.googleapis.com',
		path: '/gcm/send',
		headers: {
			Authorization: 'key=AIzaSyC5NfTAr56W2v7hRpsRhO11PqcHODVcwOU',
			'Content-Type': 'application/json', 
			'Content-Length': postData.length
		}
	};
	
	var googleReq = https.request(options, function(resp) {
		var resultStatusCode;
		if(resp.statusCode === 200) {
			console.log('GCM message sent!');
			resultStatusCode = 200;
		} else {
			console.log('GCM message failed!');
			resultStatusCode = 500;
		}
		res.writeHead(resultStatusCode);
		res.end();
	});
	googleReq.write(postData);
	googleReq.end();
});

app.listen(process.env.PORT || 3000);