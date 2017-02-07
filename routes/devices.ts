import Device from '../data/models/device';
import DeviceModel from '../models/device';
import ErrorModel from '../models/error-model';
import Google from '../services/google';
import googleAuth from '../auth/google-auth';
import User from '../data/models/user';
import Users from '../data/users';
import * as https from 'https';
import * as express from 'express';

/**
 * Creates the devices router.
 * TODO Strongly type the devices router.
 */
export default function() {
    let users: Users = new Users();

    var devices =  express.Router();
    devices.use(googleAuth);

    // TODO Move this into a reusable part of the pipeline
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
            let user: User = users.getUser((req as any).user);
            if(user) {
                res.status(200).send(DeviceModel.convertDevices(user.getDevices()));
            } else {
                res.status(404).send(new ErrorModel('UserNotFound', 'The user does not exist'));
            }
        })
        .post(function(req, res) {
            (req as any).checkBody('name', 'Must pass name').notEmpty();
            (req as any).checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
            if(!assertNoErrors(req, res)) return;    

            // Create the user if they do not exist
            // If they do exist, then check if they own a device with the same GCM token already
            let gcmToken: string = req.body.gcmToken;
            let user: User = users.getUser((req as any).user);
            let device: Device;
            if(user) {
                console.log('Checking for device with same GCM token');
                device = user.getDeviceByGcmToken(gcmToken);
                if (device) console.log('User already has device ID=' + device.id + ' with the same gcmToken');
            } else {
                user = users.addUser((req as any).user);
            }

            // Add the device if it doesn't exist, and determine the response status
            let status: number;
            if(!device) {
                device = user.addDevice(req.body.name, gcmToken);
                status = 200;
            } else {
                status = 304;
            }

            let deviceModel = new DeviceModel(device);
            res.status(status).send(deviceModel);
        });

    devices.route('/:deviceId')
        .delete(function(req, res) {
            // If the user does not exist, then return not found
            let user: User = users.getUser((req as any).user);
            if(!user) {
                console.log('User does not exist');
                res.status(404).send();
                return;
            }

            // If the device is not registered, then return not found
            let deletedDevice: Device = user.removeDevice(req.params.deviceId);
            if(! deletedDevice) {
                res.status(404).send('Device is not registered under this user');
                return;
            }

            console.log('Removed device');
            res.status(200).send();
        });

    devices.route('/:deviceId/commands')
        .post(function(req, res) {
            req.check('deviceId', 'Must pass deviceId').notEmpty();
            if(!assertNoErrors(req, res)) return;

            // If the user does not exist, then return
            let user: User = users.getUser((req as any).user);
            if(!user) {
                res.status(404).send('User does not exist');
                return;
            }

            let deviceId: string = req.params.deviceId;
            let device: Device = user.getDeviceById(deviceId);
            if(!device) {
                res.status(404).send('Device does not exist');
                return;
            }
        
            // TODO Make contract interface for this
            Google.sendGcmMessage(
                {
                    "type": "url",
                    "data": req.body.url,
                },
                device.gcmToken)
                .then(() => {
                    res.status(200).end();
                })
                .catch(() => {
                    res.status(500).end();
                })
        });
    return devices;
};