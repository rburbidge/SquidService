var express = require('express'),
    https = require('https'),
    google = require('../services/google.js');

module.exports = function(app) {
    var router =  express.Router();
    app.use('/api/devices', router);

    router.route('/commands')
        .post(function(req, res) {
            var token = req.get('Authorization');
            if(!token) {
                res.status(401).send('Authorization header must be sent with Google token');
                return;
            }

            google.isValidToken(token, function(isValid) {
                if(!isValid) {
                    res.status(401).send('Google token was invalid')
                    return;
                }

                // TODO Do not hardcode device registration token
                console.log(req.body.url);
                google.sendGcmMessage(
                    {
                        "type": "url",
                        "data": req.body.url,
                    },
                    "cHhSZYxMG-0:APA91bFwvxYTXS8LYLPP1JKBMvjuUKcQJoMqfopxMSDd40FXQBZoZ0dYl-DA7b5Nqi-UI4Bef8q8WoPcMG3YRkE99EDxlk8R-ilkg9uOvmXw2nLL7KYU6faSxVn_-3oj8cgs2LgI5n1v",
                    function(success) {
                        res.status(success ? 200 : 500).end();
                    });
            });
        });
};