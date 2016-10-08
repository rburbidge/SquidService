var express = require('express'),
    https = require('https'),
    uuid = require('uuid'),
    devicesConverter = require('../models/devices-converter.js'),
    google = require('../services/google.js'),
    googleAuth = require('../auth/google-auth.js')(),
    User = require('../models/user.js');


var users = {
};

module.exports = function(app) {
    var devices =  express.Router();
    app.use('/api/devices', devices);

    devices.use(googleAuth);

    devices.route('')
        .get(function(req, res) {
            if(users[req.user.id]) {
                res.status(200).send(devicesConverter(users[req.user.id].devices));
            } else {
                res.status(404).send('User not found');
            }
        })
        .post(function(req, res) {
            console.log(req.body);

            var name = req.body.name;
            if(!name) {
                res.status(400).send('Must pass name');
                return;
            }

            var gcmToken = req.body.gcmToken;
            if(!gcmToken) {
                res.status(400).send('Must pass gcmToken');
                return;
            }

            // Create the user if they do not exist
            // If they do exist, then check if they own a device with the same GCM token already
            var deviceId;
            var user = users[req.user.id];
            if(!user) {
                console.log('Adding new user');
                user = { devices: {} };
                users[req.user.id] = user;
                console.log('New user added');
            } else {
                for(var currentDeviceId in user.devices) {
                    if(user.devices.hasOwnProperty(currentDeviceId)) {
                        if(user.devices[currentDeviceId].gcmToken === gcmToken) {
                            console.log('User ' + req.user.id + ' already has deviceId=' + currentDeviceId + ' with the same gcmToken');
                            deviceId = currentDeviceId;
                            break;
                        }
                    }
                }
            }

            // Add the device if it doesn't exist, and determine the response status
            var status;
            if(!deviceId) {
                // Add the device
                deviceId = uuid.v4();
                console.log('Adding new device with ID=' + deviceId);
                user.devices[deviceId] = {
                    gcmToken: gcmToken,
                    name: name
                };
                console.log('Added new deviceId=' + deviceId);

                status = 200;
            } else {
                status = 304;
            }
            
            res.status(status).send({ deviceId: deviceId });
        });

    devices.route('/:deviceId')
        .delete(function(req, res) {
            // If the user does not exist, then return
            var user = users[req.user.id];
            if(!user) {
                console.log('User does not exist');
                res.status(404).send();
                return;
            }

            // If the device is not registered, then return not modified
            if(! user.devices[req.params.deviceId]) {
                console.log('Device is not registered under this user');
                res.status(304).send();
                return;
            }

            // Remove the device
            delete user.devices[req.params.deviceId];
            console.log('Removed device');
            res.status(200).send();
        });

    devices.route('/:deviceId/commands')
        .post(function(req, res) {
            var deviceId = req.params.deviceId;
            if(!deviceId) {
                res.status(400).send('Must pass deviceId');
                return;
            }

            // If the user does not exist, then return
            var user = users[req.user.id];
            if(!user) {
                res.status(404).send('User does not exist');
                return;
            }

            var gcmToken = user.devices[deviceId].gcmToken;
            console.log('GCM token retrieved. gcmToken=' + gcmToken);
            if(!gcmToken) {
                res.status(404).send('Device does not exist');
            }
            
            google.sendGcmMessage(
                {
                    "type": "url",
                    "data": req.body.url,
                },
                gcmToken,
                function(success) {
                    res.status(success ? 200 : 500).end();
                });
        });
};