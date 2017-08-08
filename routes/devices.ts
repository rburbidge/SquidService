import Device from '../data/models/device';
import Devices from '../data/devices';
import DeviceModel from '../models/device';
import ErrorModel from '../models/error-model';
import { Google, MessageType } from '../services/google';
import googleAuth from '../auth/google-auth';
import User from '../data/models/user';
import * as https from 'https';
import * as express from 'express';

/** The devices router. */
export class DevicesRouter {
    /** The express router. */
    public readonly router: express.Router;

    /**
     * Creates a new instance.
     * @param devicesDb The devices database.
     */
    constructor(private readonly devicesDb: Devices) {
        this.router = express.Router();

        this.devicesDb = devicesDb;
        this.init(devicesDb);
    }

    /** Initializes the router. */
    private init(devicesDb: Devices): void {
        this.router.use(googleAuth);

        this.router.route('')
            .get((req, res) => { this.getDevices(req, res); } )
            .post((req, res) => { this.addDevice(req, res); });
        this.router.route('/:deviceId')
            .delete((req, res) => { this.deleteDevice(req, res); });
        this.router.route('/:deviceId/commands')
            .post((req, res) => { this.command(req, res); });
    }

    /**
     * Asserts that there are no erros on a request. Sends 400 error if there were any validation errors.
     * @param req The request obj.
     * @param res The response obj.
     * @returns True iff there were no errors.
     */
    private static assertNoErrors(req: express.Request, res: express.Response): boolean {
        const errors = req.validationErrors();
        if (errors) {
            res.status(400).send(new ErrorModel('BadRequest', 'Errors: ' + JSON.stringify(errors)));
            return false;
        }

        return true;
    }

    /**
     * Get the devices that a user owns.
     */
    private getDevices(req: express.Request, res: express.Response): void {
        const userId: string = (req as any).user;
        this.devicesDb.getUser(userId)
            .then((user: User) => {
                let deviceModels: DeviceModel[] = user.devices.map((value: Device) => new DeviceModel(value));
                res.status(200).send(deviceModels);    
            })
            .catch((error) => {
                res.status(404).send(new ErrorModel('UserNotFound', 'The user does not exist'));
            });
    }

    /**
     * Add a new device to a user. Creates the user if they do not exist.
     */
    private addDevice(req: express.Request, res: express.Response): void {
        (req as any).checkBody('name', 'Must pass name').notEmpty();
        (req as any).checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
        if(!DevicesRouter.assertNoErrors(req, res)) return;

        const body = req.body as AddDeviceBody;

        this.devicesDb.addDevice((req as any).user, body.name, body.gcmToken)
            .then(device => {
                let deviceModel = new DeviceModel(device);
                res.status(200).send(deviceModel);
            })
            .catch(error => {
                console.log('Add device failed: ' + error);
                res.status(500).send(new ErrorModel('Unknown', 'Device could not be added'));
            })
    }

    /**
     * Delete a user's device.
     * 
     * Returns 404 if the user/device does not exist.
     */
    private deleteDevice(req: express.Request, res: express.Response): void {
        this.devicesDb.removeDevice((req as any).user, req.params.deviceId)
            .then(() => {
                console.log('Device ' + req.params.deviceId + ' deleted');
                res.status(200).send();    
            })
            .catch(() => {
                console.log('User does not exist');
                res.status(404).send();
            });
    }

    /**
     * Sends a command to a user's device.
     * 
     * Returns 404 if the user does not exist.
     */
    private command(req: express.Request, res: express.Response): void {
        req.check('deviceId', 'Must pass deviceId').notEmpty();
        if(!DevicesRouter.assertNoErrors(req, res)) return;
        
        const deviceId: string = req.params.deviceId;

        this.devicesDb.getUser((req as any).user)
            .then(user => {
                let device: Device = user.devices.filter(d => d.id === deviceId)[0];
                if(!device) {
                    res.status(404).send('Device does not exist');
                    return;
                }

                Google.sendGcmMessage(
                    {
                        type: MessageType.Url,
                        data: req.body.url,
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
                res.status(404).send('User does not exist');
                return;
            });
    } 
}

interface AddDeviceBody {
    /** The device name. */
    name: string;

    /** The device GCM token. */
    gcmToken: string;
}

/**
 * Creates the devices express router.
 * @param devicesDb The devices database.
 */
export default function(devicesDb: Devices): express.Router {
    const router = new DevicesRouter(devicesDb);
    return router.router;
}