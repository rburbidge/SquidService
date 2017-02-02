module.exports = function(app) {
    var express = require('express'),
        https = require('https'),
        uuid = require('uuid'),
        devicesConverter = require('../models/devices-converter.js'),
        Error = require('../models/error.js'),
        google = require('../services/google.js'),
        googleAuth = require('../auth/google-auth.js')(),
        User = require('../models/user.js');

    var users = {};

    var devices =  express.Router();
    app.use('/api/devices', devices);
    devices.use(googleAuth);

    var assertNoErrors = function(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.status(400).send('Errors: ' + JSON.stringify(errors));
            return false;
        }

        return true;
    };

    devices.route('')
        .get(function(req, res) {
            if(users[req.user]) {
                res.status(200).send(devicesConverter.convertDevices(users[req.user].devices));
            } else {
                res.status(404).send(new Error('UserNotFound', 'The user does not exist'));
            }
        })
        .post(function(req, res) {
            req.checkBody('name', 'Must pass name').notEmpty();
            req.checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
            if(!assertNoErrors(req, res)) return;    

            // Create the user if they do not exist
            // If they do exist, then check if they own a device with the same GCM token already
            var gcmToken = req.body.gcmToken;
            var device;
            var user = users[req.user];
            if(!user) {
                console.log('Adding new user');
                user = { devices: {} };
                users[req.user] = user;
                console.log('New user added');
            } else {
                for(var currentDeviceId in user.devices) {
                    if(user.devices.hasOwnProperty(currentDeviceId)) {
                        if(user.devices[currentDeviceId].gcmToken === gcmToken) {
                            console.log('User ' + req.user + ' already has deviceId=' + currentDeviceId + ' with the same gcmToken');
                            device = user.devices[currentDeviceId];
                            break;
                        }
                    }
                }
            }

            // Add the device if it doesn't exist, and determine the response status
            var status;
            if(!device) {
                // Add the device
                var deviceId = uuid.v4();
                console.log('Adding new device with ID=' + deviceId);
                user.devices[deviceId] = {
                    gcmToken: gcmToken,
                    name: req.body.name
                };
                console.log('Added new device');

                device = new devicesConverter.Device(deviceId, req.body.name);
                status = 200;
            } else {
                status = 304;
            }
            
            res.status(status).send(device);
        });

    devices.route('/:deviceId')
        .delete(function(req, res) {
            // If the user does not exist, then return not found
            var user = users[req.user];
            if(!user) {
                console.log('User does not exist');
                res.status(404).send();
                return;
            }

            // If the device is not registered, then return not found
            if(! user.devices[req.params.deviceId]) {
                res.status(404).send('Device is not registered under this user');
                return;
            }

            // Remove the device
            delete user.devices[req.params.deviceId];
            console.log('Removed device');
            res.status(200).send();
        });

    devices.route('/:deviceId/commands')
        .post(function(req, res) {
            req.check('deviceId', 'Must pass deviceId').notEmpty();
            if(!assertNoErrors(req, res)) return;

            // If the user does not exist, then return
            var user = users[req.user];
            if(!user) {
                res.status(404).send('User does not exist');
                return;
            }

            var deviceId = req.params.deviceId;
            var device = user.devices[deviceId];
            if(!device) {
                res.status(404).send('Device does not exist');
                return;
            }

            var gcmToken = device.gcmToken;
            console.log('GCM token retrieved. gcmToken=' + gcmToken);
            if(!gcmToken) {
                res.status(404).send('Device does not exist');
                return;
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