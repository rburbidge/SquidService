import Device from '../data/models/device';
import Devices from '../data/devices';
import DeviceModel from '../models/device';
import ErrorModel from '../models/error-model';
import Google from '../services/google';
import googleAuth from '../auth/google-auth';
import User from '../data/models/user';
import * as https from 'https';
import * as express from 'express';

/**
 * Creates the devices router.
 * TODO Strongly type the devices router.
 */
export default function(db: Devices) {
    var devices =  express.Router();
    devices.use(googleAuth);

    // TODO Move this into a reusable part of the pipeline
    var assertNoErrors = function(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            // TODO Have this return ErrorModel
            res.status(400).send('Errors: ' + JSON.stringify(errors));
            return false;
        }

        return true;
    };

    devices.route('')
        .get(function(req: any, res: any) {
            db.getUser(req.user)
                .then((user: User) => {
                    let deviceModels: DeviceModel[] = user.devices.map((value: Device) => new DeviceModel(value));
                    res.status(200).send(deviceModels);    
                })
                .catch((error) => {
                    res.status(404).send(new ErrorModel('UserNotFound', 'The user does not exist'));
                });
        })
        .post(function(req, res) {
            (req as any).checkBody('name', 'Must pass name').notEmpty();
            (req as any).checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
            if(!assertNoErrors(req, res)) return;

            db.addDevice((req as any).user, req.body.name, req.body.gcmToken)
                .then(device => {
                    let deviceModel = new DeviceModel(device);
                    res.status(200).send(deviceModel);
                })
                .catch(error => {
                    console.log('Add device failed: ' + error);
                    res.status(500).send(new ErrorModel('Unknown', 'Device could not be added'));
                })
        });

    devices.route('/:deviceId')
        .delete(function(req, res) {
            db.removeDevice((req as any).user, req.params.deviceId)
                .then(() => {
                    console.log('Device ' + req.params.deviceId + ' deleted');
                    res.status(200).send();    
                })
                .catch(() => {
                    console.log('User does not exist');
                    res.status(404).send();
                });
        });

    devices.route('/:deviceId/commands')
        .post(function(req, res) {
            req.check('deviceId', 'Must pass deviceId').notEmpty();
            if(!assertNoErrors(req, res)) return;
            
            let deviceId: string = req.params.deviceId;

            db.getUser((req as any).user)
                .then(user => {
                    let device: Device = user.devices.filter(d => d.id === deviceId)[0];
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
                        });
                })
                .catch(error => {
                    // User does not exist
                    res.status(404).send('User does not exist');
                    return;
                });
        });
    return devices;
};