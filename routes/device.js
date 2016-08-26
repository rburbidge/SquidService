var express = require('express'),
    https = require('https'),
    googleAuth = require('../auth/google-auth.js'),
    google = require('../services/google.js');


var userToDevices = {
    '117425397445642876019': [ 'some', 'user', 'specific', 'contendt' ]
};

module.exports = function(app) {
    var router =  express.Router();
    app.use('/api/devices', router);

    router.route('/')
        .get(googleAuth.googleAuthZ, function(req, res) {
            if(userToDevices[req.user.id]) {
                res.status(200).send(userToDevices[req.user.id]);
            } else {
                res.status(404).send('User not found');
            }
        })
        .post(googleAuth.googleAuthZ, function(req, res) {
            // TODO impl this
        });

    router.route('/commands')
        .post(googleAuth.googleAuthZ, function(req, res) {
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
};