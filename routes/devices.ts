import Validate from '../core/validate';
import Device from '../data/models/device';
import Devices from '../data/devices';
import DeviceModel from '../models/device';
import ErrorModel from '../models/error-model';
import { Google, MessageType } from '../services/google';
import googleAuth from '../auth/google-auth';
import User from '../data/models/user';
import * as https from 'https';
import * as express from 'express';
import * as tex from '../core/typed-express';

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
            .get((req, res) => { this.getDevices(req as any, res); })
            .post((req, res) => { this.addDevice(req as any, res); })
        this.router.route('/:deviceId')
            .delete((req, res) => { this.deleteDevice(req as any, res); });
        this.router.route('/:deviceId/commands')
            .post((req, res) => { this.command(req as any, res); });
    }

    /**
     * Get the devices that a user owns.
     */
    private getDevices(req: tex.IAuthed, res: express.Response): void {
        this.devicesDb.getUser(req.user)
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
    @Validate(
        function(req: express.Request)
        {
                req.checkBody('name', 'Must pass name').notEmpty();
                req.checkBody('gcmToken', 'Must pass gcmToken').notEmpty();
        })
    private addDevice(req: tex.IBody<IAddDeviceBody>, res: express.Response): void {
        this.devicesDb.addDevice(req.user, req.body.name, req.body.gcmToken)
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
     * Returns 404 if the user or device does not exist.
     */
    @Validate(DevicesRouter.validateDeviceId)
    private deleteDevice(req: tex.IAuthed, res: express.Response): void {
        this.devicesDb.removeDevice(req.user, req.params.deviceId)
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
    @Validate(DevicesRouter.validateDeviceId)
    private command(req: tex.IUrlParams<IDeviceUrlParams>, res: express.Response): void {
        this.devicesDb.getUser(req.user)
            .then(user => {
                let device: Device = user.devices.filter(d => d.id === req.params.deviceId)[0];
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

    /** Validates that there is a non-empty device ID URL parameter. */
    private static validateDeviceId(req: express.Request) {
        req.check('deviceId', 'Must pass deviceId').notEmpty();
    }
}

interface IDeviceUrlParams {
    /** The device ID. */
    deviceId: string
}

interface IAddDeviceBody {
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